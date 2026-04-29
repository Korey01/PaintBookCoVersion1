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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated" }, 401);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { session_id, agreed_price, job_summary, chat_channel_id } = await req.json();

    if (!session_id || !agreed_price) {
      return json({ error: "session_id and agreed_price are required" }, 400);
    }

    // Get painter details
    const { data: painter } = await serviceClient
      .from("painters")
      .select("id, first_name, last_name, email, phone, specialisms, avg_rating, completed_jobs")
      .eq("user_id", user.id)
      .single();

    if (!painter) return json({ error: "Painter not found" }, 404);

    // Get session details
    const { data: session } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (!session) return json({ error: "Session not found" }, 404);

    // Calculate commission
    const commissionRate = painter.completed_jobs >= 11 ? 8
      : painter.completed_jobs >= 6 ? 10 : 12;
    const commissionAmount = agreed_price * (commissionRate / 100);
    const painterPayout = agreed_price - commissionAmount;

    const invoiceId = `PBC-${session_id.slice(-8).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });

    // Generate invoice HTML using Claude
    const anthropicRes = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `Generate a professional painting job invoice as clean HTML with inline CSS only.

Job Details:
- Invoice Number: ${invoiceId}
- Date: ${invoiceDate}
- Job Type: ${session.job_type}
- Description: ${session.job_description || "As agreed"}
- Rooms: ${JSON.stringify(session.rooms || [])}
- Job Summary: ${job_summary || "Painting and decorating as discussed"}

Painter Details:
- Name: ${painter.first_name} ${painter.last_name}
- Verified by PaintBookCo
- Rating: ${painter.avg_rating}/5 (${painter.completed_jobs} completed jobs)

Pricing:
- Total Amount: £${agreed_price}
- Payment Method: Transpact Escrow (funds held securely until completion)

Requirements:
1. Professional dark-themed design (#0a0a0a background, white text, #f97316 orange accents)
2. PaintBookCo header with tagline "Paint. Book. Done."
3. Invoice number, date, job reference clearly visible
4. Job description and rooms listed
5. Painter verified badge
6. Clear pricing breakdown
7. A prominent orange "PAY NOW - £${agreed_price}" button with this exact placeholder href: PAYMENT_LINK_PLACEHOLDER
8. Escrow protection notice: "Your payment is protected by Transpact escrow. Funds are only released when you confirm the job is complete."
9. Footer: PaintBookCo | The PaintBook Company Ltd | Co. No. 16690724
10. Mobile responsive

IMPORTANT: 
- Do NOT include any customer personal details
- Do NOT include any contact forms
- Return ONLY the complete HTML document, nothing else`
          }]
        })
      }
    );

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("Anthropic API error:", err);
      return json({ error: "Failed to generate invoice" }, 502);
    }

    const anthropicData = await anthropicRes.json();
    const invoiceHtml = anthropicData.content[0].text;

    // Create transaction record
    const { data: transaction, error: txError } = await serviceClient
      .from("transactions")
      .insert({
        session_id,
        painter_id: painter.id,
        job_summary: job_summary || session.job_description,
        chat_channel_id: chat_channel_id || null,
        invoice_id: invoiceId,
        invoice_html: invoiceHtml,
        amount: agreed_price,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        painter_payout: painterPayout,
        status: "invoice_sent",
        invoice_sent_at: new Date().toISOString(),
        customer_email: session.email || "",
        customer_first_name: "TBC",
        customer_last_name: "TBC",
        customer_phone: "TBC",
        customer_address: "TBC",
        customer_postcode: session.postcode || "TBC",
      })
      .select("id")
      .single();

    if (txError) {
      console.error("Transaction insert error:", txError);
      return json({ error: "Failed to create transaction" }, 500);
    }

    // Update session
    await serviceClient
      .from("sessions")
      .update({
        status: "invoice_sent",
        converted_to_transaction: true,
        transaction_id: transaction.id,
      })
      .eq("id", session_id);

    // Generate payment URL
    const paymentUrl = `https://www.paintbookco.co.uk/pay/${transaction.id}`;

    // Replace placeholder in invoice HTML
    const finalInvoiceHtml = invoiceHtml.replace(
      "PAYMENT_LINK_PLACEHOLDER",
      paymentUrl
    );

    // Update transaction with final invoice HTML
    await serviceClient
      .from("transactions")
      .update({ invoice_html: finalInvoiceHtml })
      .eq("id", transaction.id);

    // Send invoice via Make.com
    const makeWebhook = Deno.env.get("MAKE_INVOICE_SENT_WEBHOOK");
    if (makeWebhook && session.email) {
      try {
        await fetch(makeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_email: session.email,
            invoice_id: invoiceId,
            transaction_id: transaction.id,
            amount: agreed_price,
            painter_name: `${painter.first_name} ${painter.last_name}`,
            payment_url: paymentUrl,
            job_type: session.job_type,
            job_summary,
          }),
        });
      } catch (webhookErr) {
        console.error("Make.com webhook error:", webhookErr);
      }
    }

    return json({
      success: true,
      transaction_id: transaction.id,
      invoice_id: invoiceId,
      payment_url: paymentUrl,
      message: "Invoice generated and sent to customer",
    });

  } catch (err) {
    console.error("generate-invoice error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
