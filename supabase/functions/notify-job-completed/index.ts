import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorised" }, 401);

    const body = await req.json();
    const {
      job_id, job_title, job_value,
      customer_email, customer_name,
      painter_email, painter_name, painter_payout
    } = body;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Update painter completed_jobs count
    if (body.painter_id) {
      const { data: painter } = await serviceClient
        .from("painters")
        .select("completed_jobs")
        .eq("id", body.painter_id)
        .single();
      if (painter) {
        await serviceClient.from("painters")
          .update({ completed_jobs: (painter.completed_jobs || 0) + 1 })
          .eq("id", body.painter_id);
      }
    }

    // Call Make.com Job Completed webhook
    const webhookUrl = Deno.env.get("MAKE_JOB_COMPLETED_WEBHOOK");
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id, job_title, job_value,
          customer_email, customer_name,
          painter_email, painter_name, painter_payout,
          transpact_transaction_id: "PENDING",
        }),
      });
    }

    // Audit log
    await serviceClient.from("audit_log").insert({
      action: "job_completed",
      entity_type: "job",
      entity_id: job_id,
      details: { job_title, job_value, painter_email, customer_email },
    });

    return json({ success: true });
  } catch (err) {
    console.error("notify-job-completed error:", err);
    return json({ error: "Internal error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
