import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://deft-sherbet-1450d7.netlify.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "o.a.alashe@paintbookco.co.uk";

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
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorised" }, 401);
    if (user.email !== ADMIN_EMAIL) return json({ error: "Forbidden" }, 403);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { action, painter_email, painter_id, reason } = await req.json();

    if (!action) return json({ error: "action is required" }, 400);
    if (!painter_email && !painter_id)
      return json({ error: "painter_email or painter_id required" }, 400);

    // Find painter
    let query = serviceClient.from("painters")
      .select("id, email, first_name, last_name, kyc_status, insurance_verified, is_active");
    if (painter_id) {
      query = query.eq("id", painter_id);
    } else {
      query = query.eq("email", painter_email.toLowerCase().trim());
    }
    const { data: painter } = await query.single();
    if (!painter) return json({ error: "Painter not found" }, 404);

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
        break;

      case "activate_painter":
        updates = { is_active: true, profile_complete: true };
        auditAction = "painter_activated";
        break;

      case "deactivate_painter":
        updates = { is_active: false };
        auditAction = "painter_deactivated";
        break;

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }

    await serviceClient
      .from("painters")
      .update(updates)
      .eq("id", painter.id);

    await serviceClient.from("audit_log").insert({
      action: auditAction,
      actor_id: user.id,
      actor_role: "admin",
      entity_type: "painter",
      entity_id: painter.id,
      details: { painter_email: painter.email, updates, reason },
    });

    return json({
      success: true,
      action,
      painter_id: painter.id,
      painter_email: painter.email,
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
