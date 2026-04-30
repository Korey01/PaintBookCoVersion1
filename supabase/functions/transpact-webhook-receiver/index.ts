import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return ack();

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!,
  );

  let params: Record<string, string> = {};

  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await req.text();
      for (const [k, v] of new URLSearchParams(body)) params[k] = v;
    } else if (contentType.includes("application/json")) {
      params = await req.json();
    } else {
      const url = new URL(req.url);
      for (const [k, v] of url.searchParams) params[k] = v;
    }

    const transpactNumber = parseInt(params["transactionID"] ?? "0", 10);
    const eventId = parseInt(params["transactionEventID"] ?? "0", 10);
    const rawAmount = parseFloat(params["amount"] ?? "0");
    const description = params["description"] ?? "";

    if (!transpactNumber || !eventId) return ack();

    const { data: existing } = await serviceClient
      .from("transpact_events")
      .select("id")
      .eq("transpact_number", transpactNumber)
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) return ack();

    const { data: job } = await serviceClient
      .from("jobs")
      .select("id, status, total_price, assigned_painter_id, customer_id, start_date, title")
      .eq("transpact_transaction_id", String(transpactNumber))
      .maybeSingle();

    const now = new Date().toISOString();

    await serviceClient.from("transpact_events").insert({
      transpact_number: transpactNumber,
      event_id: eventId,
      amount: rawAmount || null,
      description: description || null,
      raw_payload: params,
      job_id: job?.id ?? null,
      processed_at: now,
    });

    if (!job) return ack();

    switch (eventId) {
      case 16: {
        const totalPrice = parseFloat(String(job.total_price ?? 0));
        if (rawAmount > 0 && Math.abs(rawAmount - totalPrice) > 0.01) {
          await logAudit(serviceClient, "amount_mismatch_alert", job.id, { transpact_number: transpactNumber, expected_amount: totalPrice, received_amount: rawAmount });
          await sendMismatchAlert(rawAmount, totalPrice, job.id, transpactNumber);
          return ack();
        }
        await serviceClient.from("jobs").update({ status: "escrow_funded", escrow_funded: true }).eq("id", job.id);
        await callWebhook(Deno.env.get("MAKE_ESCROW_FUNDED_WEBHOOK"), { event: "escrow_funded", job_id: job.id, job_title: job.title, customer_id: job.customer_id, painter_id: job.assigned_painter_id, amount: rawAmount, transpact_number: transpactNumber, funded_at: now });
        await logAudit(serviceClient, "escrow_funded", job.id, { transpact_number: transpactNumber, amount: rawAmount, funded_at: now });
        break;
      }
      case 12: {
        const { data: milestone } = await serviceClient.from("job_milestones").select("id, name, amount, milestone_number").eq("job_id", job.id).eq("status", "approved").order("approved_at", { ascending: false }).limit(1).maybeSingle();
        if (milestone) {
          await serviceClient.from("job_milestones").update({ status: "paid", paid_at: now, transpact_release_id: String(transpactNumber) }).eq("id", milestone.id);
          await logAudit(serviceClient, "milestone_paid", job.id, { milestone_id: milestone.id, milestone_name: milestone.name, amount: milestone.amount, transpact_number: transpactNumber, paid_at: now });
        }
        break;
      }
      case 10: {
        await serviceClient.from("jobs").update({ status: "completed" }).eq("id", job.id);
        if (job.assigned_painter_id) {
          const { data: p } = await serviceClient.from("painters").select("completed_jobs").eq("id", job.assigned_painter_id).single();
          await serviceClient.from("painters").update({ completed_jobs: (p?.completed_jobs ?? 0) + 1, transpact_registered: true }).eq("id", job.assigned_painter_id);
        }
        await callWebhook(Deno.env.get("MAKE_JOB_COMPLETED_WEBHOOK"), { event: "job_completed", job_id: job.id, job_title: job.title, customer_id: job.customer_id, painter_id: job.assigned_painter_id, amount: rawAmount, transpact_number: transpactNumber, completed_at: now });
        await logAudit(serviceClient, "job_completed_payment_released", job.id, { transpact_number: transpactNumber, amount: rawAmount, completed_at: now });
        break;
      }
      case 7: {
        await serviceClient.from("jobs").update({ status: "cancelled" }).eq("id", job.id);
        const compensationDetails: Record<string, unknown> = {};
        if (job.assigned_painter_id && job.start_date) {
          const daysNotice = Math.floor((new Date(job.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const totalPrice = parseFloat(String(job.total_price ?? 0));
          const compensationRate = daysNotice > 5 ? 0.10 : daysNotice >= 2 ? 0.20 : 0.30;
          compensationDetails.days_notice = daysNotice;
          compensationDetails.compensation_rate = compensationRate;
          compensationDetails.compensation_amount = parseFloat((totalPrice * compensationRate).toFixed(2));
          compensationDetails.note = "Manual compensation payment required via Transpact dashboard";
        }
        await logAudit(serviceClient, "job_cancelled_transpact_voided", job.id, { transpact_number: transpactNumber, cancelled_at: now, ...compensationDetails });
        break;
      }
      case 11: {
        await serviceClient.from("jobs").update({ status: "disputed" }).eq("id", job.id);
        await callWebhook(Deno.env.get("MAKE_DISPUTE_RAISED_WEBHOOK"), { event: "dispute_raised", job_id: job.id, job_title: job.title, customer_id: job.customer_id, painter_id: job.assigned_painter_id, transpact_number: transpactNumber, raised_at: now });
        await logAudit(serviceClient, "dispute_raised_transpact", job.id, { transpact_number: transpactNumber, raised_at: now });
        break;
      }
      default: {
        await logAudit(serviceClient, "transpact_event_unhandled", job.id, { transpact_number: transpactNumber, event_id: eventId, amount: rawAmount, description });
      }
    }

    return ack();
  } catch (err) {
    console.error("transpact-webhook-receiver error:", err);
    return ack();
  }
});

function ack() {
  return new Response("1", { status: 200, headers: { ...securityHeaders, "Content-Type": "text/plain" } });
}

async function logAudit(client: any, action: string, jobId: string | null, details: Record<string, unknown>) {
  await client.from("audit_log").insert({ action, actor_id: null, actor_role: "transpact_webhook", entity_type: jobId ? "job" : null, entity_id: jobId, details }).catch((e: Error) => console.error("audit_log insert failed:", e.message));
}

async function callWebhook(url: string | undefined, body: Record<string, unknown>) {
  if (!url) return;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch (e) {
    console.error("Make.com webhook failed:", e);
  }
}

async function sendMismatchAlert(received: number, expected: number, jobId: string, transpactNumber: number) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) return;
  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ personalizations: [{ to: [{ email: ADMIN_EMAIL }], subject: `[ALERT] Transpact amount mismatch — Job ${jobId}` }], from: { email: ADMIN_EMAIL, name: "PaintBookCo Alerts" }, content: [{ type: "text/plain", value: `Amount mismatch detected.\n\nJob ID: ${jobId}\nTranspact #: ${transpactNumber}\nExpected: £${expected.toFixed(2)}\nReceived: £${received.toFixed(2)}\nDelta: £${Math.abs(received - expected).toFixed(2)}\n\nJob status has NOT been updated. Please investigate immediately.` }] }),
    });
  } catch (e) {
    console.error("Mismatch alert email failed:", e);
  }
}
