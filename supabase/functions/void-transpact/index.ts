import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callTranspact,
  getAuthParams,
  parseTranspactResponse,
} from "../_shared/transpact.ts";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorisation header." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated." }, 401);

    const { job_id } = await req.json();
    if (!job_id) return json({ error: "job_id is required." }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: job, error: jobError } = await serviceClient
      .from("jobs")
      .select("id, customer_id, status, transpact_transaction_id, title")
      .eq("id", job_id)
      .single();

    if (jobError || !job) return json({ error: "Job not found." }, 404);
    if (job.customer_id !== user.id) return json({ error: "Forbidden." }, 403);

    if (job.status !== "awaiting_payment") {
      return json({ error: `Job can only be voided when awaiting_payment (currently ${job.status}).` }, 422);
    }

    if (!job.transpact_transaction_id) {
      return json({ error: "No Transpact transaction found for this job." }, 422);
    }

    const auth = getAuthParams();
    const soapXml = await callTranspact("VoidTranspact", {
      ...auth,
      TranspactNumber: job.transpact_transaction_id,
      ClientMessage: "Job cancelled by PaintBookCo",
    });

    const rawResult = parseTranspactResponse(soapXml, "VoidTranspactResult");
    const resultId = parseInt(rawResult, 10);
    const now = new Date().toISOString();

    if (resultId !== 1) {
      await serviceClient.from("audit_log").insert({
        action: "transpact_void_failed",
        actor_id: user.id,
        actor_role: "customer",
        entity_type: "job",
        entity_id: job_id,
        details: { transaction_id: job.transpact_transaction_id, transpact_result: resultId, failed_at: now },
      });
      return json({ success: false, message: "Unable to void transaction. Please contact support." });
    }

    await serviceClient.from("jobs").update({ status: "cancelled" }).eq("id", job_id);

    await serviceClient.from("audit_log").insert({
      action: "transpact_voided",
      actor_id: user.id,
      actor_role: "customer",
      entity_type: "job",
      entity_id: job_id,
      details: { job_title: job.title, transaction_id: job.transpact_transaction_id, voided_at: now },
    });

    return json({ success: true });
  } catch (err) {
    console.error("void-transpact error:", err);
    return json({ error: "Internal error. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
