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
If customer cancels with less than 72 hours notice: 30% of net job value paid to painter. IMPORTANT: PaintBookCo's platform commission is retained in full and is non-refundable once payment has been made, regardless of when cancellation occurs, in addition to the painter cancellation percentage stated above.

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
    const { data: transaction, error: txError } = await serviceClient
      .from("transactions")
      .select("*, painters(first_name, last_name, email, completed_jobs), sessions(id, customer_token, status, job_description, job_type, city, postcode)")
      .eq("id", transaction_id)
      .single();

    if (txError || !transaction) {
      console.error("Transaction lookup failed:", txError);
      return json({ error: "Transaction not found", detail: txError?.message }, 404);
    }

    // Verify customer token
    if (transaction.customer_token !== customer_token) {
      return json({ error: "Invalid customer token" }, 403);
    }

    const painter = transaction.painters;

    // If already has a Transpact transaction, return existing payment URL
    if (transaction.transpact_transaction_id) {
      const isTest = Deno.env.get("TRANSPACT_IS_TEST") === "true";
      const testSuffix = isTest ? "&Test=1" : "";
      const enc = encodeURIComponent;
      const paymentUrl = `https://www.transpact.com/Secure/Login.aspx?Em=${enc(transaction.customer_email)}&co=PaintBookCo${testSuffix}`;

      // Send notification emails via SendGrid
      const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
      const LOGO = "https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png";
      if (sendgridKey) {
        const customerName = transaction.customer_first_name || "Customer";
        const painterName = `${painter.first_name} ${painter.last_name}`;
        const amount = transaction.amount;

        // Email to customer with payment link
        const customerHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;">
          <div style="text-align:center;padding:16px 0;">
            <img src="${LOGO}" alt="PaintBookCo" style="height:36px;object-fit:contain;" />
          </div>
          <div style="background:#f9f9f9;padding:24px;border:1px solid #e5e5e5;border-radius:8px;">
            <p>Dear ${customerName},</p>
            <p>Your invoice for <strong>£${Number(amount).toFixed(2)}</strong> has been prepared. Please click the button below to log into Transpact and make your secure escrow payment.</p>
            <p style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:12px;font-size:14px;">
              💡 Your payment is held securely by <strong>Transpact</strong> — it is only released to the painter once you confirm the work is complete.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${paymentUrl}" style="background:#D85A30;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                Pay Now — £${Number(amount).toFixed(2)} →
              </a>
            </div>
            <p style="font-size:13px;color:#666;">If you have any questions, contact us at <a href="mailto:hello@paintbookco.co.uk" style="color:#D85A30;">hello@paintbookco.co.uk</a></p>
          </div>
          <p style="font-size:11px;color:#999;text-align:center;margin-top:16px;">© PaintBookCo — The Paint Book Company Ltd · Co. No. 16690724</p>
        </body></html>`;

        // Email to painter notifying payment is being processed
        const painterHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;">
          <div style="text-align:center;padding:16px 0;">
            <img src="${LOGO}" alt="PaintBookCo" style="height:36px;object-fit:contain;" />
          </div>
          <div style="background:#f9f9f9;padding:24px;border:1px solid #e5e5e5;border-radius:8px;">
            <p>Dear ${painter.first_name},</p>
            <p>Great news! Your customer is in the process of funding the escrow for your job worth <strong>£${Number(amount).toFixed(2)}</strong>.</p>
            <p>Once the escrow is funded, you will receive a confirmation and can proceed with the work. Funds will be released to you once the customer confirms the work is complete.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://www.paintbookco.co.uk/dashboard/painter" style="background:#2D5A3D;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                View Your Dashboard →
              </a>
            </div>
            <p style="font-size:13px;color:#666;">If you have any questions, contact us at <a href="mailto:hello@paintbookco.co.uk" style="color:#D85A30;">hello@paintbookco.co.uk</a></p>
          </div>
          <p style="font-size:11px;color:#999;text-align:center;margin-top:16px;">© PaintBookCo — The Paint Book Company Ltd · Co. No. 16690724</p>
        </body></html>`;

        await Promise.all([
          fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${sendgridKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: transaction.customer_email, name: customerName }] }],
              from: { email: "noreply@paintbookco.co.uk", name: "PaintBookCo" },
              subject: `Action Required: Pay £${Number(amount).toFixed(2)} via Transpact Escrow`,
              content: [{ type: "text/html", value: customerHtml }],
            }),
          }).catch(e => console.error("Customer email error:", e)),
          fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${sendgridKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: painter.email, name: painterName }] }],
              from: { email: "noreply@paintbookco.co.uk", name: "PaintBookCo" },
              subject: "Payment in progress — Escrow being funded",
              content: [{ type: "text/html", value: painterHtml }],
            }),
          }).catch(e => console.error("Painter email error:", e)),
        ]);
      }
      return json({ success: true, payment_url: paymentUrl });
    }


    if (!["invoice_sent"].includes(transaction.status)) {
      return json({ error: "Payment can only be initiated for invoice_sent transactions" }, 400);
    }

    if (!painter) return json({ error: "Painter not found" }, 404);

    const amount = Number(transaction.amount);
    const customerEmail = transaction.customer_email;
    const painterEmail = painter.email;
    console.log("Transpact emails - customer:", customerEmail, "painter:", painterEmail);
    const _pw = Deno.env.get("TRANSPACT_PASSWORD") ?? "";
    console.log("Transpact password length:", _pw.length, "first3:", _pw.slice(0,3));

    const rate = commissionRate(painter.completed_jobs ?? 0);
    const commissionAmount = parseFloat((amount * rate).toFixed(2));
    const painterPayout = parseFloat((amount - commissionAmount).toFixed(2));

    const invoiceRef = transaction.invoice_id ?? `PBC-${transaction_id.slice(-6).toUpperCase()}`;
    const jobDescription = transaction.sessions?.job_description?.trim() ||
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
      OriginatorPcntCommisionOnSendToRcpnt: rate * 100,
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
 
 
 
 
 
 
 
 
 
 
 
