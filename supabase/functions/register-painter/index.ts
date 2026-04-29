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
    const body = await req.json();
    const {
      email, password, first_name, last_name,
      phone, specialisms, service_radius_km,
      postcode, city, terms_accepted, privacy_accepted
    } = body;

    if (!email || !password)
      return json({ error: "Email and password are required." }, 400);
    if (!first_name || !last_name)
      return json({ error: "Full name is required." }, 400);
    if (!terms_accepted)
      return json({ error: "You must accept the Terms of Service." }, 400);
    if (!privacy_accepted)
      return json({ error: "You must accept the Privacy Policy." }, 400);
    if (password.length < 8)
      return json({ error: "Password must be at least 8 characters." }, 400);

    const strengthScore = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;

    if (strengthScore < 2)
      return json({ error: "Password too weak. Use uppercase, lowercase, numbers and symbols." }, 400);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return json({ error: "Invalid email address." }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: existing } = await serviceClient
      .from("painters").select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing)
      return json({ error: "An account with this email already exists." }, 400);

    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password,
        email_confirm: false,
        user_metadata: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone,
          role: "painter"
        }
      });

    if (authError || !authData.user)
      return json({ error: authError?.message || "Registration failed." }, 400);

    const { error: painterError } = await serviceClient
      .from("painters").insert({
        user_id: authData.user.id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        postcode: postcode?.trim().toUpperCase() || null,
        city: city?.trim() || null,
        kyc_status: "pending",
        is_active: false,
        insurance_verified: false,
        profile_complete: false,
        specialisms: specialisms || [],
        service_radius_km: service_radius_km || 10,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        privacy_accepted: true,
      });

    if (painterError) {
      await serviceClient.auth.admin.deleteUser(authData.user.id);
      console.error("Painter insert error:", painterError);
      return json({ error: "Failed to create painter profile. Please try again." }, 500);
    }

    // Send confirmation email
    try {
      await serviceClient.auth.admin.generateLink({
        type: "signup",
        email: email.toLowerCase().trim(),
        options: {
          redirectTo: "https://www.paintbookco.co.uk/login"
        }
      });
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
    }

    try {
      await serviceClient.from("audit_log").insert({
        action: "painter_registered",
        actor_id: authData.user.id,
        actor_role: "painter",
        entity_type: "painter",
        details: { email, first_name, last_name, kyc_status: "pending" },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return json({
      success: true,
      message: "Registration successful! Please check your email to confirm your account.",
      user_id: authData.user.id
    });

  } catch (err) {
    console.error("register-painter error:", err);
    return json({ error: "An unexpected error occurred. Please try again." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
