import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function validateUKPhone(phone: string): boolean {
  return /^(\+44|0044|0)[0-9\s\-\.]{9,14}$/.test(phone.trim());
}

function validateUKPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(postcode.trim());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      transaction_id,
      customer_first_name,
      customer_last_name,
      customer_phone,
      customer_address,
      customer_postcode,
      customer_email,
    } = await req.json();

    if (!transaction_id || !customer_first_name || !customer_last_name ||
        !customer_phone || !customer_address || !customer_postcode || !customer_email) {
      return json({ error: "All customer details are required" }, 400);
    }

    if (!validateUKPhone(customer_phone)) {
      return json({ error: "Please enter a valid UK phone number" }, 400);
    }

    if (!validateUKPostcode(customer_postcode)) {
      return json({ error: "Please enter a valid UK postcode" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Get transaction
    const { data: transaction } = await serviceClient
      .from("transactions")
      .select("*, painters(id, first_name, last_name, email, phone)")
      .eq("id", transaction_id)
      .single();

    if (!transaction) return json({ error: "Transaction not found" }, 404);

    if (transaction.status === "funded" || transaction.status === "completed") {
      return json({ error: "This invoice has already been paid" }, 400);
    }

    // Generate customer token for later verification
    const customerToken = btoa(
      `${transaction_id}:${customer_email}:${Date.now()}`
    );

    // Update transaction with customer details
    await serviceClient
      .from("transactions")
      .update({
        customer_first_name: customer_first_name.trim(),
        customer_last_name: customer_last_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_address: customer_address.trim(),
        customer_postcode: customer_postcode.trim().toUpperCase(),
        customer_email: customer_email.toLowerCase().trim(),
        customer_token: customerToken,
        status: "funded",
        funded_at: new Date().toISOString(),
      })
      .eq("id", transaction_id);

    const painter = transaction.painters;

    // Share customer contact details with painter + terms
    const contactWebhook = Deno.env.get("MAKE_CONTACT_SHARED_WEBHOOK");
    const confirmationUrl = `https://paintbook-app.netlify.app/confirm-completion/${transaction_id}?token=${customerToken}`;
    const commissionRate = transaction.commission_rate || 12;
    const painterPayout = transaction.painter_payout || (transaction.amount * 0.88);

    if (contactWebhook && painter) {
      try {
        await fetch(contactWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Painter details
            painter_name: `${painter.first_name} ${painter.last_name}`,
            painter_email: painter.email,
            painter_phone: painter.phone,
            painter_payout: painterPayout,
            commission_rate: commissionRate,
            // Customer details
            customer_first_name: customer_first_name.trim(),
            customer_last_name: customer_last_name.trim(),
            customer_phone: customer_phone.trim(),
            customer_address: customer_address.trim(),
            customer_postcode: customer_postcode.trim().toUpperCase(),
            customer_email: customer_email.toLowerCase().trim(),
            // Job details
            job_summary: transaction.job_summary,
            invoice_id: transaction.invoice_id,
            transaction_id,
            amount: transaction.amount,
            // Links
            confirmation_url: confirmationUrl,
            // Terms of job (included in both emails)
            terms_of_job: [
              "Payment is held securely in Transpact escrow",
              "Funds are released ONLY when the customer confirms completion",
              "If unsatisfied, customer must raise a dispute BEFORE confirming",
              "No off-platform contact details should be exchanged",
              "PaintBookCo commission of " + commissionRate + "% applies to this job",
              "Painter payout on completion: £" + painterPayout.toFixed(2),
            ].join(" | "),
          }),
        });
      } catch (err) {
        console.error("Contact shared webhook error:", err);
      }
    }

    // Send painter contact details to customer
    const painterDetailsWebhook = Deno.env.get("MAKE_PAINTER_DETAILS_TO_CUSTOMER_WEBHOOK");
    if (painterDetailsWebhook && painter) {
      try {
        await fetch(painterDetailsWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_email: customer_email.toLowerCase().trim(),
            customer_phone: customer_phone.trim(),
            customer_first_name: customer_first_name.trim(),
            painter_first_name: painter.first_name,
            painter_last_name: painter.last_name,
            painter_phone: painter.phone,
            painter_email: painter.email,
            transaction_id,
            job_summary: transaction.job_summary,
            amount: transaction.amount,
          }),
        });
      } catch (err) {
        console.error("Painter details webhook error:", err);
      }
    }

    // Update session status
    if (transaction.session_id) {
      await serviceClient
        .from("sessions")
        .update({ status: "paid" })
        .eq("id", transaction.session_id);
    }

    // Audit log
    await serviceClient.from("audit_log").insert({
      action: "transaction_funded",
      actor_role: "customer",
      entity_type: "transaction",
      entity_id: transaction_id,
      details: {
        amount: transaction.amount,
        painter_id: transaction.painter_id,
        customer_email: customer_email.toLowerCase().trim(),
      },
    });

    return json({
      success: true,
      message: "Payment details received",
      transaction_id,
      customer_token: customerToken,
    });

  } catch (err) {
    console.error("process-payment error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
