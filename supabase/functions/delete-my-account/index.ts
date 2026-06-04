/**
 * delete-my-account — Supabase Edge Function
 *
 * Right to Erasure (UK GDPR Art. 17).
 * Anonymises personal data rather than hard-deleting, preserving
 * financial and transaction records for the 7-year statutory period.
 *
 * Blocked by active jobs or open disputes.
 *
 * Steps (in order):
 *   1. Validate — no active jobs, no open disputes
 *   2. Capture current email for confirmation email
 *   3. Send SendGrid confirmation email
 *   4. Anonymise auth.users via admin API
 *   5. Anonymise painters record (if painter)
 *   6. Delete notification_preferences
 *   7. Write audit_log
 *   8. Return { success: true }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.paintbookco.co.uk",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// ── Job statuses that block deletion ──────────────────────────────────────────

const ACTIVE_STATUSES = [
  "pending_match",
  "matching_in_progress",
  "painter_accepted",
  "awaiting_payment",
  "escrow_funded",
  "in_progress",
  "milestone_review",
  "pending_completion",
];

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const contactEmail = Deno.env.get("CONTACT_EMAIL") ?? "hello@paintbookco.co.uk";

    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized." }, 401);

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;
    const now = new Date().toISOString();

    // ── Detect painter ────────────────────────────────────────
    const { data: painter } = await serviceClient
      .from("painters")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    // ── Validate: no active jobs ──────────────────────────────
    const customerActiveQuery = serviceClient
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId)
      .in("status", ACTIVE_STATUSES);

    const painterActiveQuery = painter
      ? serviceClient
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("assigned_painter_id", painter.id)
          .in("status", ACTIVE_STATUSES)
      : Promise.resolve({ count: 0 });

    const [{ count: cActive }, { count: pActive }] = await Promise.all([
      customerActiveQuery,
      painterActiveQuery,
    ]);

    if ((cActive ?? 0) + (pActive ?? 0) > 0) {
      return json(
        {
          error:
            "You have active jobs. Please complete or cancel all jobs " +
            "before deleting your account.",
        },
        400,
      );
    }

    // ── Validate: no open disputes ────────────────────────────
    const customerDisputeQuery = serviceClient
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId)
      .eq("status", "disputed");

    const painterDisputeQuery = painter
      ? serviceClient
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("assigned_painter_id", painter.id)
          .eq("status", "disputed")
      : Promise.resolve({ count: 0 });

    const [{ count: cDisputes }, { count: pDisputes }] = await Promise.all([
      customerDisputeQuery,
      painterDisputeQuery,
    ]);

    if ((cDisputes ?? 0) + (pDisputes ?? 0) > 0) {
      return json(
        {
          error:
            "You have open disputes. Please wait for resolution " +
            "before deleting your account.",
        },
        400,
      );
    }

    // ── Capture current email before anonymising ──────────────
    const originalEmail = user.email ?? "";

    // ── Send confirmation email via SendGrid ──────────────────
    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    if (sendgridKey && originalEmail) {
      await sendDeletionEmail(originalEmail, sendgridKey).catch((e) =>
        console.error("SendGrid deletion email failed:", e),
      );
    }

    // ── Anonymise auth.users ──────────────────────────────────
    const { error: updateUserErr } = await serviceClient.auth.admin.updateUserById(
      userId,
      {
        email: `deleted_${userId}@deleted.paintbookco.co.uk`,
        user_metadata: {},
      },
    );

    if (updateUserErr) {
      console.error("auth.users anonymise error:", updateUserErr.message);
      return json({ error: "Failed to process account deletion. Please contact support." }, 500);
    }

    // ── Anonymise painters record ─────────────────────────────
    if (painter) {
      const { error: painterErr } = await serviceClient
        .from("painters")
        .update({
          first_name: "Deleted",
          last_name: "User",
          email: "deleted@deleted.paintbookco.co.uk",
          phone: null,
          address: null,
          bio: null,
          is_active: false,
          kyc_status: "rejected",
          bank_account_holder: null,
          bank_sort_code: null,
          bank_account_number: null,
        })
        .eq("user_id", userId);

      if (painterErr) {
        console.error("painters anonymise error:", painterErr.message);
        // Non-fatal — auth record already anonymised
      }
    }

    // ── Delete notification preferences ───────────────────────
    await serviceClient
      .from("notification_preferences")
      .delete()
      .eq("user_id", userId);

    // ── Audit log ─────────────────────────────────────────────
    await serviceClient.from("audit_log").insert({
      action: "account_deleted",
      actor_id: userId,
      actor_role: painter ? "painter" : "customer",
      entity_type: "user",
      entity_id: userId,
      details: {
        deletion_type: "user_requested",
        deleted_at: now,
        was_painter: !!painter,
      },
    });

    return json({ success: true });
  } catch (err) {
    console.error("delete-my-account error:", err);
    return json({ error: "Internal server error." }, 500);
  }
});

// ── SendGrid deletion confirmation ────────────────────────────────────────────

async function sendDeletionEmail(
  toEmail: string,
  apiKey: string,
): Promise<void> {
  const body = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        subject: "Your PaintBookCo account has been deleted",
      },
    ],
    from: {
      email: Deno.env.get("ADMIN_EMAIL") ?? "",
      name: "PaintBookCo",
    },
    content: [
      {
        type: "text/plain",
        value: [
          "Your account has been successfully deleted.",
          "",
          "Your personal details have been removed from our platform.",
          "Financial transaction records are retained for 7 years as required by UK law.",
          "",
          "If you did not request this deletion please contact",
          `${contactEmail} immediately.`,
          "",
          "The PaintBookCo Team",
        ].join("\n"),
      },
      {
        type: "text/html",
        value: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: #1B3A5C; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; font-size: 18px; margin: 0;">PaintBookCo</h1>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Your account has been successfully deleted.</p>
    <p>Your personal details have been removed from our platform.
       Financial transaction records are retained for 7 years as required by UK law.</p>
    <p style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; font-size: 13px;">
      If you did not request this deletion, please contact
      <a href="mailto:${contactEmail}" style="color: #1B3A5C;">
        ${contactEmail}
      </a> immediately.
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
    throw new Error(`SendGrid error ${res.status}: ${errText}`);
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
