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

    // Get transaction
    const { data: transaction } = await serviceClient
      .from("transactions")
      .select("*, painters(id, first_name, last_name, email, completed_jobs)")
      .eq("id", transaction_id)
      .single();

    if (!transaction) return json({ error: "Transaction not found" }, 404);

    // Verify customer token
    if (transaction.customer_token !== customer_token) {
      return json({ error: "Invalid verification token" }, 403);
    }

    if (transaction.status === "completed") {
      return json({ 
        success: true, 
        message: "Job already confirmed as complete" 
      });
    }

    if (!["funded", "in_progress", "completion_requested"].includes(transaction.status)) {
      return json({ error: "Transaction is not in a completable state" }, 400);
    }

    // Update transaction to completed
    await serviceClient
      .from("transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", transaction_id);

    // Update painter completed_jobs count
    if (transaction.painters) {
      await serviceClient
        .from("painters")
        .update({
          completed_jobs: (transaction.painters.completed_jobs || 0) + 1,
        })
        .eq("id", transaction.painter_id);
    }

    // Update session
    if (transaction.session_id) {
      await serviceClient
        .from("sessions")
        .update({ status: "completed" })
        .eq("id", transaction.session_id);
    }

    // Freeze Stream channel — chat becomes read-only after completion
    if (transaction.session_id) {
      try {
        const streamApiKey = Deno.env.get("STREAM_API_KEY")!;
        const streamSecret = Deno.env.get("STREAM_API_SECRET")!;
        const channelId = `job-${transaction.session_id}`;
        // Generate server token
        const header = { alg: "HS256", typ: "JWT" };
        const payload = { server: true, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };
        const encode = (obj: object) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
        const sigInput = `${encode(header)}.${encode(payload)}`;
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(streamSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sigInput));
        const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
        const serverToken = `${sigInput}.${sigB64}`;
        await fetch(`https://chat.stream-io-api.com/channels/messaging/${channelId}?api_key=${streamApiKey}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serverToken}`, "stream-auth-type": "jwt" },
          body: JSON.stringify({ set: { frozen: true } }),
        });
      } catch (streamErr) {
        console.error("Stream freeze error:", streamErr);
      }
    }

    // Fire Make.com completion webhook
    const completionWebhook = Deno.env.get("MAKE_JOB_COMPLETED_WEBHOOK");
    if (completionWebhook) {
      try {
        await fetch(completionWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "job_completed",
            transaction_id,
            job_ref: transaction.invoice_id || `PBC-${transaction_id.slice(-6).toUpperCase()}`,
            painter_email: transaction.painters?.email,
            painter_name: `${transaction.painters?.first_name} ${transaction.painters?.last_name}`,
            painter_first_name: transaction.painters?.first_name,
            customer_email: transaction.customer_email,
            customer_first_name: transaction.customer_first_name || "",
            amount: transaction.amount,
            painter_payout: transaction.painter_payout,
            job_summary: transaction.job_summary,
            my_jobs_link: "https://www.paintbookco.co.uk/dashboard/painter?tab=my-jobs",
            review_link: transaction.customer_token
              ? `https://www.paintbookco.co.uk/job/${transaction.customer_token}#review`
              : "",
            track_job_link: transaction.customer_token
              ? `https://www.paintbookco.co.uk/job/${transaction.customer_token}`
              : "",
          }),
        });
      } catch (err) {
        console.error("Completion webhook error:", err);
      }
    }

    // Audit log
    await serviceClient.from("audit_log").insert({
      action: "transaction_completed",
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
      message: "Job confirmed complete. Payment has been released to your painter.",
    });

  } catch (err) {
    console.error("confirm-completion error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
