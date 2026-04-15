import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorisation." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated." }, 401);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: painter } = await serviceClient
      .from("painters").select("id, kyc_status")
      .eq("user_id", user.id).single();

    if (!painter) return json({ error: "Painter record not found." }, 404);

    const {
      insurance_company, insurance_policy_number,
      insurance_policy_details, insurance_expiry_date,
      insurance_certificate_url, certificate_size_bytes
    } = await req.json();

    if (!insurance_company) return json({ error: "Insurance company is required." }, 400);
    if (!insurance_policy_number) return json({ error: "Policy number is required." }, 400);
    if (!insurance_policy_details) return json({ error: "Policy details are required." }, 400);
    if (!insurance_expiry_date) return json({ error: "Expiry date is required." }, 400);
    if (!insurance_certificate_url) return json({ error: "Certificate upload is required." }, 400);

    if (new Date(insurance_expiry_date) <= new Date())
      return json({ error: "Insurance expiry date must be in the future." }, 400);

    if (certificate_size_bytes && certificate_size_bytes > MAX_FILE_SIZE)
      return json({ error: "Certificate file must be under 5MB." }, 400);

    await serviceClient.from("painters").update({
      insurance_company,
      insurance_policy_number,
      insurance_policy_details,
      insurance_expiry_date,
      insurance_certificate_url,
      insurance_submitted_at: new Date().toISOString(),
      insurance_verified: false,
    }).eq("id", painter.id);

    await serviceClient.from("audit_log").insert({
      action: "insurance_submitted",
      actor_id: user.id,
      actor_role: "painter",
      entity_type: "painter",
      entity_id: painter.id,
      details: { insurance_company, insurance_policy_number, insurance_expiry_date },
    });

    return json({
      success: true,
      message: "Insurance submitted. Our team will verify it within 1-2 working days."
    });
  } catch (err) {
    console.error("submit-insurance error:", err);
    return json({ error: "An unexpected error occurred." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
