import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transaction_id, customer_token } = await req.json();

    if (!transaction_id || !customer_token) {
      return json({ error: "transaction_id and customer_token are required" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: transaction } = await serviceClient
      .from("transactions")
      .select("*, painters(id, first_name, last_name, email)")
      .eq("id", transaction_id)
      .single();

    if (!transaction) return json({ error: "Transaction not found" }, 404);

    if (transaction.customer_token !== customer_token) {
      return json({ error: "Invalid verification token" }, 403);
    }

    if (transaction.status === "disputed") {
      return json({ success: true, message: "Dispute already raised" });
    }

    if (!["funded", "in_progress", "completion_requested"].includes(transaction.status)) {
      return json({ error: "Dispute can only be raised after escrow is funded" }, 400);
    }

    await serviceClient
      .from("transactions")
      .update({
        status: "disputed",
        disputed_at: new Date().toISOString(),
      })
      .eq("id", transaction_id);

    if (transaction.session_id) {
      await serviceClient
        .from("sessions")
        .update({ status: "disputed" })
        .eq("id", transaction.session_id);
    }

    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
    const disputeWebhook = Deno.env.get("MAKE_DISPUTE_RAISED_WEBHOOK");
    if (disputeWebhook) {
      try {
        await fetch(disputeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id,
            admin_email: adminEmail,
            customer_email: transaction.customer_email,
            painter_email: transaction.painters?.email,
            painter_name: `${transaction.painters?.first_name} ${transaction.painters?.last_name}`,
            amount: transaction.amount,
            job_summary: transaction.job_summary,
            disputed_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Dispute webhook error:", err);
      }
    }

    await serviceClient.from("audit_log").insert({
      action: "dispute_raised",
      actor_role: "customer",
      entity_type: "transaction",
      entity_id: transaction_id,
      details: {
        amount: transaction.amount,
        painter_id: transaction.painter_id,
      },
    });

    return json({
      success: true,
      message: "Dispute raised. Our team will review within 24 hours. Escrow funds are frozen.",
    });

  } catch (err) {
    console.error("raise-dispute error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
