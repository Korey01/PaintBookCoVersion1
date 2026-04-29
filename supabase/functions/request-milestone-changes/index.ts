/**
 * request-milestone-changes — Supabase Edge Function
 *
 * Validates customer ownership, reverts milestone to 'pending',
 * saves customer_notes, writes an audit log entry, and pings the
 * Make.com webhook so the painter is notified of required changes.
 *
 * Request body (JSON):
 *   { milestone_id: string, customer_notes: string }
 *
 * Response (JSON):
 *   { success: true }
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
    if (!customer_notes?.trim()) {
      return json({ error: "customer_notes is required." }, 400);
    }

    // ── Fetch milestone with job ──────────────────────────────────────────

    const { data: milestone, error: fetchError } = await supabase
      .from("job_milestones")
      .select("*, jobs!inner(id, customer_id, title, painter_id)")
      .eq("id", milestone_id)
      .single();

    if (fetchError || !milestone) {
      return json({ error: "Milestone not found." }, 404);
    }

    // Validate ownership
    if (milestone.jobs.customer_id !== user.id) {
      return json({ error: "Forbidden." }, 403);
    }

    // Only submitted milestones can be sent back
    if (milestone.status !== "submitted") {
      return json(
        {
          error: `Cannot request changes on milestone with status '${milestone.status}'.`,
        },
        422,
      );
    }

    // ── Revert milestone to pending ───────────────────────────────────────

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("job_milestones")
      .update({
        status: "pending",
        customer_notes: customer_notes.trim(),
      })
      .eq("id", milestone_id);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    // ── Audit log ─────────────────────────────────────────────────────────

    await supabase.from("audit_log").insert({
      action: "milestone_changes_requested",
      actor_id: user.id,
      actor_role: "customer",
      entity_type: "job_milestone",
      entity_id: milestone_id,
      details: {
        job_id: milestone.jobs.id,
        job_title: milestone.jobs.title,
        milestone_name: milestone.name,
        milestone_amount: milestone.amount,
        customer_notes: customer_notes.trim(),
        requested_at: now,
      },
    });

    // ── Make.com webhook ──────────────────────────────────────────────────

    const webhookUrl = Deno.env.get("MAKE_MILESTONE_CHANGES_WEBHOOK");
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "milestone_changes_requested",
            milestone_id,
            job_id: milestone.jobs.id,
            job_title: milestone.jobs.title,
            milestone_name: milestone.name,
            painter_id: milestone.jobs.painter_id,
            customer_notes: customer_notes.trim(),
            requested_at: now,
          }),
        });
      } catch (webhookError) {
        console.error("Make.com webhook failed:", webhookError);
      }
    }

    return json({ success: true });
  } catch (err) {
    console.error("request-milestone-changes error:", err);
    return json({ error: (err as Error).message ?? "Internal error." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
