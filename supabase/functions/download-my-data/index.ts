/**
 * download-my-data — Supabase Edge Function
 *
 * Subject Access Request (UK GDPR Art. 15).
 * Collects all personal data for the authenticated user and returns
 * it as a downloadable JSON file.
 *
 * Detects whether the user is a painter (has a painters record) or a
 * customer, and returns the appropriate data set. Bank details are
 * excluded from painter exports.
 *
 * Response: application/json with Content-Disposition: attachment
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
      Deno.env.get("ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized." }, 401);

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;
    const exportedAt = new Date().toISOString();

    // ── Account record ────────────────────────────────────────
    const account = {
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      last_sign_in: user.last_sign_in_at ?? null,
    };

    // ── Detect painter ────────────────────────────────────────
    const { data: painterRecord } = await serviceClient
      .from("painters")
      .select(
        "id, first_name, last_name, email, phone, address, bio, " +
        "kyc_status, avg_rating, completed_jobs, specialisms, " +
        "service_radius_km, available_from, available_to, " +
        "is_active, insurance_expiry, insurance_insurer, " +
        "response_time_hours, created_at, updated_at",
        // bank_account_holder, bank_sort_code, bank_account_number intentionally excluded
      )
      .eq("user_id", userId)
      .maybeSingle();

    const isPainter = !!painterRecord;

    // ── Jobs ──────────────────────────────────────────────────
    let jobsData: unknown[] = [];
    if (isPainter && painterRecord) {
      const { data } = await serviceClient
        .from("jobs")
        .select(
          "id, title, type, description, property_address, start_date, " +
          "end_date, budget, total_price, status, materials_arrangement, " +
          "escrow_funded, vestimator_estimate, created_at, updated_at",
        )
        .eq("assigned_painter_id", painterRecord.id)
        .order("created_at", { ascending: false });
      jobsData = data ?? [];
    } else {
      const { data } = await serviceClient
        .from("jobs")
        .select(
          "id, title, type, description, property_address, start_date, " +
          "end_date, budget, total_price, status, materials_arrangement, " +
          "escrow_funded, transpact_transaction_id, vestimator_estimate, " +
          "created_at, updated_at",
        )
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });
      jobsData = data ?? [];
    }

    // ── Reviews ───────────────────────────────────────────────
    let reviewsData: unknown[] = [];
    if (isPainter && painterRecord) {
      // Reviews received as a painter
      const { data } = await serviceClient
        .from("reviews")
        .select("id, job_id, rating, review_text, created_at")
        .eq("painter_id", painterRecord.id)
        .order("created_at", { ascending: false });
      reviewsData = data ?? [];
    } else {
      // Reviews submitted as a customer
      const { data } = await serviceClient
        .from("reviews")
        .select("id, job_id, painter_id, rating, review_text, created_at")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });
      reviewsData = data ?? [];
    }

    // ── Milestones ────────────────────────────────────────────
    const jobIds = (jobsData as { id: string }[]).map((j) => j.id);
    let milestonesData: unknown[] = [];
    if (jobIds.length > 0) {
      const { data } = await serviceClient
        .from("job_milestones")
        .select(
          "id, job_id, milestone_number, name, description, amount, " +
          "status, submitted_at, approved_at, paid_at, " +
          "painter_notes, customer_notes, created_at",
        )
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
      milestonesData = data ?? [];
    }

    // ── Job matches (painter only) ────────────────────────────
    let jobMatchesData: unknown[] = [];
    if (isPainter && painterRecord) {
      const { data } = await serviceClient
        .from("job_matches")
        .select("id, job_id, status, notified_at, responded_at")
        .eq("painter_id", painterRecord.id)
        .order("notified_at", { ascending: false });
      jobMatchesData = data ?? [];
    }

    // ── Notification preferences ──────────────────────────────
    const { data: notifPrefs } = await serviceClient
      .from("notification_preferences")
      .select(
        "email_reviews, email_jobs, email_milestones, " +
        "email_disputes, email_marketing",
      )
      .eq("user_id", userId)
      .maybeSingle();

    // ── Activity log ──────────────────────────────────────────
    const { data: activityLog } = await serviceClient
      .from("audit_log")
      .select("id, action, actor_role, entity_type, entity_id, details, created_at")
      .eq("actor_id", userId)
      .order("created_at", { ascending: false })
      .limit(1000);

    // ── Compile export payload ────────────────────────────────
    const exportPayload = {
      exported_at: exportedAt,
      user_id: userId,
      account,
      profile: isPainter ? painterRecord : null,
      jobs: jobsData,
      ...(isPainter ? { job_matches: jobMatchesData } : {}),
      reviews: reviewsData,
      milestones: milestonesData,
      notification_preferences: notifPrefs ?? null,
      activity_log: activityLog ?? [],
    };

    // ── Audit log ─────────────────────────────────────────────
    await serviceClient.from("audit_log").insert({
      action: "data_export_requested",
      actor_id: userId,
      actor_role: isPainter ? "painter" : "customer",
      entity_type: "user",
      entity_id: userId,
      details: { exported_at: exportedAt, record_counts: {
        jobs: jobsData.length,
        reviews: reviewsData.length,
        milestones: milestonesData.length,
      }},
    });

    // ── Return downloadable JSON ──────────────────────────────
    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition":
          'attachment; filename="paintbookco-data-export.json"',
      },
    });
  } catch (err) {
    console.error("download-my-data error:", err);
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
