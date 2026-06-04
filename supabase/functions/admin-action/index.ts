import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorised" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorised" }, 401);
    if (user.email !== ADMIN_EMAIL) return json({ error: "Forbidden" }, 403);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { action, painter_email, painter_id, reason } = body;

    if (!action) return json({ error: "action is required" }, 400);

    // Actions that don't require a painter lookup
    const directActions = ["send_dispute_message", "resolve_dispute"];

    let painter: any = null;
    if (!directActions.includes(action)) {
      if (!painter_email && !painter_id)
        return json({ error: "painter_email or painter_id required" }, 400);

      let query = serviceClient.from("painters")
        .select("id, email, first_name, last_name, kyc_status, insurance_verified, is_active");
      if (painter_id) {
        query = query.eq("id", painter_id);
      } else {
        query = query.eq("email", (painter_email as string).toLowerCase().trim());
      }
      const { data } = await query.single();
      if (!data) return json({ error: "Painter not found" }, 404);
      painter = data;
    }

    let updates: Record<string, unknown> = {};
    let auditAction = "";

    switch (action) {
      case "approve_kyc":
        updates = { kyc_status: "approved" };
        auditAction = "kyc_approved";

        // Auto-activate if insurance already verified
        if (painter.insurance_verified) {
          updates = { ...updates, is_active: true, profile_complete: true };
          auditAction = "kyc_approved_and_activated";
        }

        // Fire KYC approved webhook
        const kycWebhook = Deno.env.get("MAKE_KYC_APPROVED_WEBHOOK");
        if (kycWebhook) {
          try {
            await fetch(kycWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                painter_email: painter.email,
                painter_name: `${painter.first_name} ${painter.last_name}`,
                action: "kyc_approved",
              }),
            });
          } catch (e) { console.error("KYC webhook error:", e); }
        }
        break;

      case "reject_kyc":
        updates = {
          kyc_status: "rejected",
          kyc_rejection_reason: reason || "Application unsuccessful."
        };
        auditAction = "kyc_rejected";
        // Insert in-app notification
        await serviceClient.from("notifications").insert({
          painter_id: painter.id,
          title: "KYC Application Unsuccessful",
          message: reason || "Your KYC application was unsuccessful. Please resubmit with the correct documents.",
          type: "kyc_rejected",
        });
        // Fire webhook
        try {
          const webhook = Deno.env.get("MAKE_KYC_REJECTED_WEBHOOK");
          if (webhook) await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              painter_email: painter.email,
              painter_name: `${painter.first_name} ${painter.last_name}`,
              reason: reason || "Application unsuccessful.",
            }),
          });
        } catch (e) { console.error("KYC rejected webhook error:", e); }
        break;

      case "verify_insurance":
        updates = { insurance_verified: true };
        auditAction = "insurance_verified";

        // Auto-activate if KYC already approved
        if (painter.kyc_status === "approved") {
          updates = { ...updates, is_active: true, profile_complete: true };
          auditAction = "insurance_verified_and_activated";
        }
        break;

      case "reject_insurance":
        updates = {
          insurance_submitted_at: null,
          insurance_certificate_url: null,
          insurance_company: null,
          insurance_policy_number: null,
          insurance_expiry_date: null,
        };
        auditAction = "insurance_rejected";
        // Insert in-app notification
        await serviceClient.from("notifications").insert({
          painter_id: painter.id,
          title: "Insurance Submission Returned",
          message: reason || "Your insurance certificate was not accepted. Please resubmit with a valid certificate.",
          type: "insurance_rejected",
        });
        // Fire webhook
        try {
          const webhook = Deno.env.get("MAKE_INSURANCE_REJECTED_WEBHOOK");
          if (webhook) await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              painter_email: painter.email,
              painter_name: `${painter.first_name} ${painter.last_name}`,
              reason: reason || "Insurance certificate not accepted.",
            }),
          });
        } catch (e) { console.error("Insurance rejected webhook error:", e); }
        break;

      case "activate_painter":
        updates = { is_active: true, profile_complete: true };
        auditAction = "painter_activated";
        break;

      case "deactivate_painter":
        updates = { is_active: false };
        auditAction = "painter_deactivated";
        break;

      case "send_dispute_message": {
        const { transaction_id, customer_email, message, recipient, painter_email: painterEmail } = body as any;
        const disputeWebhook = Deno.env.get("MAKE_DISPUTE_RAISED_WEBHOOK");
        if (disputeWebhook) {
          await fetch(disputeWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "admin_message",
              recipient,
              message,
              transaction_id,
              customer_email: recipient === "customer" ? customer_email : undefined,
              painter_email: recipient === "painter" ? painterEmail : undefined,
              admin_name: "PaintBookCo Admin",
            }),
          });
        }
        return json({ success: true });
      }

      case "resolve_dispute": {
        const { transaction_id, resolution } = body as any;
        const { data: transaction } = await serviceClient
          .from("transactions")
          .select("id, session_id, painter_id, customer_email")
          .eq("id", transaction_id)
          .single();

        if (!transaction) return json({ error: "Transaction not found" }, 404);

        if (resolution === "release") {
          await serviceClient.from("transactions")
            .update({ status: "completed" })
            .eq("id", transaction_id);
          if (transaction.session_id) {
            await serviceClient.from("sessions")
              .update({ status: "completed" })
              .eq("id", transaction.session_id);
          }
          if (transaction.painter_id) {
            await serviceClient.from("notifications").insert({
              painter_id: transaction.painter_id,
              title: "Dispute Resolved",
              message: "Dispute resolved in your favour — payment released",
              type: "dispute_resolved",
            });
          }
          const jobCompletedWebhook = Deno.env.get("MAKE_JOB_COMPLETED_WEBHOOK");
          if (jobCompletedWebhook) {
            await fetch(jobCompletedWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "dispute_resolved_release", transaction_id }),
            }).catch(console.error);
          }
        } else if (resolution === "refund") {
          await serviceClient.from("transactions")
            .update({ status: "cancelled" })
            .eq("id", transaction_id);
          if (transaction.session_id) {
            await serviceClient.from("sessions")
              .update({ status: "cancelled" })
              .eq("id", transaction.session_id);
          }
          if (transaction.painter_id) {
            await serviceClient.from("notifications").insert({
              painter_id: transaction.painter_id,
              title: "Dispute Resolved",
              message: "Dispute resolved — funds returned to customer",
              type: "dispute_resolved",
            });
          }
        }
        return json({ success: true });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }

    await serviceClient
      .from("painters")
      .update(updates)
      .eq("id", painter!.id);

    await serviceClient.from("audit_log").insert({
      action: auditAction,
      actor_id: user.id,
      actor_role: "admin",
      entity_type: "painter",
      entity_id: painter!.id,
      details: { painter_email: painter!.email, updates, reason },
    });

    return json({
      success: true,
      action,
      painter_id: painter!.id,
      painter_email: painter!.email,
      updates,
    });

  } catch (err) {
    console.error("admin-action error:", err);
    return json({ error: "Internal error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
