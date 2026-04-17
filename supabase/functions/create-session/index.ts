import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function stripPII(text: string): string {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REMOVED]")
    .replace(/(\+44|0044|0)[0-9\s\-\.]{9,}/g, "[REMOVED]")
    .replace(/@[a-zA-Z0-9_]+/g, "[REMOVED]")
    .replace(/\b07\d{9}\b/g, "[REMOVED]")
    .replace(/\b\d{5}\s?\d{6}\b/g, "[REMOVED]");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      email, postcode, city, job_type,
      job_description, has_structural_defects,
      structural_defect_details, rooms,
      paint_choice, vestimator_data, estimated_cost,
      utm_source, utm_medium, utm_campaign,
      utm_content, utm_term, referrer,
      landing_page, device_type, browser,
      screen_resolution, form_step_reached,
      colour_preferences, paint_brand_preferences,
      finish_preferences
    } = body;

    if (!postcode || !job_type) {
      return json({ error: "postcode and job_type are required" }, 400);
    }

    // Strip PII from description
    const cleanDescription = job_description
      ? stripPII(job_description)
      : null;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Geocode postcode
    let location = null;
    try {
      const geoRes = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.result) {
          const { latitude, longitude } = geoData.result;
          location = `SRID=4326;POINT(${longitude} ${latitude})`;
        }
      }
    } catch (geoErr) {
      console.error("Geocoding error:", geoErr);
    }

    // Create session
    const { data: session, error: sessionError } = await serviceClient
      .from("sessions")
      .insert({
        email: email?.toLowerCase().trim() || null,
        postcode: postcode.trim().toUpperCase(),
        city: city?.trim() || null,
        job_type,
        job_description: cleanDescription,
        has_structural_defects: has_structural_defects || false,
        structural_defect_details: structural_defect_details
          ? stripPII(structural_defect_details) : null,
        rooms: rooms || [],
        paint_choice: paint_choice || null,
        vestimator_data: vestimator_data || null,
        estimated_cost: estimated_cost || null,
        location,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        referrer: referrer || null,
        landing_page: landing_page || null,
        device_type: device_type || null,
        browser: browser || null,
        screen_resolution: screen_resolution || null,
        form_step_reached: form_step_reached || 0,
        colour_preferences: colour_preferences || {},
        paint_brand_preferences: paint_brand_preferences || [],
        finish_preferences: finish_preferences || [],
        status: "job_posted",
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session insert error:", sessionError);
      return json({ error: "Failed to create session" }, 500);
    }

    // Generate simple session token
    const sessionToken = btoa(
      JSON.stringify({ session_id: session.id, ts: Date.now() })
    );

    // Notify painters via Make.com
    const makeWebhook = Deno.env.get("MAKE_NEW_JOB_WEBHOOK");
    if (makeWebhook) {
      try {
        await fetch(makeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session.id,
            postcode: postcode.trim().toUpperCase(),
            city,
            job_type,
            job_description: cleanDescription,
            has_structural_defects,
            rooms,
            estimated_cost,
            job_ref: `PBC-${session.id.slice(-6).toUpperCase()}`,
          }),
        });
      } catch (webhookErr) {
        console.error("Make.com webhook error:", webhookErr);
      }
    }

    return json({
      success: true,
      session_id: session.id,
      session_token: sessionToken,
      job_ref: `PBC-${session.id.slice(-6).toUpperCase()}`,
    });

  } catch (err) {
    console.error("create-session error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
