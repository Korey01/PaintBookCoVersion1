/**
 * generate-invoice — called when painter clicks "Generate Invoice" in chat
 *
 * Accepts:
 *   transaction_id  — update existing transaction
 *   OR session_id   — create new transaction
 *   job_description — string
 *   line_items      — [{ description, amount }]
 *   amount          — total amount (GBP)
 *   notes           — optional string
 *
 * On success:
 *   - Generates clean HTML invoice
 *   - Saves invoice_html to transactions table
 *   - Updates status to invoice_sent
 *   - Fires MAKE_INVOICE_SENT_WEBHOOK (Make.com sends customer email)
 */

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse body first so we can access painter_token for fallback auth
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const { transaction_id, session_id, job_description, line_items, amount, notes, painter_token: painterToken } = body as {
      transaction_id?: string;
      session_id?: string;
      job_description: string;
      line_items: Array<{ description: string; amount: number }>;
      amount: number;
      notes?: string;
      painter_token?: string;
    };

    if (!job_description || !amount || amount <= 0) {
      return json({ error: "job_description and amount are required" }, 400);
    }
    if (!transaction_id && !session_id) {
      return json({ error: "transaction_id or session_id is required" }, 400);
    }

    let painter: { id: string; first_name: string; last_name: string; email: string; completed_jobs: number; user_id?: string } | null = null;
    let actorId: string | undefined;

    // ── Auth path 1: Supabase JWT ─────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        const { data: p } = await serviceClient
          .from("painters")
          .select("id, first_name, last_name, email, completed_jobs, user_id")
          .eq("user_id", user.id)
          .single();
        if (p) { painter = p; actorId = user.id; }
      }
    }

    // ── Auth path 2: Stream JWT painter_token ─────────────────────────────────
    if (!painter && painterToken) {
      const parts = painterToken.split(".");
      if (parts.length === 3) {
        try {
          const paddedPayload = parts[1] + "==".slice((parts[1].length + 3) % 4 === 0 ? 2 : (parts[1].length % 4));
          const payload = JSON.parse(atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/")));
          const painterId: string | undefined = payload.user_id;
          const exp: number | undefined = payload.exp;

          if (exp && exp < Math.floor(Date.now() / 1000)) {
            return json({ error: "Token expired" }, 401);
          }

          if (painterId) {
            // Verify HMAC signature
            const streamSecret = Deno.env.get("STREAM_API_SECRET")!;
            const sigInput = `${parts[0]}.${parts[1]}`;
            const key = await crypto.subtle.importKey(
              "raw", new TextEncoder().encode(streamSecret),
              { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
            );
            const sigPadded = parts[2] + "==".slice((parts[2].length + 3) % 4 === 0 ? 2 : (parts[2].length % 4));
            const sigBytes = Uint8Array.from(atob(sigPadded.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
            const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(sigInput));

            if (valid) {
              const { data: p } = await serviceClient
                .from("painters")
                .select("id, first_name, last_name, email, completed_jobs, user_id")
                .eq("id", painterId)
                .single();
              if (p) { painter = p; actorId = p.user_id; }
            }
          }
        } catch {
          // token decode failed — fall through to 401
        }
      }
    }

    if (!painter) return json({ error: "Unauthorised" }, 401);

    // Resolve transaction and session
    let txId = transaction_id;
    let session: Record<string, unknown> | null = null;

    if (txId) {
      const { data: tx } = await serviceClient
        .from("transactions")
        .select("*, sessions(*)")
        .eq("id", txId)
        .single();
      if (!tx) return json({ error: "Transaction not found" }, 404);
      if (tx.painter_id !== painter.id) return json({ error: "Not authorised for this transaction" }, 403);
      session = tx.sessions as Record<string, unknown>;
    } else {
      const { data: sess } = await serviceClient
        .from("sessions")
        .select("*")
        .eq("id", session_id!)
        .single();
      if (!sess) return json({ error: "Session not found" }, 404);
      session = sess;
    }

    // Calculate commission
    const commissionRate = painter.completed_jobs >= 11 ? 8 : painter.completed_jobs >= 6 ? 10 : 12;
    const commissionAmount = Math.round(amount * (commissionRate / 100) * 100) / 100;
    const painterPayout = Math.round((amount - commissionAmount) * 100) / 100;

    const refSuffix = (txId ?? session_id ?? "").slice(-6).toUpperCase();
    const invoiceRef = `PBC-${refSuffix}`;
    const invoiceDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });

    const lineItemsHtml = (line_items || [])
      .filter(l => l.description?.trim())
      .map(l => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #222;">${escHtml(l.description)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #222;text-align:right;">£${Number(l.amount).toFixed(2)}</td>
        </tr>`)
      .join("");

    const notesHtml = notes?.trim()
      ? `<p style="font-size:13px;color:#888;margin-top:24px;">${escHtml(notes)}</p>`
      : "";

    const payLinkPlaceholder = "TRANSPACT_PAYMENT_URL";

    const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice ${invoiceRef}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
    <div>
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#f97316;font-weight:600;">PaintBookCo</div>
      <div style="font-size:11px;color:#666;margin-top:2px;">Paint. Book. Done.</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#666;">Invoice</div>
      <div style="font-size:18px;font-weight:700;color:#fff;">${invoiceRef}</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${invoiceDate}</div>
    </div>
  </div>

  <!-- Painter -->
  <div style="background:#111;border:1px solid #1e1e1e;border-radius:8px;padding:20px;margin-bottom:24px;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:8px;">From</div>
    <div style="font-size:16px;font-weight:600;">${escHtml(painter.first_name)} ${escHtml(painter.last_name)}</div>
    <div style="font-size:12px;color:#666;margin-top:4px;">
      <span style="background:#f97316;color:#fff;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;">✓ PaintBookCo Verified</span>
    </div>
  </div>

  <!-- Job description -->
  <div style="margin-bottom:24px;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:8px;">Job Description</div>
    <p style="font-size:14px;color:#ddd;line-height:1.6;margin:0;">${escHtml(job_description)}</p>
  </div>

  <!-- Line items -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <thead>
      <tr>
        <th style="text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;padding-bottom:12px;border-bottom:1px solid #333;">Item</th>
        <th style="text-align:right;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;padding-bottom:12px;border-bottom:1px solid #333;">Amount</th>
      </tr>
    </thead>
    <tbody style="color:#ddd;font-size:14px;">
      ${lineItemsHtml}
    </tbody>
  </table>

  <!-- Total -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
    <div style="background:#111;border:1px solid #f97316;border-radius:8px;padding:16px 24px;text-align:right;">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">Total Due</div>
      <div style="font-size:28px;font-weight:800;color:#f97316;margin-top:4px;">£${Number(amount).toFixed(2)}</div>
    </div>
  </div>

  ${notesHtml}

  <!-- Escrow notice -->
  <div style="background:#0d1a0d;border:1px solid #1a3a1a;border-radius:8px;padding:16px;margin-bottom:24px;">
    <div style="font-size:11px;color:#4ade80;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🔒 Escrow Protected Payment</div>
    <p style="font-size:12px;color:#86efac;margin:0;line-height:1.6;">
      Your payment is held securely by Transpact escrow. Funds are only released to ${escHtml(painter.first_name)} once you confirm the work is complete to your satisfaction.
    </p>
  </div>

  <!-- Pay Now button -->
  <div style="text-align:center;margin-bottom:32px;">
    <a href="${payLinkPlaceholder}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:16px;padding:16px 40px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
      Pay Now — £${Number(amount).toFixed(2)}
    </a>
    <div style="font-size:11px;color:#666;margin-top:8px;">Secure payment via Transpact Escrow</div>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #1e1e1e;padding-top:20px;text-align:center;">
    <div style="font-size:11px;color:#555;">PaintBookCo · The PaintBook Company Ltd · Co. No. 16690724</div>
    <div style="font-size:10px;color:#444;margin-top:4px;">Questions? Visit paintbookco.co.uk/help</div>
  </div>

</div>
</body>
</html>`;

    // Create or update transaction
    const customerToken = (session as Record<string, unknown>).customer_token as string | undefined;

    if (txId) {
      await serviceClient.from("transactions").update({
        invoice_html: invoiceHtml,
        invoice_id: invoiceRef,
        amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        painter_payout: painterPayout,
        job_summary: job_description,
        status: "invoice_sent",
        invoice_sent_at: new Date().toISOString(),
      }).eq("id", txId);
    } else {
      const sess = session as Record<string, unknown>;
      const { data: newTx, error: txErr } = await serviceClient
        .from("transactions")
        .insert({
          session_id,
          painter_id: painter.id,
          customer_email: sess.email as string ?? "",
          customer_first_name: sess.first_name as string ?? "Customer",
          customer_last_name: sess.last_name as string ?? null,
          customer_phone: sess.phone as string ?? null,
          customer_postcode: sess.postcode as string ?? null,
          customer_token: customerToken ?? "",
          invoice_html: invoiceHtml,
          invoice_id: invoiceRef,
          amount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          painter_payout: painterPayout,
          job_summary: job_description,
          status: "invoice_sent",
          invoice_sent_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (txErr || !newTx) {
        console.error("Transaction insert error:", txErr);
        return json({ error: "Failed to create transaction" }, 500);
      }
      txId = newTx.id;

      // Link session to transaction
      await serviceClient.from("sessions").update({
        status: "invoice_sent",
        transaction_id: txId,
      }).eq("id", session_id!);
    }

    // Update session status if not already done above
    if (transaction_id) {
      await serviceClient.from("sessions").update({ status: "invoice_sent" })
        .eq("transaction_id", txId!);
    }

    const sessionToken = customerToken;
    const paymentUrl = `https://www.paintbookco.co.uk/job/${sessionToken ?? txId}`;

    // Replace placeholder with actual customer job page URL
    const finalInvoiceHtml = invoiceHtml.replace(payLinkPlaceholder, paymentUrl);
    await serviceClient.from("transactions")
      .update({ invoice_html: finalInvoiceHtml })
      .eq("id", txId!);

    // Fire Make.com invoice webhook (Make.com sends customer email)
    const invoiceWebhook = Deno.env.get("MAKE_INVOICE_SENT_WEBHOOK");
    if (invoiceWebhook) {
      const sess = session as Record<string, unknown>;
      try {
        await fetch(invoiceWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id: txId,
            customer_email: sess.email,
            customer_first_name: sess.first_name,
            invoice_ref: invoiceRef,
            amount,
            painter_name: `${painter.first_name} ${painter.last_name}`,
            payment_url: paymentUrl,
            job_type: sess.job_type,
            job_description,
          }),
        });
      } catch (err) {
        console.error("Invoice webhook error:", err);
      }
    }

    await serviceClient.from("audit_log").insert({
      action: "invoice_generated",
      actor_id: actorId ?? painter.id,
      actor_role: "painter",
      entity_type: "transaction",
      entity_id: txId,
      details: { invoice_ref: invoiceRef, amount, painter_id: painter.id },
    });

    return json({
      success: true,
      transaction_id: txId,
      invoice_id: invoiceRef,
      payment_url: paymentUrl,
      message: "Invoice generated and customer notified",
    });

  } catch (err) {
    console.error("generate-invoice error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function escHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
