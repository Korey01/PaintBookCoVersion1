import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { customer_token, session_id, rating, review_text } = await req.json();

    if (!customer_token || !session_id || !rating || !review_text) {
      return json({ error: "customer_token, session_id, rating and review_text are required" }, 400);
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json({ error: "Rating must be an integer between 1 and 5" }, 400);
    }

    const trimmed = review_text.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      return json({ error: "Review must be between 10 and 500 characters" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Validate customer_token against session
    const { data: session, error: sessErr } = await supabase
      .from("sessions")
      .select("id, status, painter_id, customer_token")
      .eq("customer_token", customer_token)
      .eq("id", session_id)
      .single();

    if (sessErr || !session) {
      return json({ error: "Invalid or expired link" }, 401);
    }

    if (session.status !== "completed") {
      return json({ error: "Job must be completed before leaving a review" }, 400);
    }

    if (!session.painter_id) {
      return json({ error: "No painter assigned to this job" }, 400);
    }

    // Prevent duplicate reviews
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existing) {
      return json({ error: "You have already reviewed this job" }, 400);
    }

    // Insert review
    const { error: insertErr } = await supabase.from("reviews").insert({
      painter_id: session.painter_id,
      job_id: session_id,
      rating,
      review_text: trimmed,
      created_at: new Date().toISOString(),
    });

    if (insertErr) {
      return json({ error: "Failed to save review: " + insertErr.message }, 500);
    }

    // Recalculate painter average rating
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("painter_id", session.painter_id);

    if (allReviews && allReviews.length > 0) {
      const avg =
        allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
        allReviews.length;
      await supabase
        .from("painters")
        .update({ avg_rating: Math.round(avg * 10) / 10 })
        .eq("id", session.painter_id);
    }

    return json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: msg }, 500);
  }
});
