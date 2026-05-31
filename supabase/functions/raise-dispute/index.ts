import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { StreamChat } from "https://esm.sh/stream-chat@8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { transaction_id, customer_token, painter_token, raised_by, reason, attachments } = await req.json();

    if (!transaction_id || !reason || !raised_by) {
      return json({ error: "transaction_id, reason and raised_by are required" }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Get transaction with painter and session details
    const { data: transaction } = await serviceClient
      .from("transactions")
      .select("*, painters(id, first_name, last_name, email, user_id), sessions(id, first_name, last_name, email, customer_token)")
      .eq("id", transaction_id)
      .single();

    if (!transaction) return json({ error: "Transaction not found" }, 404);

    // Verify caller token
    if (raised_by === "customer" && transaction.sessions?.customer_token !== customer_token) {
      return json({ error: "Invalid verification token" }, 403);
    }

    if (transaction.status === "disputed") {
      return json({ success: true, message: "Dispute already raised" });
    }

    // Pause the job
    await serviceClient.from("transactions").update({ status: "disputed", disputed_at: new Date().toISOString() }).eq("id", transaction_id);
    await serviceClient.from("sessions").update({ status: "disputed" }).eq("id", transaction.session_id);

    // Create dispute record with channel IDs
    const sessionId = transaction.session_id;
    const adminCustomerChannelId = `dispute-customer-${sessionId}`;
    const adminPainterChannelId = `dispute-painter-${sessionId}`;

    const { data: dispute, error: disputeError } = await serviceClient.from("disputes").insert({
      transaction_id,
      session_id: sessionId,
      raised_by,
      reason,
      attachments: attachments || [],
      status: "open",
      admin_customer_channel_id: adminCustomerChannelId,
      admin_painter_channel_id: adminPainterChannelId,
    }).select().single();
    if (disputeError) console.error("Dispute insert error:", JSON.stringify(disputeError));
    else console.log("Dispute created:", dispute?.id);

    // Create Stream dispute channels
    const streamApiKey = Deno.env.get("STREAM_API_KEY")!;
    const streamApiSecret = Deno.env.get("STREAM_API_SECRET")!;
    const streamClient = new StreamChat(streamApiKey, streamApiSecret);

    // Get admin user ID from auth
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
    const { data: adminUser } = await serviceClient.auth.admin.listUsers();
    const admin = adminUser?.users?.find((u: any) => u.email === adminEmail);
    const adminUserId = admin?.id ?? "admin";
    console.log("Admin user ID:", adminUserId);
    const customerId = `customer-${sessionId}`;
    const painterId = transaction.painters?.id || transaction.painter_id;

    // Upsert users so they exist in Stream
    await streamClient.upsertUsers([
      { id: adminUserId, name: "PaintBookCo Support" },
      { id: customerId, name: transaction.sessions?.first_name || "Customer" },
    ]);
    if (painterId) {
      await streamClient.upsertUsers([
        { id: painterId, name: `${transaction.painters?.first_name || "Painter"} ${transaction.painters?.last_name || ""}`.trim() },
      ]);
    }

    // Create admin-customer dispute channel
    const customerChannel = streamClient.channel("messaging", adminCustomerChannelId, {
      name: `Dispute: Customer — ${transaction.sessions?.first_name || "Customer"}`,
      created_by_id: adminUserId,
      dispute_id: dispute?.id,
      dispute_type: "customer",
    });
    await customerChannel.create();
    await customerChannel.addMembers([adminUserId, customerId]);

    // Create admin-painter dispute channel
    if (painterId) {
      const painterChannel = streamClient.channel("messaging", adminPainterChannelId, {
        name: `Dispute: Painter — ${transaction.painters?.first_name || "Painter"}`,
        created_by_id: adminUserId,
        dispute_id: dispute?.id,
        dispute_type: "painter",
      });
      await painterChannel.create();
      await painterChannel.addMembers([adminUserId, painterId]);
      console.log("Dispute channels created - painterId:", painterId, "customerId:", customerId);

      // Send initial message in painter channel
      await painterChannel.sendMessage({
        text: `🚨 Dispute raised by ${raised_by}: "${reason}"\n\nOur team will review this and contact you shortly.`,
        user_id: adminUserId,
      });
    }

    // Send initial message in customer channel
    await customerChannel.sendMessage({
      text: `🚨 Dispute raised by ${raised_by}: "${reason}"\n\nOur team will review this and contact you shortly.`,
      user_id: adminUserId,
    });

    // Fire Make.com webhook
    const disputeWebhook = Deno.env.get("MAKE_DISPUTE_RAISED_WEBHOOK");
    if (disputeWebhook) {
      await fetch(disputeWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispute_id: dispute?.id,
          transaction_id,
          session_id: sessionId,
          raised_by,
          reason,
          customer_email: transaction.sessions?.email,
          customer_name: transaction.sessions?.first_name,
          painter_email: transaction.painters?.email,
          painter_name: `${transaction.painters?.first_name} ${transaction.painters?.last_name}`,
          admin_customer_channel: adminCustomerChannelId,
          admin_painter_channel: adminPainterChannelId,
        }),
      }).catch(console.error);
    }

    return json({
      success: true,
      message: "Dispute raised successfully. Our team will contact you within 24 hours.",
      dispute_id: dispute?.id,
    });

  } catch (err) {
    console.error("raise-dispute error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});
 
 
