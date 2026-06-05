/**
 * transpact-webhook-receiver — handles incoming Transpact payment events.
 *
 * Transpact expects all responses to return "1" with 200 status.
 * Events are deduplicated via transpact_events table.
 *
 * Event IDs handled:
 *   16 — Escrow funded (payment received)
 *   10 — Payment released / completed
 *   7  — Transaction cancelled
 *   11 — Dispute raised
 *   12 — Milestone paid (partial release)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Deduplicate
    const { data: existing } = await serviceClient
      .from("transpact_events")
      .select("id")
      .eq("transpact_number", transpactNumber)
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) return ack();

    // Look up transaction by Transpact ID
    const { data: tx } = await serviceClient
      .from("transactions")
      .select("id, status, amount, painter_id, session_id, customer_email, customer_first_name, customer_last_name, customer_phone, customer_token, invoice_id, painters(id, first_name, last_name, email, phone, completed_jobs)")
      .eq("transpact_transaction_id", String(transpactNumber))
      .maybeSingle();

    const now = new Date().toISOString();

    await serviceClient.from("transpact_events").insert({
      transpact_number: transpactNumber,
      event_id: eventId,
      amount: rawAmount || null,
      description: description || null,
      raw_payload: params,
      job_id: tx?.id ?? null,
      processed_at: now,
    }).catch(e => console.error("transpact_events insert:", e));

    if (!tx) return ack();

    const painter = tx.painters as { first_name: string; last_name: string; email: string; completed_jobs: number } | null;

    switch (eventId) {
      case 16: {
        // Escrow funded — money received from customer
        const txAmount = parseFloat(String(tx.amount ?? 0));
        if (rawAmount > 0 && Math.abs(rawAmount - txAmount) > 0.01) {
          await logAudit(serviceClient, "amount_mismatch_alert", tx.id, {
            transpact_number: transpactNumber, expected: txAmount, received: rawAmount,
          });
          await sendMismatchAlert(rawAmount, txAmount, tx.id, transpactNumber);
          return ack();
        }

        await serviceClient.from("transactions").update({
          status: "funded",
          funded_at: now,
          escrow_funded: true,
        }).eq("id", tx.id);

        if (tx.session_id) {
          await serviceClient.from("sessions")
            .update({ status: "funded" })
            .eq("id", tx.session_id);
        }

        await callWebhook(Deno.env.get("MAKE_ESCROW_FUNDED_WEBHOOK"), {
          event: "escrow_funded",
          transaction_id: tx.id,
          job_ref: tx.invoice_id || `PBC-${tx.id.slice(-6).toUpperCase()}`,
          painter_name: painter ? `${painter.first_name} ${painter.last_name}` : "",
          painter_first_name: painter?.first_name ?? "",
          painter_email: painter?.email,
          painter_phone: painter?.phone ?? "",
          customer_email: tx.customer_email,
          customer_first_name: tx.customer_first_name ?? "",
          customer_last_name: tx.customer_last_name ?? "",
          customer_phone: tx.customer_phone ?? "",
          amount: rawAmount,
          transpact_number: transpactNumber,
          funded_at: now,
          my_jobs_link: `https://www.paintbookco.co.uk/dashboard/painter?tab=my-jobs&session=${tx.session_id}`,
          track_job_link: tx.customer_token ? `https://www.paintbookco.co.uk/job/${tx.customer_token}` : "",
        });

        await callWebhook(Deno.env.get("MAKE_CONTACT_SHARED_WEBHOOK"), {
          event: "contact_shared",
          transaction_id: tx.id,
          job_ref: tx.invoice_id || `PBC-${tx.id.slice(-6).toUpperCase()}`,
          painter_name: painter ? `${painter.first_name} ${painter.last_name}` : "",
          painter_email: painter?.email,
          customer_email: tx.customer_email,
          funded_at: now,
          my_jobs_link: `https://www.paintbookco.co.uk/dashboard/painter?tab=my-jobs&session=${tx.session_id}`,
          track_job_link: tx.customer_token ? `https://www.paintbookco.co.uk/job/${tx.customer_token}` : "",
        });

        await logAudit(serviceClient, "escrow_funded", tx.id, {
          transpact_number: transpactNumber, amount: rawAmount, funded_at: now,
        });
        break;
      }

      case 10: {
        // Payment released / job completed via Transpact
        await serviceClient.from("transactions").update({
          status: "completed",
          completed_at: now,
        }).eq("id", tx.id);

        if (tx.session_id) {
          await serviceClient.from("sessions")
            .update({ status: "completed" })
            .eq("id", tx.session_id);
        }

        if (painter) {
          await serviceClient.from("painters").update({
            completed_jobs: (painter.completed_jobs ?? 0) + 1,
            transpact_registered: true,
          }).eq("id", tx.painter_id);
        }

        await callWebhook(Deno.env.get("MAKE_JOB_COMPLETED_WEBHOOK"), {
          event: "job_completed",
          transaction_id: tx.id,
          job_ref: tx.invoice_id || `PBC-${tx.id.slice(-6).toUpperCase()}`,
          painter_name: painter ? `${painter.first_name} ${painter.last_name}` : "",
          painter_email: painter?.email,
          customer_email: tx.customer_email,
          amount: rawAmount,
          painter_payout: tx.painter_payout ?? 0,
          transpact_number: transpactNumber,
          completed_at: now,
          my_jobs_link: `https://www.paintbookco.co.uk/dashboard/painter?tab=my-jobs`,
          track_job_link: tx.customer_token ? `https://www.paintbookco.co.uk/job/${tx.customer_token}` : "",
          review_link: tx.customer_token ? `https://www.paintbookco.co.uk/job/${tx.customer_token}#review` : "",
        });

        await logAudit(serviceClient, "payment_released", tx.id, {
          transpact_number: transpactNumber, amount: rawAmount, completed_at: now,
        });
        break;
      }

      case 7: {
        // Cancelled
        await serviceClient.from("transactions").update({
          status: "cancelled",
          cancelled_at: now,
        }).eq("id", tx.id);

        if (tx.session_id) {
          await serviceClient.from("sessions")
            .update({ status: "cancelled" })
            .eq("id", tx.session_id);
        }

        await logAudit(serviceClient, "transaction_cancelled", tx.id, {
          transpact_number: transpactNumber, cancelled_at: now,
        });
        break;
      }

      case 11: {
        // Dispute raised via Transpact
        await serviceClient.from("transactions").update({
          status: "disputed",
          disputed_at: now,
        }).eq("id", tx.id);

        if (tx.session_id) {
          await serviceClient.from("sessions")
            .update({ status: "disputed" })
            .eq("id", tx.session_id);
        }

        await callWebhook(Deno.env.get("MAKE_DISPUTE_RAISED_WEBHOOK"), {
          event: "dispute_raised",
          transaction_id: tx.id,
          job_ref: tx.invoice_id || `PBC-${tx.id.slice(-6).toUpperCase()}`,
          painter_name: painter ? `${painter.first_name} ${painter.last_name}` : "",
          painter_email: painter?.email,
          customer_email: tx.customer_email,
          admin_email: Deno.env.get("ADMIN_EMAIL") ?? "",
          transpact_number: transpactNumber,
          raised_at: now,
          my_jobs_link: `https://www.paintbookco.co.uk/dashboard/painter?tab=my-jobs&session=${tx.session_id}`,
          track_job_link: tx.customer_token ? `https://www.paintbookco.co.uk/job/${tx.customer_token}` : "",
          admin_link: "https://www.paintbookco.co.uk/admin",
        });

        await logAudit(serviceClient, "dispute_raised_transpact", tx.id, {
          transpact_number: transpactNumber, raised_at: now,
        });
        break;
      }

      case 12: {
        // Milestone payment released
        const { data: milestone } = await serviceClient
          .from("job_milestones")
          .select("id, title, amount")
          .eq("transaction_id", tx.id)
          .eq("status", "approved")
          .order("approved_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (milestone) {
          await serviceClient.from("job_milestones").update({
            status: "paid",
            paid_at: now,
            transpact_release_id: String(transpactNumber),
          }).eq("id", milestone.id);

          await logAudit(serviceClient, "milestone_paid", tx.id, {
            milestone_id: milestone.id, amount: milestone.amount,
            transpact_number: transpactNumber, paid_at: now,
          });
        }
        break;
      }

      default: {
        await logAudit(serviceClient, "transpact_event_unhandled", tx.id, {
          transpact_number: transpactNumber, event_id: eventId,
          amount: rawAmount, description,
        });
      }
    }

    return ack();

  } catch (err) {
    console.error("transpact-webhook-receiver error:", err);
    return ack();
  }
});

function ack() {
  return new Response("1", {
    status: 200,
    headers: { ...securityHeaders, "Content-Type": "text/plain" },
  });
}

async function logAudit(
  client: ReturnType<typeof createClient>,
  action: string,
  txId: string | null,
  details: Record<string, unknown>,
) {
  await client.from("audit_log").insert({
    action,
    actor_role: "transpact_webhook",
    entity_type: txId ? "transaction" : null,
    entity_id: txId,
    details,
  }).catch(e => console.error("audit_log insert failed:", e));
}

async function callWebhook(url: string | undefined, body: Record<string, unknown>) {
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(e => console.error("Make.com webhook failed:", e));
}

async function sendMismatchAlert(
  received: number,
  expected: number,
  txId: string,
  transpactNumber: number,
) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
  if (!apiKey || !adminEmail) return;
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: adminEmail }], subject: `[ALERT] Transpact amount mismatch — tx ${txId}` }],
      from: { email: adminEmail, name: "PaintBookCo Alerts" },
      content: [{
        type: "text/plain",
        value: `Amount mismatch!\n\nTransaction: ${txId}\nTranspact #: ${transpactNumber}\nExpected: £${expected.toFixed(2)}\nReceived: £${received.toFixed(2)}\nDelta: £${Math.abs(received - expected).toFixed(2)}\n\nStatus NOT updated. Please investigate.`,
      }],
    }),
  }).catch(e => console.error("Mismatch alert failed:", e));
}
