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

    if (transaction.status === "cancelled") {
      return json({ success: true, message: "Job already cancelled" });
    }

    if (!["job_posted", "painter_contacted"].includes(transaction.status)) {
      return json({ error: "Job can only be cancelled before invoice is sent" }, 400);
    }

    await serviceClient
      .from("transactions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", transaction_id);

    if (transaction.session_id) {
      await serviceClient
        .from("sessions")
        .update({ status: "cancelled" })
        .eq("id", transaction.session_id);
    }

    await serviceClient.from("audit_log").insert({
      action: "job_cancelled",
      actor_role: "customer",
      entity_type: "transaction",
      entity_id: transaction_id,
      details: { painter_id: transaction.painter_id },
    });

    return json({
      success: true,
      message: "Job cancelled successfully.",
    });

  } catch (err) {
    console.error("cancel-job error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
