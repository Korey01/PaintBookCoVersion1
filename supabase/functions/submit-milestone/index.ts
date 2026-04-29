/**
 * submit-milestone — Supabase Edge Function
 *
 * Validates painter ownership, marks milestone as 'submitted',
 * writes audit log, and triggers Make.com webhook to notify
 * the customer to review the milestone.
 *
 * NOTE: Transpact payment release is handled in a separate sprint.
 * This function only advances the milestone workflow state.
 *
 * Request body (JSON):
 *   { milestone_id: string, painter_notes: string }
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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (painterError || !painter) return json({ error: "Painter record not found." }, 404);

    // ── Parse body ─────────────────────────────────────────────
    const { milestone_id, painter_notes } = await req.json();
    if (!milestone_id) return json({ error: "milestone_id is required." }, 400);
    if (!painter_notes?.trim()) return json({ error: "painter_notes is required." }, 400);

    // ── Fetch milestone with job ───────────────────────────────
    const { data: milestone, error: fetchError } = await supabase
      .from("job_milestones")
      .select("*, jobs!inner(id, assigned_painter_id, customer_id, title)")
      .eq("id", milestone_id)
      .single();

    if (fetchError || !milestone) return json({ error: "Milestone not found." }, 404);

    // Validate painter is assigned to this job
    if (milestone.jobs.assigned_painter_id !== painter.id) {
      return json({ error: "Forbidden." }, 403);
    }

    // Validate milestone is in 'pending' state
    if (milestone.status !== "pending") {
      return json(
        { error: `Cannot submit milestone with status '${milestone.status}'.` },
        422,
      );
    }

    // ── Submit milestone ───────────────────────────────────────
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("job_milestones")
      .update({
        status: "submitted",
        submitted_at: now,
        painter_notes: painter_notes.trim(),
      })
      .eq("id", milestone_id);

    if (updateError) throw new Error(`Update failed: ${updateError.message}`);

    // ── Audit log ──────────────────────────────────────────────
    await supabase.from("audit_log").insert({
      action: "milestone_submitted",
      actor_id: painter.id,
      actor_role: "painter",
      entity_type: "job_milestone",
      entity_id: milestone_id,
      details: {
        job_id: milestone.jobs.id,
        job_title: milestone.jobs.title,
        milestone_name: milestone.name,
        milestone_number: milestone.milestone_number,
        amount: milestone.amount,
        submitted_at: now,
      },
    });

    // ── Make.com webhook ───────────────────────────────────────
    const webhookUrl = Deno.env.get("MAKE_MILESTONE_SUBMITTED_WEBHOOK");
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "milestone_submitted",
            milestone_id,
            job_id: milestone.jobs.id,
            job_title: milestone.jobs.title,
            customer_id: milestone.jobs.customer_id,
            painter_id: painter.id,
            milestone_name: milestone.name,
            amount: milestone.amount,
            submitted_at: now,
          }),
        });
      } catch (e) {
        console.error("Make.com webhook failed:", e);
      }
    }

    return json({ success: true, milestone_id });
  } catch (err) {
    console.error("submit-milestone error:", err);
    return json({ error: (err as Error).message ?? "Internal error." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
