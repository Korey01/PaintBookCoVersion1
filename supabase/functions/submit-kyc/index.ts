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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorised." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated." }, 401);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: painter } = await serviceClient
      .from("painters")
      .select("id, kyc_status, email, first_name, last_name")
      .eq("user_id", user.id)
      .single();

    if (!painter) return json({ error: "Painter record not found." }, 404);

    if (painter.kyc_status === "approved") {
      return json({ error: "KYC already approved." }, 400);
    }

    // Create Didit verification session using API key directly
    const sessionRes = await fetch(
      "https://verification.didit.me/v3/session/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("DIDIT_API_KEY")!,
        },
        body: JSON.stringify({
          vendor_data: painter.id,
          callback: "https://deft-sherbet-1450d7.netlify.app/kyc/painter",
          workflow_id: Deno.env.get("DIDIT_WORKFLOW_ID"),
        }),
      }
    );

    if (!sessionRes.ok) {
      const err = await sessionRes.text();
      console.error("Didit session error status:", sessionRes.status);
      console.error("Didit session error body:", err);
      return json({ 
        error: "Failed to create verification session.", 
        didit_status: sessionRes.status,
        didit_error: err 
      }, 502);
    }

    const session = await sessionRes.json();

    // Update painter kyc_status to submitted
    await serviceClient
      .from("painters")
      .update({ kyc_status: "submitted" })
      .eq("id", painter.id);

    // Audit log
    await serviceClient.from("audit_log").insert({
      action: "kyc_session_created",
      actor_id: user.id,
      actor_role: "painter",
      entity_type: "painter",
      entity_id: painter.id,
      details: {
        session_id: session.session_id,
        didit_status: session.status,
      },
    });

    return json({
      success: true,
      verification_url: session.verification_url || session.url,
      session_id: session.session_id,
    });

  } catch (err) {
    console.error("submit-kyc error:", err);
    return json({ error: "An unexpected error occurred." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
