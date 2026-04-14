import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callTranspact,
  getAuthParams,
  parseTranspactResponse,
  transpactErrorMessage,
} from "../_shared/transpact.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://paintbook-app.netlify.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function commissionRate(completedJobs: number): number {
  if (completedJobs <= 5) return 0.12;
  if (completedJobs <= 10) return 0.10;
  return 0.08;
}

function buildConditions(jobTitle: string, amount: number): string {
  return `PaintBookCo Job: ${jobTitle}

PAYMENT CONDITIONS:
Payment of £${amount.toFixed(2)} is held in escrow by Transpact.com on behalf of PaintBookCo (The PaintBook Company Ltd, Co. No. 16690724).

Payment will be released to the painter when:
1. The customer confirms the job is complete, OR
2. All milestones have been approved by the customer

CANCELLATION TERMS:
If customer cancels with more than 5 days notice: 10% of net job value paid to painter, remainder refunded to customer.
If customer cancels with 2-5 days notice: 20% of net job value paid to painter.
If customer cancels with less than 2 days notice: 30% of net job value paid to painter.

DISPUTE RESOLUTION:
PaintBookCo acts as referee for any disputes.
Painter has 5 working days to remedy any issues before dispute escalation.

These conditions are fixed and non-negotiable.`.trim();
}

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

    const { job_id, customer_email, painter_email, amount, job_title } = await req.json();

    if (!job_id) return json({ error: "job_id is required." }, 400);
    if (!customer_email) return json({ error: "customer_email is required." }, 400);
    if (!painter_email) return json({ error: "painter_email is required." }, 400);
    if (!amount || amount <= 0) return json({ error: "amount must be a positive number." }, 400);
    if (!job_title) return json({ error: "job_title is required." }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: job, error: jobError } = await serviceClient
      .from("jobs")
      .select("id, customer_id, assigned_painter_id, status, start_date")
      .eq("id", job_id)
      .single();

    if (jobError || !job) return json({ error: "Job not found." }, 404);
    if (job.customer_id !== user.id) return json({ error: "Forbidden." }, 403);
    if (job.status !== "painter_accepted") {
      return json({ error: `Job must be in painter_accepted status.` }, 422);
    }

    const { data: painter } = await serviceClient
      .from("painters")
      .select("id, completed_jobs, first_name, last_name, transpact_registered")
      .eq("id", job.assigned_painter_id)
      .single();

    if (!painter) return json({ error: "Painter record not found." }, 404);

    const rate = commissionRate(painter.completed_jobs ?? 0);
    const commissionAmount = parseFloat((amount * rate).toFixed(2));
    const painterPayout = parseFloat((amount - commissionAmount).toFixed(2));

    const painterFullName =
      `${painter.first_name ?? ""} ${painter.last_name ?? ""}`.trim() || painter_email;

    const conditions = buildConditions(job_title, amount);
    if (conditions.length > 4000) {
      return json({ error: "Conditions text exceeds 4000 character limit." }, 422);
    }

    const isTest = Deno.env.get("TRANSPACT_IS_TEST") === "true";
    const auth = getAuthParams();
    const partnerRef = job_id.replace(/-/g, "").substring(0, 30);

    const soapXml = await callTranspact("CreateTranspact", {
      ...auth,
      CreateType: 3,
      MoneySenderEmail: customer_email,
      MoneyRecipientEmail: painter_email,
      Amount: amount,
      Currency: "GBP",
      NatureOfTransaction: 1,
      SenderFee: 0,
      RecipientFee: 0,
      OriginatorFee: 5.98,
      MaxDaysDisputePayWait: 10,
      Conditions: conditions,
      ConditionsConsumerClause: true,
      CanTransactorsChangeConditions: false,
      OriginatorPcntCommisionOnSendToRcpnt: rate,
      PartnerReference: partnerRef,
      PayerRealName: customer_email,
      PayeeRealName: painterFullName,
    });

    const rawId = parseTranspactResponse(soapXml, "CreateTranspactResult");
    const transactionId = parseInt(rawId, 10);

    if (isNaN(transactionId) || transactionId <= 0) {
      const errMsg = transpactErrorMessage(transactionId);
      await serviceClient.from("audit_log").insert({
        action: "transpact_create_failed",
        actor_id: user.id,
        actor_role: "customer",
        entity_type: "job",
        entity_id: job_id,
        details: { error_code: transactionId, error_message: errMsg },
      });
      return json({ error: errMsg }, 422);
    }

    const transactionIdStr = String(transactionId);

    await serviceClient
      .from("jobs")
      .update({ transpact_transaction_id: transactionIdStr, status: "awaiting_payment" })
      .eq("id", job_id);

    await serviceClient.from("audit_log").insert({
      action: "transpact_created",
      actor_id: user.id,
      actor_role: "customer",
      entity_type: "job",
      entity_id: job_id,
      details: { transaction_id: transactionIdStr, amount, commission_rate: rate, commission_amount: commissionAmount, painter_payout: painterPayout, is_test: isTest },
    });

    const { count: priorTx } = await serviceClient
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id)
      .not("transpact_transaction_id", "is", null)
      .neq("id", job_id);

    const isReturning = (priorTx ?? 0) > 0;
    const testSuffix = isTest ? "&Test=1" : "";
    const enc = encodeURIComponent;

    const paymentUrl = isReturning
      ? `https://www.transpact.com/Secure/Login.aspx?Em=${enc(customer_email)}&co=PaintBookCo${testSuffix}`
      : `https://www.transpact.com/Secure/RegisterPartner.aspx?em=${enc(customer_email)}&co=PaintBookCo&JN=${transactionIdStr}${testSuffix}`;

    return json({ success: true, transaction_id: transactionIdStr, payment_url: paymentUrl, commission_rate: rate, commission_amount: commissionAmount, painter_payout: painterPayout });
  } catch (err) {
    console.error("create-transpact error:", err);
    return json({ error: "Internal error. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
