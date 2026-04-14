import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://paintbook-app.netlify.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorisation header." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated." }, 401);

    const { postcode, painter_id, job_id } = await req.json();
    if (!postcode) return json({ error: "postcode is required." }, 400);
    if (painter_id && job_id) return json({ error: "Supply painter_id or job_id, not both." }, 400);
    if (!painter_id && !job_id) return json({ error: "Supply either painter_id or job_id." }, 400);

    const cleanPostcode = postcode.trim().toUpperCase().replace(/\s+/g, " ");

    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`
    );

    if (response.status === 404) {
      return json({ error: `Invalid postcode: ${cleanPostcode}` }, 400);
    }
    if (!response.ok) {
      return json({ error: "Postcode lookup service unavailable." }, 503);
    }

    const data = await response.json();
    const { latitude, longitude } = data.result;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    if (painter_id) {
      await serviceClient
        .from("painters")
        .update({
          postcode: cleanPostcode,
          location: `SRID=4326;POINT(${longitude} ${latitude})`,
        })
        .eq("id", painter_id);
    }

    if (job_id) {
      await serviceClient
        .from("jobs")
        .update({
          postcode: cleanPostcode,
          location: `SRID=4326;POINT(${longitude} ${latitude})`,
        })
        .eq("id", job_id);
    }

    await serviceClient.from("audit_log").insert({
      action: "geocode_postcode",
      actor_id: user.id,
      entity_type: painter_id ? "painter" : "job",
      entity_id: painter_id || job_id,
      details: { postcode: cleanPostcode, latitude, longitude },
    });

    return json({ success: true, postcode: cleanPostcode, latitude, longitude });
  } catch (err) {
    console.error("geocode-postcode error:", err);
    return json({ error: "Internal error. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
