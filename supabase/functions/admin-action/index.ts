import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, painter_email, painter_id, reason } = await req.json();

    if (!action) return json({ error: "action is required" }, 400);
    if (!painter_email && !painter_id) 
      return json({ error: "painter_email or painter_id required" }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Find painter
    let query = serviceClient.from("painters").select("id, email, first_name");
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
        auditAction = "kyc_approved_via_hubspot";
        break;
      case "reject_kyc":
        updates = { 
          kyc_status: "rejected",
          kyc_rejection_reason: reason || "Application unsuccessful."
        };
        auditAction = "kyc_rejected_via_hubspot";
        break;
      case "verify_insurance":
        updates = { insurance_verified: true };
        auditAction = "insurance_verified_via_hubspot";
        break;
      case "activate_painter":
        updates = { is_active: true, profile_complete: true };
        auditAction = "painter_activated_via_hubspot";
        break;
      case "deactivate_painter":
        updates = { is_active: false };
        auditAction = "painter_deactivated_via_hubspot";
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
      actor_role: "admin",
      entity_type: "painter",
      entity_id: painter.id,
      details: { painter_email: painter.email, updates, source: "hubspot" },
    });

    return json({ 
      success: true, 
      action, 
      painter_id: painter.id,
      painter_email: painter.email 
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
