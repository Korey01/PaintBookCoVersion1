/**
 * submit-review — Supabase Edge Function
 *
 * Validates and persists a customer review for a completed job.
 *
 * Validation:
 *   - Valid customer JWT
 *   - Job exists and belongs to this customer
 *   - job.status = 'completed'
 *   - No existing review for this job from this customer
 *   - Rating between 1 and 5
 *   - Review text at least 20 characters
 *
 * Request body: { job_id, painter_id, rating, review_text }
 * Response:     { success: true, review_id }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized." }, 401);

    // ── Parse and validate body ───────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { job_id, painter_id, rating, review_text } = body as {
      job_id?: string;
      painter_id?: string;
      rating?: unknown;
      review_text?: string;
    };

    if (!job_id) return json({ error: "job_id is required." }, 400);
    if (!painter_id) return json({ error: "painter_id is required." }, 400);

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return json({ error: "Rating must be a whole number between 1 and 5." }, 400);
    }

    const text = (review_text ?? "").trim();
    if (text.length < 20) {
      return json({ error: "Review must be at least 20 characters." }, 400);
    }

    // ── Service client for DB reads/writes ────────────────────
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // ── Validate job ──────────────────────────────────────────
    const { data: job, error: jobErr } = await serviceClient
      .from("jobs")
      .select("id, customer_id, assigned_painter_id, status")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) {
      return json({ error: "Job not found." }, 404);
    }

    if (job.customer_id !== user.id) {
      return json({ error: "You do not own this job." }, 403);
    }

    if (job.status !== "completed") {
      return json(
        { error: "Reviews can only be submitted for completed jobs." },
        400,
      );
    }

    if (job.assigned_painter_id !== painter_id) {
      return json({ error: "Painter does not match this job." }, 400);
    }

    // ── Check for duplicate review ────────────────────────────
    const { count: existingCount } = await serviceClient
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("job_id", job_id)
      .eq("customer_id", user.id);

    if ((existingCount ?? 0) > 0) {
      return json(
        { error: "You have already reviewed this job." },
        409,
      );
    }

    // ── Insert review ─────────────────────────────────────────
    const { data: review, error: insertErr } = await serviceClient
      .from("reviews")
      .insert({
        job_id,
        customer_id: user.id,
        painter_id,
        rating: ratingNum,
        review_text: text,
      })
      .select("id")
      .single();

    if (insertErr || !review) {
      console.error("Review insert error:", insertErr?.message);
      return json({ error: "Failed to save review. Please try again." }, 500);
    }

    // ── Audit log ─────────────────────────────────────────────
    await serviceClient.from("audit_log").insert({
      action: "review_submitted",
      actor_id: user.id,
      actor_role: "customer",
      entity_type: "review",
      entity_id: review.id,
      details: { job_id, painter_id, rating: ratingNum },
    });

    return json({ success: true, review_id: review.id });
  } catch (err) {
    console.error("submit-review error:", err);
    return json({ error: "Internal server error." }, 500);
  }
});

// ── Utility ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
