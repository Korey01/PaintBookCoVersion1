/**
 * approve-milestone — Supabase Edge Function
 *
 * Validates customer ownership, updates milestone to 'approved',
 * writes an audit log entry, and pings the Make.com webhook so the
 * painter receives an automatic notification.
 *
 * NOTE: Transpact payment release is NOT included in this function.
 * It will be wired in a separate sprint when Transpact sandbox
 * credentials are confirmed working end-to-end.
 *
 * Request body (JSON):
 *   { milestone_id: string, customer_notes?: string }
 *
 * Response (JSON):
 *   { success: true, milestone_id: string }
 *   | { error: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.paintbookco.co.uk",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorisation header." }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json({ error: "Unauthenticated." }, 401);
    }

    // ── Parse body ────────────────────────────────────────────────────────

    const { milestone_id, customer_notes } = await req.json();
    if (!milestone_id) {
      return json({ error: "milestone_id is required." }, 400);
    }

    // ── Fetch milestone with job ──────────────────────────────────────────

    const { data: milestone, error: fetchError } = await supabase
      .from("job_milestones")
      .select("*, jobs!inner(id, customer_id, title)")
      .eq("id", milestone_id)
      .single();

    if (fetchError || !milestone) {
      return json({ error: "Milestone not found." }, 404);
    }

    // Validate ownership
    if (milestone.jobs.customer_id !== user.id) {
      return json({ error: "Forbidden." }, 403);
    }

    // Validate status
    if (milestone.status !== "submitted") {
      return json(
        { error: `Cannot approve milestone with status '${milestone.status}'.` },
        422,
      );
    }

    // ── Approve milestone ─────────────────────────────────────────────────

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("job_milestones")
      .update({
        status: "approved",
        approved_at: now,
        customer_notes: customer_notes ?? milestone.customer_notes ?? null,
      })
      .eq("id", milestone_id);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    // ── Audit log ─────────────────────────────────────────────────────────

    await supabase.from("audit_log").insert({
      action: "milestone_approved",
      actor_id: user.id,
      actor_role: "customer",
      entity_type: "job_milestone",
      entity_id: milestone_id,
      details: {
        job_id: milestone.jobs.id,
        job_title: milestone.jobs.title,
        milestone_name: milestone.name,
        milestone_amount: milestone.amount,
        approved_at: now,
        // NOTE: Transpact release deferred to payment sprint
        transpact_release: "deferred",
      },
    });

    // ── Make.com webhook ──────────────────────────────────────────────────

    const webhookUrl = Deno.env.get("MAKE_MILESTONE_APPROVED_WEBHOOK");
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "milestone_approved",
            milestone_id,
            job_id: milestone.jobs.id,
            job_title: milestone.jobs.title,
            milestone_name: milestone.name,
            milestone_amount: milestone.amount,
            customer_id: user.id,
            approved_at: now,
          }),
        });
      } catch (webhookError) {
        // Non-fatal — log but don't fail the request
        console.error("Make.com webhook failed:", webhookError);
      }
    }

    return json({ success: true, milestone_id });
  } catch (err) {
    console.error("approve-milestone error:", err);
    return json({ error: (err as Error).message ?? "Internal error." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
