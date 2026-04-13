/**
 * match-job-to-painters — Supabase Edge Function
 *
 * Core job matching engine for PaintBookCo.
 *
 * Triggered by:
 *   1. Supabase Database Webhook (pg_net trigger on jobs INSERT)
 *   2. Make.com scenario (service role key in Authorization header)
 *
 * Flow:
 *   1. Validate service role authentication
 *   2. Fetch job record and validate state
 *   3. Run PostGIS proximity + eligibility query (top 5 painters)
 *   4. Insert job_matches rows
 *   5. Send SendGrid email notification to each painter
 *   6. Update job status → 'matching_in_progress'
 *   7. Write audit log
 *   8. Zero-match fallback: notify customer + Make.com webhook
 *
 * Request body (JSON):
 *   { job_id: string }
 *
 * Response (JSON):
 *   { success: true, matched: number, job_id: string }
 *   | { error: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://paintbook-app.netlify.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface MatchedPainter {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avg_rating: number;
  completed_jobs: number;
  response_time_hours: number;
  distance_km: number;
}

interface JobRecord {
  id: string;
  customer_id: string;
  title: string;
  type: string;
  description: string | null;
  property_address: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  location: string | null; // geography WKT or GeoJSON
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: require service role key ────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      return json({ error: "Forbidden." }, 403);
    }

    // ── Parse body ────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { job_id } = body as { job_id?: string };

    if (!job_id) {
      return json({ error: "job_id is required." }, 400);
    }

    // ── Service-role Supabase client ──────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey,
    );

    // ── Fetch job ─────────────────────────────────────────────
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) {
      return json({ error: "Job not found." }, 404);
    }

    const jobRecord = job as JobRecord;

    // Guard: only match jobs in pending_match state
    if (
      jobRecord.status !== "pending_match" &&
      jobRecord.status !== "matching_in_progress"
    ) {
      if (
        jobRecord.status === "painter_accepted" ||
        jobRecord.status === "escrow_funded" ||
        jobRecord.status === "in_progress" ||
        jobRecord.status === "completed"
      ) {
        return json(
          { error: "Job already in matching process." },
          400,
        );
      }
    }

    // ── PostGIS matching query ────────────────────────────────
    // Runs entirely in Postgres via rpc to keep geography math
    // server-side. Falls back gracefully if location is null.

    let matchedPainters: MatchedPainter[] = [];

    if (jobRecord.location && jobRecord.start_date && jobRecord.type) {
      const { data: painters, error: queryErr } = await supabase.rpc(
        "match_painters_for_job",
        {
          p_job_location: jobRecord.location,
          p_job_type: jobRecord.type,
          p_start_date: jobRecord.start_date,
          p_job_id: job_id,
        },
      );

      if (queryErr) {
        console.error("Matching query error:", queryErr.message);
        // Non-fatal: fall through to zero-match handler
      } else {
        matchedPainters = (painters as MatchedPainter[]) ?? [];
      }
    } else {
      // Location or dates not set — log and fall through
      console.warn(
        `Job ${job_id} has no location/start_date/type set. Skipping geographic match.`,
      );
    }

    const now = new Date().toISOString();

    // ── Zero matches ──────────────────────────────────────────
    if (matchedPainters.length === 0) {
      await Promise.all([
        // Update job status
        supabase
          .from("jobs")
          .update({ status: "no_match_found", updated_at: now })
          .eq("id", job_id),

        // Audit log
        supabase.from("audit_log").insert({
          action: "job_matching_no_painters_found",
          actor_role: "system",
          entity_type: "job",
          entity_id: job_id,
          details: {
            job_title: jobRecord.title,
            job_type: jobRecord.type,
            start_date: jobRecord.start_date,
            timestamp: now,
          },
        }),
      ]);

      // Notify customer
      await sendCustomerNoMatchEmail(jobRecord);

      // Make.com webhook
      const noMatchWebhook = Deno.env.get("MAKE_NO_MATCH_WEBHOOK");
      if (noMatchWebhook) {
        await fetch(noMatchWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "no_match_found",
            job_id,
            job_title: jobRecord.title,
            job_type: jobRecord.type,
            customer_id: jobRecord.customer_id,
            timestamp: now,
          }),
        }).catch((e) => console.error("Make.com no-match webhook failed:", e));
      }

      return json({ success: true, matched: 0, job_id });
    }

    // ── Insert job_matches ────────────────────────────────────
    const matchRows = matchedPainters.map((p) => ({
      job_id,
      painter_id: p.id,
      status: "notified",
      notified_at: now,
    }));

    const { error: matchInsertErr } = await supabase
      .from("job_matches")
      .insert(matchRows);

    if (matchInsertErr) {
      console.error("job_matches insert error:", matchInsertErr.message);
      throw new Error("Failed to insert job matches.");
    }

    // ── Send painter notification emails ──────────────────────
    const emailResults = await Promise.allSettled(
      matchedPainters.map((p) =>
        sendPainterNotificationEmail(p, jobRecord),
      ),
    );

    emailResults.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(
          `Email failed for painter ${matchedPainters[i].id}:`,
          r.reason,
        );
      }
    });

    // ── Update job status ─────────────────────────────────────
    await supabase
      .from("jobs")
      .update({ status: "matching_in_progress", updated_at: now })
      .eq("id", job_id);

    // ── Audit log ─────────────────────────────────────────────
    await supabase.from("audit_log").insert({
      action: "job_matching_started",
      actor_role: "system",
      entity_type: "job",
      entity_id: job_id,
      details: {
        job_title: jobRecord.title,
        job_type: jobRecord.type,
        matched_count: matchedPainters.length,
        painter_ids: matchedPainters.map((p) => p.id),
        timestamp: now,
      },
    });

    return json({ success: true, matched: matchedPainters.length, job_id });
  } catch (err) {
    console.error("match-job-to-painters error:", err);
    // Never expose internal error details externally
    return json({ error: "Internal server error." }, 500);
  }
});

// ── SendGrid: painter notification email ──────────────────────────────────────

async function sendPainterNotificationEmail(
  painter: MatchedPainter,
  job: JobRecord,
): Promise<void> {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) {
    console.warn("SENDGRID_API_KEY not set — skipping email.");
    return;
  }

  if (!painter.email) {
    console.warn(`Painter ${painter.id} has no email — skipping.`);
    return;
  }

  const painterName = [painter.first_name, painter.last_name]
    .filter(Boolean)
    .join(" ") || "there";

  // General area only — never expose full address before escrow
  const generalArea = job.property_address
    ? job.property_address.split(",").slice(-2).join(",").trim()
    : "your service area";

  const startDate = job.start_date
    ? new Date(job.start_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be confirmed";

  const endDate = job.end_date
    ? new Date(job.end_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be confirmed";

  const body = {
    personalizations: [
      {
        to: [{ email: painter.email }],
        subject: "New job available — PaintBookCo",
      },
    ],
    from: {
      email: "o.a.alashe@paintbookco.co.uk",
      name: "PaintBookCo",
    },
    content: [
      {
        type: "text/plain",
        value: [
          `Hi ${painterName},`,
          "",
          "A new job matching your skills is available in your area.",
          "",
          `Job: ${job.title}`,
          `Type: ${job.type}`,
          `Area: ${generalArea}`,
          `Requested dates: ${startDate} to ${endDate}`,
          "",
          "Log in to accept this job:",
          "paintbookco.co.uk/dashboard/painter",
          "",
          "You have 48 hours to respond before this opportunity expires.",
          "",
          "The PaintBookCo Team",
        ].join("\n"),
      },
      {
        type: "text/html",
        value: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: #1B3A5C; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; font-size: 18px; margin: 0;">PaintBookCo</h1>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">Hi <strong>${painterName}</strong>,</p>
    <p style="margin: 0 0 16px;">A new job matching your skills is available in your area.</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px;">
      <tr>
        <td style="padding: 10px 14px; font-weight: bold; font-size: 13px; color: #1B3A5C; border-bottom: 1px solid #f0f0f0; width: 110px;">Job</td>
        <td style="padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${job.title}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: bold; font-size: 13px; color: #1B3A5C; border-bottom: 1px solid #f0f0f0;">Type</td>
        <td style="padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${job.type}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: bold; font-size: 13px; color: #1B3A5C; border-bottom: 1px solid #f0f0f0;">Area</td>
        <td style="padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${generalArea}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-weight: bold; font-size: 13px; color: #1B3A5C;">Dates</td>
        <td style="padding: 10px 14px; font-size: 13px;">${startDate} to ${endDate}</td>
      </tr>
    </table>
    <a href="https://paintbookco.co.uk/dashboard/painter"
       style="display: inline-block; background: #1B3A5C; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
      View &amp; Accept Job
    </a>
    <p style="margin: 20px 0 0; font-size: 12px; color: #888;">
      You have <strong>48 hours</strong> to respond before this opportunity expires.
    </p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
    <p style="margin: 0; font-size: 11px; color: #aaa;">
      The PaintBookCo Team · paintbookco.co.uk
    </p>
  </div>
</body>
</html>`,
      },
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "(unreadable)");
    throw new Error(`SendGrid error ${res.status}: ${errText}`);
  }
}

// ── SendGrid: customer no-match email ─────────────────────────────────────────

async function sendCustomerNoMatchEmail(job: JobRecord): Promise<void> {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) return;

  // Fetch customer email from auth.users via service-role client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!,
  );

  const { data: userData } = await supabase.auth.admin.getUserById(
    job.customer_id,
  );

  const customerEmail = userData?.user?.email;
  if (!customerEmail) {
    console.warn(`No email for customer ${job.customer_id} — skipping no-match email.`);
    return;
  }

  const body = {
    personalizations: [
      {
        to: [{ email: customerEmail }],
        subject: "Update on your PaintBookCo job",
      },
    ],
    from: {
      email: "o.a.alashe@paintbookco.co.uk",
      name: "PaintBookCo",
    },
    content: [
      {
        type: "text/plain",
        value: [
          "Hi,",
          "",
          `Thank you for posting your job "${job.title}" on PaintBookCo.`,
          "",
          "We are still finding the right painter for your job.",
          "Our team has been alerted and will follow up shortly.",
          "",
          "If you have any questions in the meantime, please contact us at hello@paintbookco.co.uk.",
          "",
          "The PaintBookCo Team",
        ].join("\n"),
      },
      {
        type: "text/html",
        value: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: #1B3A5C; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; font-size: 18px; margin: 0;">PaintBookCo</h1>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi,</p>
    <p>Thank you for posting <strong>${job.title}</strong> on PaintBookCo.</p>
    <p>We are still finding the right painter for your job. Our team has been alerted and will follow up shortly.</p>
    <p>If you have any questions in the meantime, please contact us at
      <a href="mailto:hello@paintbookco.co.uk" style="color: #2E75B6;">hello@paintbookco.co.uk</a>.
    </p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
    <p style="margin: 0; font-size: 11px; color: #aaa;">The PaintBookCo Team · paintbookco.co.uk</p>
  </div>
</body>
</html>`,
      },
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "(unreadable)");
    console.error(`SendGrid customer email error ${res.status}: ${errText}`);
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
