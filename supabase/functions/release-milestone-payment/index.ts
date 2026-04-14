import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callTranspact,
  getAuthParams,
  parseTranspactResponse,
} from "../_shared/transpact.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://paintbook-app.netlify.app",
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorisation header." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated." }, 401);

    const { job_id, milestone_id } = await req.json();
    if (!job_id) return json({ error: "job_id is required." }, 400);
    if (!milestone_id) return json({ error: "milestone_id is required." }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: job, error: jobError } = await serviceClient
      .from("jobs")
      .select("id, customer_id, transpact_transaction_id, status, total_price")
      .eq("id", job_id)
      .single();

    if (jobError || !job) return json({ error: "Job not found." }, 404);
    if (job.customer_id !== user.id) return json({ error: "Forbidden." }, 403);

    if (!job.transpact_transaction_id) {
      return json({ error: "No Transpact transaction found for this job." }, 422);
    }

    const { data: milestone, error: msError } = await serviceClient
      .from("job_milestones")
      .select("id, status, amount, name, milestone_number")
      .eq("id", milestone_id)
      .eq("job_id", job_id)
      .single();

    if (msError || !milestone) return json({ error: "Milestone not found." }, 404);

    if (milestone.status !== "approved") {
      return json({ error: `Milestone must be approved to release payment (currently ${milestone.status}).` }, 422);
    }

    const auth = getAuthParams();
    let amountHeld = 0;
    let stageDescription = "";

    try {
      const viewXml = await callTranspact("ViewTranspact", {
        ...auth,
        TranspactNumber: job.transpact_transaction_id,
      });
      amountHeld = parseFloat(parseTranspactResponse(viewXml, "AmountHeld") || "0");
      stageDescription = parseTranspactResponse(viewXml, "StageDescription");
    } catch (viewErr) {
      console.error("ViewTranspact failed:", viewErr);
    }

    const milestoneAmount = parseFloat(String(milestone.amount));
    if (amountHeld > 0 && amountHeld < milestoneAmount) {
      return json({ error: `Escrow holds £${amountHeld.toFixed(2)} but milestone amount is £${milestoneAmount.toFixed(2)}. Insufficient funds.` }, 422);
    }

    const now = new Date().toISOString();
    await serviceClient.from("audit_log").insert({
      action: "milestone_payment_release_confirmed",
      actor_id: user.id,
      actor_role: "customer",
      entity_type: "job_milestone",
      entity_id: milestone_id,
      details: {
        job_id,
        milestone_name: milestone.name,
        milestone_number: milestone.milestone_number,
        milestone_amount: milestoneAmount,
        transaction_id: job.transpact_transaction_id,
        amount_held: amountHeld,
        stage_description: stageDescription,
        note: "Actual payment release handled by Transpact via customer completing job on Transpact website",
        confirmed_at: now,
      },
    });

    return json({ success: true, amount_held: amountHeld, transaction_id: job.transpact_transaction_id });
  } catch (err) {
    console.error("release-milestone-payment error:", err);
    return json({ error: "Internal error. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
