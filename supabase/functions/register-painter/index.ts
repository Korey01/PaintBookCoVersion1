import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      email, password, first_name, last_name,
      phone, specialisms, service_radius_km, postcode
    } = await req.json();

    if (!email || !password || !first_name || !last_name) {
      return json({ error: "Missing required fields." }, 400);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Create auth user
    const { data: authData, error: authError } = 
      await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { first_name, last_name, phone, role: 'painter' }
      });

    if (authError || !authData.user) {
      return json({ error: authError?.message || "Registration failed." }, 400);
    }

    // Create painter record using service role (bypasses RLS)
    const { error: painterError } = await serviceClient
      .from("painters")
      .insert({
        user_id: authData.user.id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        kyc_status: "pending",
        is_active: false,
        specialisms: specialisms || [],
        service_radius_km: service_radius_km || 10,
        postcode: postcode || null,
      });

    if (painterError) {
      // Rollback auth user if painter insert fails
      await serviceClient.auth.admin.deleteUser(authData.user.id);
      return json({ error: "Profile creation failed. Please try again." }, 500);
    }

    // Send confirmation email
    await serviceClient.auth.admin.generateLink({
      type: "signup",
      email,
    });

    await serviceClient.from("audit_log").insert({
      action: "painter_registered",
      actor_id: authData.user.id,
      actor_role: "painter",
      entity_type: "painter",
      details: { email, first_name, last_name, kyc_status: "pending" },
    });

    return json({ 
      success: true, 
      message: "Registration successful. Please check your email to confirm your account.",
      user_id: authData.user.id
    });

  } catch (err) {
    console.error("register-painter error:", err);
    return json({ error: "Internal error. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
