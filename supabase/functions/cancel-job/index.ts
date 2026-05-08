import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { transaction_id, session_id, customer_token } = body as {
      transaction_id?: string;
      session_id?: string;
      customer_token: string;
    };

    if ((!transaction_id && !session_id) || !customer_token) {
      return json({ error: "customer_token and either transaction_id or session_id are required" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // ── Transaction-based path ───────────────────────────────────────────────
    if (transaction_id) {
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
      if (!["job_posted", "painter_contacted", "invoice_sent"].includes(transaction.status)) {
        return json({ error: "Job can only be cancelled before payment is made" }, 400);
      }

      await serviceClient
        .from("transactions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
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

      return json({ success: true, message: "Job cancelled successfully." });
    }

    // ── Session-based path (no transaction yet) ──────────────────────────────
    const { data: session } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id!)
      .single();

    if (!session) return json({ error: "Session not found" }, 404);
    if (session.customer_token !== customer_token) {
      return json({ error: "Invalid verification token" }, 403);
    }
    if (session.status === "cancelled") {
      return json({ success: true, message: "Job already cancelled" });
    }
    if (!["job_posted", "painter_contacted"].includes(session.status)) {
      return json({ error: "Job can only be cancelled before payment is made" }, 400);
    }

    await serviceClient
      .from("sessions")
      .update({ status: "cancelled" })
      .eq("id", session_id!);

    await serviceClient.from("audit_log").insert({
      action: "job_cancelled",
      actor_role: "customer",
      entity_type: "session",
      entity_id: session_id,
      details: {},
    });

    return json({ success: true, message: "Job cancelled successfully." });

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
