/**
 * auto-release-escrow — checks for transactions awaiting 48h auto-release
 *
 * Called by a scheduled job (Make.com or Supabase pg_cron) every hour.
 * Finds transactions with status = completion_requested where
 * completion_requested_at is more than 48 hours ago and auto-releases them.
 *
 * Setup: POST to this function URL on a schedule with the ADMIN_SECRET header.
 * Make.com: use a scheduled webhook scenario that calls this every hour.
 * Supabase pg_cron: select cron.schedule('auto-release', '0 * * * *', ...)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Validate via admin secret or service role key
  const adminSecret = req.headers.get("x-admin-secret");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization");

  if (adminSecret !== serviceRoleKey && authHeader !== `Bearer ${serviceRoleKey}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceRoleKey,
  );

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Find all transactions past the 48h window
  const { data: pending, error } = await serviceClient
    .from("transactions")
    .select("id, customer_token, painter_id, amount, painter_payout, customer_email, session_id, painters(first_name, last_name, email, completed_jobs)")
    .eq("status", "completion_requested")
    .lt("completion_requested_at", cutoff);

  if (error) {
    console.error("auto-release query error:", error);
    return json({ error: "Query failed" }, 500);
  }

  const released: string[] = [];
  const failed: string[] = [];

  for (const tx of pending ?? []) {
    try {
      // Mark completed
      await serviceClient.from("transactions").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        auto_released: true,
      }).eq("id", tx.id);

      // Update painter completed_jobs
      const painter = tx.painters as { first_name: string; last_name: string; email: string; completed_jobs: number } | null;
      if (painter) {
        await serviceClient.from("painters").update({
          completed_jobs: (painter.completed_jobs ?? 0) + 1,
        }).eq("id", tx.painter_id);
      }

      // Update session
      if (tx.session_id) {
        await serviceClient.from("sessions")
          .update({ status: "completed" })
          .eq("id", tx.session_id);
      }

      // Fire completion webhook
      const completionWebhook = Deno.env.get("MAKE_JOB_COMPLETED_WEBHOOK");
      if (completionWebhook) {
        await fetch(completionWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id: tx.id,
            auto_released: true,
            customer_email: tx.customer_email,
            painter_email: painter?.email,
            painter_name: painter ? `${painter.first_name} ${painter.last_name}` : "",
            amount: tx.amount,
            painter_payout: tx.painter_payout,
          }),
        }).catch(e => console.error("completion webhook error:", e));
      }

      await serviceClient.from("audit_log").insert({
        action: "auto_release_escrow",
        actor_role: "system",
        entity_type: "transaction",
        entity_id: tx.id,
        details: { amount: tx.amount, painter_id: tx.painter_id },
      });

      released.push(tx.id);
    } catch (err) {
      console.error(`auto-release failed for ${tx.id}:`, err);
      failed.push(tx.id);
    }
  }

  return json({
    success: true,
    released: released.length,
    failed: failed.length,
    released_ids: released,
  });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
