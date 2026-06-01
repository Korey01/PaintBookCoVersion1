/**
 * create-transpact — creates a Transpact escrow transaction.
 *
 * Called by customer clicking "Pay Now" on /job/[token].
 * No Supabase auth required — validated via customer_token.
 *
 * Request body: { transaction_id: string, customer_token: string }
 * Returns:      { payment_url: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callTranspact,
  getAuthParams,
  parseTranspactResponse,
  transpactErrorMessage,
} from "../_shared/transpact.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function commissionRate(completedJobs: number): number {
  if (completedJobs <= 5) return 0.12;
  if (completedJobs <= 10) return 0.10;
  return 0.08;
}

function buildConditions(jobRef: string, amount: number, jobDescription: string, jobAddress: string): string {
  return `PaintBookCo Job Reference: ${jobRef}
Job Address: ${jobAddress}

AGREED WORK:
${jobDescription}

PAYMENT CONDITIONS:
Payment of £${amount.toFixed(2)} is held in escrow by Transpact.com on behalf of PaintBookCo (The PaintBook Company Ltd, Co. No. 16690724).

Payment will be released to the painter when the customer confirms the job is complete via their job tracking page. If the customer does not respond within 48 hours of the painter marking the job complete, PaintBookCo will advise the painter to initiate the Transpact dispute process.

CANCELLATION TERMS:
If customer cancels with more than 7 days notice: 10% of net job value paid to painter.
If customer cancels with 3-7 days notice: 20% of net job value paid to painter.
If customer cancels with less than 72 hours notice: 30% of net job value paid to painter.

DISPUTE RESOLUTION:
Disputes are handled first through PaintBookCo mediation at no cost. If unresolved, either party may escalate to formal Transpact arbitration (£20 per party, refunded to the winning party). The Transpact-nominated independent referee makes a binding decision under the Arbitration Act 1996.
These conditions are fixed and agreed by both parties.`.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({})) as Record<string, string>;
    const { transaction_id, customer_token } = body;

    if (!transaction_id || !customer_token) {
      return json({ error: "transaction_id and customer_token are required" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Load transaction with painter details
    const { data: transaction } = await serviceClient
      .from("transactions")
      .select("*, painters(first_name, last_name, email, completed_jobs), sessions(id, customer_token, status, description, job_type, city, postcode)")
      .eq("id", transaction_id)
      .single();

    if (!transaction) return json({ error: "Transaction not found" }, 404);

    // Verify customer token
    if (transaction.customer_token !== customer_token) {
      return json({ error: "Invalid customer token" }, 403);
    }

    // If already has a Transpact transaction, return existing payment URL
    if (transaction.transpact_transaction_id) {
      const isTest = Deno.env.get("TRANSPACT_IS_TEST") === "true";
      const testSuffix = isTest ? "&Test=1" : "";
      const enc = encodeURIComponent;
      const paymentUrl = `https://www.transpact.com/Secure/Login.aspx?Em=${enc(transaction.customer_email)}&co=PaintBookCo${testSuffix}`;
      return json({ success: true, payment_url: paymentUrl });
    }


    if (!["invoice_sent"].includes(transaction.status)) {
      return json({ error: "Payment can only be initiated for invoice_sent transactions" }, 400);
    }

    const painter = transaction.painters;
    if (!painter) return json({ error: "Painter not found" }, 404);

    const amount = Number(transaction.amount);
    const customerEmail = transaction.customer_email;
    const painterEmail = painter.email;
    console.log("Transpact emails - customer:", customerEmail, "painter:", painterEmail);

    const rate = commissionRate(painter.completed_jobs ?? 0);
    const commissionAmount = parseFloat((amount * rate).toFixed(2));
    const painterPayout = parseFloat((amount - commissionAmount).toFixed(2));

    const invoiceRef = transaction.invoice_id ?? `PBC-${transaction_id.slice(-6).toUpperCase()}`;
    const jobDescription = transaction.sessions?.description?.trim() ||
                           transaction.sessions?.job_type ||
                           "Painting and decorating services as agreed between the parties.";
    const jobAddress = `${transaction.sessions?.city || ""}${transaction.sessions?.city && transaction.sessions?.postcode ? ", " : ""}${transaction.sessions?.postcode || ""}`.trim() || "Address provided to painter upon escrow funding";
    const conditions = buildConditions(invoiceRef, amount, jobDescription, jobAddress);

    const auth = getAuthParams();
    const isTest = Deno.env.get("TRANSPACT_IS_TEST") === "true";
    const partnerRef = transaction_id.replace(/-/g, "").substring(0, 30);
    const painterFullName = `${painter.first_name ?? ""} ${painter.last_name ?? ""}`.trim();

    const soapXml = await callTranspact("CreateTranspact", {
      ...auth,
      CreateType: 3,
      MoneySenderEmail: customerEmail,
      MoneyRecipientEmail: painterEmail,
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
      TranspactNominatedReferee: true,
      OriginatorFixedCommisionOnReceive: 0,
      OriginatorPcntCommisionOnReceive: 0,
      OriginatorFixedCommisionOnSendToRcpnt: 0,
      OriginatorPcntCommisionOnSendToRcpnt: rate,
      OriginatorFixedCommisionOnSendToAll: 0,
      OriginatorPcntCommisionOnSendToAll: 0,
      CharityNo: 0,
      OriginatorFixedCommisionAddBeforeStart: 0,
      OriginatorPcntCommisionAddBeforeStart: 0,
      IsFixedOnSendToRcpntFirst: false,
      PartnerReference: partnerRef,
      PayerRealName: customerEmail,
      PayeeRealName: painterFullName,
    });

    console.log("Transpact raw SOAP response:", soapXml.slice(0, 500));
    const rawId = parseTranspactResponse(soapXml, "CreateTranspactResult");
    console.log("Transpact raw ID:", rawId);
    const transpactId = parseInt(rawId, 10);

    if (isNaN(transpactId) || transpactId <= 0) {
      const errMsg = transpactErrorMessage(transpactId);
      await serviceClient.from("audit_log").insert({
        action: "transpact_create_failed",
        actor_role: "customer",
        entity_type: "transaction",
        entity_id: transaction_id,
        details: { error_code: transpactId, error_message: errMsg },
      });
      return json({ error: errMsg }, 422);
    }

    const transpactIdStr = String(transpactId);

    // Update transaction with Transpact ID and commission details
    await serviceClient.from("transactions").update({
      transpact_transaction_id: transpactIdStr,
      commission_rate: rate,
      commission_amount: commissionAmount,
      painter_payout: painterPayout,
    }).eq("id", transaction_id);

    await serviceClient.from("audit_log").insert({
      action: "transpact_created",
      actor_role: "customer",
      entity_type: "transaction",
      entity_id: transaction_id,
      details: {
        transpact_transaction_id: transpactIdStr,
        amount,
        commission_rate: rate,
        is_test: isTest,
      },
    });

    // Build payment URL — check if customer already has a Transpact account
    const { count: priorTx } = await serviceClient
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", customerEmail)
      .not("transpact_transaction_id", "is", null)
      .neq("id", transaction_id);

    const isReturning = (priorTx ?? 0) > 0;
    const testSuffix = isTest ? "&Test=1" : "";
    const enc = encodeURIComponent;

    const paymentUrl = isReturning
      ? `https://www.transpact.com/Secure/Login.aspx?Em=${enc(customerEmail)}&co=PaintBookCo${testSuffix}`
      : `https://www.transpact.com/Secure/RegisterPartner.aspx?em=${enc(customerEmail)}&co=PaintBookCo&JN=${transpactIdStr}${testSuffix}`;

    return json({
      success: true,
      payment_url: paymentUrl,
      transaction_id,
      transpact_transaction_id: transpactIdStr,
    });

  } catch (err) {
    console.error("create-transpact error:", err);
    return json({ error: "An unexpected error occurred. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
 
 
 
 
 
 
