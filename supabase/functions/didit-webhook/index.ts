import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-signature-v2, x-timestamp",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature-v2");
    const timestamp = req.headers.get("x-timestamp");
    const webhookSecret = Deno.env.get("DIDIT_WEBHOOK_SECRET");

    // Verify webhook signature
    if (webhookSecret && signature && timestamp) {
      const expectedSig = createHmac("sha256", webhookSecret)
        .update(`${timestamp}.${body}`)
        .digest("hex");
      if (expectedSig !== signature) {
        console.error("Invalid webhook signature");
        return json({ error: "Invalid signature." }, 401);
      }
    }

    const payload = JSON.parse(body);
    console.log("Didit webhook payload:", JSON.stringify(payload));

    const {
      session_id,
      status,
      vendor_data: painterId,
      webhook_type,
    } = payload;

    if (!painterId) {
      return json({ error: "No vendor_data in payload." }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: painter } = await serviceClient
      .from("painters")
      .select("id, email, first_name, user_id")
      .eq("id", painterId)
      .single();

    if (!painter) {
      console.error("Painter not found for vendor_data:", painterId);
      return json({ error: "Painter not found." }, 404);
    }

    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "approved") {
      // Update painter KYC status to approved
      await serviceClient
        .from("painters")
        .update({ kyc_status: "approved" })
        .eq("id", painterId);

      // Fire Make.com KYC approved webhook
      const makeWebhook = Deno.env.get("MAKE_KYC_APPROVED_WEBHOOK");
      if (makeWebhook) {
        await fetch(makeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            painter_id: painterId,
            painter_email: painter.email,
            painter_name: painter.first_name,
            session_id,
            status: "approved",
          }),
        });
      }

      await serviceClient.from("audit_log").insert({
        action: "kyc_approved",
        actor_id: painter.user_id,
        actor_role: "system",
        entity_type: "painter",
        entity_id: painterId,
        details: { session_id, didit_status: status },
      });

    } else if (
      normalizedStatus === "declined" ||
      normalizedStatus === "rejected"
    ) {
      const rejectionReason =
        payload.decision?.rejection_reason ||
        payload.rejection_reason ||
        "Identity verification was unsuccessful. Please ensure your documents are valid and try again.";

      await serviceClient
        .from("painters")
        .update({
          kyc_status: "rejected",
          kyc_rejection_reason: rejectionReason,
        })
        .eq("id", painterId);

      await serviceClient.from("audit_log").insert({
        action: "kyc_rejected",
        actor_id: painter.user_id,
        actor_role: "system",
        entity_type: "painter",
        entity_id: painterId,
        details: { session_id, didit_status: status, rejectionReason },
      });

    } else {
      // In review or other status — just log
      await serviceClient.from("audit_log").insert({
        action: "kyc_status_update",
        actor_id: painter.user_id,
        actor_role: "system",
        entity_type: "painter",
        entity_id: painterId,
        details: { session_id, didit_status: status, webhook_type },
      });
    }

    return json({ success: true });

  } catch (err) {
    console.error("didit-webhook error:", err);
    return json({ error: "Internal error." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
