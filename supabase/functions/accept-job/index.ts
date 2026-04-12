/**
 * accept-job — Supabase Edge Function
 *
 * Atomically assigns an available job to the calling painter,
 * auto-declines other matched painters, writes an audit log,
 * and triggers a Make.com webhook for customer notification.
 *
 * Uses SELECT FOR UPDATE NOWAIT to prevent two painters
 * accepting the same job simultaneously.
 *
 * Request body (JSON):
 *   { job_id: string }
 *
 * Response (JSON):
 *   { success: true, job_id: string }
 *   | { success: false, message: string }
 *   | { error: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ───────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorisation header." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated." }, 401);

    // ── Fetch painter record ───────────────────────────────────
    const { data: painter, error: painterError } = await supabase
      .from("painters")
      .select("id, kyc_status")
      .eq("user_id", user.id)
      .single();

    if (painterError || !painter) return json({ error: "Painter record not found." }, 404);
    if (painter.kyc_status !== "approved") {
      return json({ error: "KYC not approved. You cannot accept jobs." }, 403);
    }

    // ── Parse body ─────────────────────────────────────────────
    const { job_id } = await req.json();
    if (!job_id) return json({ error: "job_id is required." }, 400);

    // ── Service-role client for transaction ───────────────────
    // We use the service role key (available as env var) to
    // execute the FOR UPDATE NOWAIT lock safely server-side.
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Verify this painter was matched to this job ────────────
    const { data: match } = await serviceClient
      .from("job_matches")
      .select("id, status")
      .eq("job_id", job_id)
      .eq("painter_id", painter.id)
      .single();

    if (!match || match.status !== "notified") {
      return json({
        success: false,
        message: "This job is no longer available to you.",
      });
    }

    // ── Fetch job to check status ──────────────────────────────
    const { data: job } = await serviceClient
      .from("jobs")
      .select("id, status, title, customer_id")
      .eq("id", job_id)
      .single();

    if (!job) return json({ error: "Job not found." }, 404);

    if (job.status !== "pending_match" && job.status !== "matching_in_progress") {
      return json({
        success: false,
        message: "This job was just accepted by another painter. Please check your available jobs.",
      });
    }

    // ── Accept job ─────────────────────────────────────────────
    const now = new Date().toISOString();

    // 1. Assign painter and update job status
    const { error: jobUpdateError } = await serviceClient
      .from("jobs")
      .update({
        status: "painter_accepted",
        assigned_painter_id: painter.id,
        painter_id: painter.id,
        updated_at: now,
      })
      .eq("id", job_id)
      .in("status", ["pending_match", "matching_in_progress"]);

    if (jobUpdateError) {
      // Another painter got there first
      return json({
        success: false,
        message: "This job was just accepted by another painter. Please check your available jobs.",
      });
    }

    // 2. Accept this painter's match
    await serviceClient
      .from("job_matches")
      .update({ status: "accepted", responded_at: now })
      .eq("job_id", job_id)
      .eq("painter_id", painter.id);

    // 3. Auto-decline other painters' matches
    await serviceClient
      .from("job_matches")
      .update({ status: "declined_auto", responded_at: now })
      .eq("job_id", job_id)
      .neq("painter_id", painter.id)
      .eq("status", "notified");

    // 4. Audit log
    await serviceClient.from("audit_log").insert({
      action: "job_accepted",
      actor_id: painter.id,
      actor_role: "painter",
      entity_type: "job",
      entity_id: job_id,
      details: {
        job_title: job.title,
        painter_id: painter.id,
        customer_id: job.customer_id,
        accepted_at: now,
      },
    });

    // 5. Make.com webhook (non-fatal)
    const webhookUrl = Deno.env.get("MAKE_PAINTER_ACCEPTED_WEBHOOK");
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "job_accepted",
            job_id,
            job_title: job.title,
            painter_id: painter.id,
            customer_id: job.customer_id,
            accepted_at: now,
          }),
        });
      } catch (e) {
        console.error("Make.com webhook failed:", e);
      }
    }

    return json({ success: true, job_id });
  } catch (err) {
    console.error("accept-job error:", err);
    return json({ error: (err as Error).message ?? "Internal error." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
