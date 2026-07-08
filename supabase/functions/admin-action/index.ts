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
                painter_first_name: painter.first_name,
                painter_name: `${painter.first_name} ${painter.last_name}`,
                action: "kyc_approved",
                dashboard_link: "https://www.paintbookco.co.uk/dashboard/painter?tab=profile",
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
              painter_first_name: painter.first_name,
              painter_name: `${painter.first_name} ${painter.last_name}`,
              reason: reason || "Application unsuccessful.",
              contact_email: "hello@paintbookco.co.uk",
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
              painter_first_name: painter.first_name,
              painter_name: `${painter.first_name} ${painter.last_name}`,
              reason: reason || "Insurance certificate not accepted.",
              reupload_link: "https://www.paintbookco.co.uk/dashboard/painter?tab=profile",
              contact_email: "hello@paintbookco.co.uk",
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
              body: JSON.stringify({
                type: "dispute_resolved_release",
                transaction_id,
                customer_email: transaction.customer_email,
                admin_link: "https://www.paintbookco.co.uk/admin",
              }),
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

      case "rtw_verified": {
        // Admin confirms RTW is verified after reviewing painter submission
        const { rtw_visa_expiry, rtw_notes } = body as any;
        await serviceClient.from("painters").update({
          rtw_status: "verified",
          rtw_visa_expiry: rtw_visa_expiry || null,
          rtw_checked_at: new Date().toISOString(),
          rtw_notes: rtw_notes || null,
        }).eq("email", painter_email);

        // In-app notification
        const { data: p1 } = await serviceClient.from("painters").select("id, first_name, last_name, email").eq("email", painter_email).single();
        if (p1) {
          await serviceClient.from("notifications").insert({
            painter_id: p1.id,
            title: "Right to Work Verified",
            message: "Your right to work in the UK has been successfully verified by PaintBookCo.",
            type: "rtw_verified",
          }).catch(() => {});

          // Email via Make.com
          const rtwWebhook = Deno.env.get("MAKE_RTW_VERIFIED_WEBHOOK");
          if (rtwWebhook) {
            await fetch(rtwWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                painter_email: p1.email,
                painter_first_name: p1.first_name,
                painter_name: `${p1.first_name} ${p1.last_name}`,
                dashboard_link: "https://www.paintbookco.co.uk/dashboard/painter?tab=profile",
              }),
            }).catch(() => {});
          }
        }
        return json({ success: true, message: "RTW verified" });
      }

      case "rtw_rejected": {
        const { rtw_notes } = body as any;
        await serviceClient.from("painters").update({
          rtw_status: "rejected",
          rtw_notes: rtw_notes || null,
        }).eq("email", painter_email);

        const { data: p2 } = await serviceClient.from("painters").select("id, first_name, last_name, email").eq("email", painter_email).single();
        if (p2) {
          await serviceClient.from("notifications").insert({
            painter_id: p2.id,
            title: "Right to Work Check Failed",
            message: rtw_notes || "We were unable to verify your right to work. Please contact hello@paintbookco.co.uk for assistance.",
            type: "rtw_rejected",
          }).catch(() => {});
        }
        return json({ success: true, message: "RTW rejected" });
      }

      case "request_rtw": {
        const { data: rtwPainter } = await serviceClient
          .from("painters")
          .select("id, first_name, last_name, email, user_id")
          .eq("email", painter_email)
          .single();

        if (!rtwPainter) return json({ error: "Painter not found" }, 404);

        await serviceClient.from("painters").update({ rtw_status: "requested" }).eq("email", painter_email);

        const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
        if (sendgridKey) {
          const emailHtml = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header with logo -->
        <tr>
          <td style="background:#1B3A5C;padding:24px 32px;text-align:center;">
            <img src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png"
              alt="PaintBookCo" style="height:36px;max-width:160px;object-fit:contain;display:block;margin:0 auto;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;color:#333;margin-top:0;">Dear ${rtwPainter.first_name},</p>
            <p style="font-size:15px;color:#333;line-height:1.7;">
              As part of our compliance obligations under the
              <strong>Immigration, Asylum and Nationality Act 2006</strong>,
              PaintBookCo is required to verify the right to work of all painters
              and decorators registered on our platform.
            </p>
            <p style="font-size:15px;color:#333;line-height:1.7;">
              We need to verify your right to work in the United Kingdom.
              Please log in to your dashboard and provide <strong>one</strong> of the following:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0;">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#333;line-height:1.7;">
                  ✅ <strong>Share Code</strong> — if you have a Biometric Residence Permit, visa,
                  or digital immigration status.<br>
                  <span style="color:#666;font-size:13px;">Get your share code at
                    <a href="https://www.gov.uk/prove-right-to-work" style="color:#D85A30;">gov.uk/prove-right-to-work</a>
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#333;line-height:1.7;">
                  ✅ <strong>Document Upload</strong> — a copy of your British or Irish passport,
                  or other accepted right to work documents
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin:16px 0;">
              <tr>
                <td style="font-size:14px;color:#856404;">
                  ⚠️ <strong>Important:</strong> Failure to provide this information within
                  <strong>7 days</strong> may result in your account being suspended until
                  verification is complete.
                </td>
              </tr>
            </table>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://www.paintbookco.co.uk/dashboard/painter?tab=profile"
                style="background:#D85A30;color:#ffffff;padding:16px 36px;border-radius:6px;
                text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
                Complete Right to Work Check →
              </a>
            </div>
            <p style="font-size:13px;color:#666;line-height:1.7;">
              If you have any questions or need assistance, please contact us at
              <a href="mailto:hello@paintbookco.co.uk" style="color:#D85A30;">hello@paintbookco.co.uk</a>
            </p>
            <p style="font-size:13px;color:#666;line-height:1.7;">
              This is a legal requirement. PaintBookCo is committed to ensuring all workers
              on our platform are legally authorised to work in the UK.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #e5e5e5;text-align:center;">
            <p style="font-size:11px;color:#999;margin:0;">
              © PaintBookCo — The Paint Book Company Ltd · Company No. 16690724<br>
              <a href="mailto:noreply@paintbookco.co.uk" style="color:#bbb;text-decoration:none;">noreply@paintbookco.co.uk</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

          const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${sendgridKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: rtwPainter.email }] }],
              from: { email: "noreply@paintbookco.co.uk", name: "PaintBookCo" },
              subject: "Action Required: Right to Work Verification — PaintBookCo",
              content: [{ type: "text/html", value: emailHtml }],
            }),
          });
          // Log SendGrid response
          if (!sgRes.ok) {
            const errText = await sgRes.text();
            console.error("RTW SendGrid error:", sgRes.status, errText);
          } else {
            console.log("RTW email sent successfully to:", rtwPainter.email);
          }
        }

        try {
          await serviceClient.from("notifications").insert({
            painter_id: rtwPainter.id,
            title: "Right to Work Check Required",
            message: "PaintBookCo needs to verify your right to work in the UK. Please check your email and complete the verification via your dashboard.",
            type: "rtw_requested",
          });
        } catch (e) { console.error("RTW notification error:", e); }

        try {
          await serviceClient.from("audit_log").insert({
            action: "rtw_check_requested",
            actor_role: "admin",
            entity_type: "painter",
            entity_id: rtwPainter.id,
            details: { painter_email, painter_name: `${rtwPainter.first_name} ${rtwPainter.last_name}` },
          });
        } catch (e) { console.error("RTW audit error:", e); }

        return json({ success: true, message: "RTW check requested and email sent" });
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
