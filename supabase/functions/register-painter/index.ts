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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing environment variables:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey
      });
      return json({ error: "Service configuration error. Please try again later." }, 500);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Create auth user
    let authData;
    try {
      const result = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { first_name, last_name, phone, role: 'painter' }
      });

      if (result.error) {
        console.error("Auth creation error:", result.error);
        return json({ error: result.error.message || "Failed to create account." }, 400);
      }

      authData = result.data;
    } catch (authErr) {
      console.error("Auth creation exception:", authErr);
      return json({ error: "Account creation failed. Please try again." }, 500);
    }

    if (!authData?.user) {
      return json({ error: "Account creation failed. Please try again." }, 400);
    }

    // Create painter record using service role (bypasses RLS)
    try {
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
        console.error("Painter insert error:", painterError);
        // Attempt to rollback auth user
        try {
          await serviceClient.auth.admin.deleteUser(authData.user.id);
        } catch (rollbackErr) {
          console.error("Rollback error:", rollbackErr);
        }
        return json({ error: "Profile creation failed. Please try again." }, 500);
      }
    } catch (painterErr) {
      console.error("Painter creation exception:", painterErr);
      return json({ error: "Profile setup failed. Please try again." }, 500);
    }

    // Send confirmation email (non-critical, don't fail if it doesn't work)
    try {
      await serviceClient.auth.admin.generateLink({
        type: "signup",
        email,
      });
    } catch (emailErr) {
      console.warn("Email confirmation link generation failed:", emailErr);
    }

    // Log registration (non-critical)
    try {
      await serviceClient.from("audit_log").insert({
        action: "painter_registered",
        actor_id: authData.user.id,
        actor_role: "painter",
        entity_type: "painter",
        details: { email, first_name, last_name, kyc_status: "pending" },
      });
    } catch (auditErr) {
      console.warn("Audit log failed:", auditErr);
    }

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
