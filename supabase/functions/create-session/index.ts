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
      finish_preferences,
      customer_first_name, customer_last_name, customer_phone
    } = body;

    if (!postcode || !job_type) {
      return json({ error: "postcode and job_type are required" }, 400);
    }

    const cleanDescription = job_description ? stripPII(job_description) : null;

    const customerToken = crypto.randomUUID();

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    // Geocode postcode
    let location = null;
    let lat = null;
    let lng = null;
    try {
      const geoRes = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.result) {
          lat = geoData.result.latitude;
          lng = geoData.result.longitude;
          location = `SRID=4326;POINT(${lng} ${lat})`;
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
        first_name: customer_first_name?.trim() || null,
        last_name: customer_last_name?.trim() || null,
        phone: customer_phone?.trim() || null,
        marketing_consent: body.marketing_consent || false,
        customer_token: customerToken,
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session insert error:", sessionError);
      return json({ error: "Failed to create session" }, 500);
    }

    const sessionToken = btoa(
      JSON.stringify({ session_id: session.id, ts: Date.now() })
    );

    const jobRef = `PBC-${session.id.slice(-6).toUpperCase()}`;

    // Find nearby active painters using postcode district match
    const postcodeDistrict = postcode.trim().toUpperCase().split(" ")[0];
    
    const { data: nearbyPainters } = await serviceClient
      .from("painters")
      .select("id, email, first_name, last_name, postcode")
      .eq("is_active", true)
      .eq("kyc_status", "approved")
      .eq("insurance_verified", true);

    // Filter painters by postcode district match or notify all active painters
    const activePainters = nearbyPainters || [];
    
    // Notify all active painters via Make.com
    const makeWebhook = Deno.env.get("MAKE_NEW_JOB_WEBHOOK");
    if (makeWebhook && activePainters.length > 0) {
      // Send one notification per painter
      for (const painter of activePainters) {
        try {
          await fetch(makeWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              painter_email: painter.email,
              painter_name: `${painter.first_name} ${painter.last_name}`,
              session_id: session.id,
              job_ref: jobRef,
              job_type,
              postcode: postcodeDistrict,
              room_count: (rooms || []).length,
              job_description: cleanDescription,
              dashboard_url: "https://www.paintbookco.co.uk/dashboard/painter",
            }),
          });
        } catch (err) {
          console.error(`Webhook error for painter ${painter.email}:`, err);
        }
      }
    } else if (makeWebhook) {
      // No active painters yet — notify admin
      try {
        await fetch(makeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            painter_email: Deno.env.get("ADMIN_EMAIL") ?? "",
            painter_name: "Admin",
            session_id: session.id,
            job_ref: jobRef,
            job_type,
            postcode: postcodeDistrict,
            room_count: (rooms || []).length,
            job_description: cleanDescription,
            dashboard_url: "https://www.paintbookco.co.uk/admin-dashboard",
          }),
        });
      } catch (err) {
        console.error("Admin webhook error:", err);
      }
    }

    // Also notify admin of new job
    const jobSubmittedWebhook = Deno.env.get("MAKE_JOB_SUBMITTED_WEBHOOK");
    if (jobSubmittedWebhook && email) {
      try {
        await fetch(jobSubmittedWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_email: email.toLowerCase().trim(),
            job_ref: jobRef,
            job_type,
            postcode: postcode.trim().toUpperCase(),
            room_count: (rooms || []).length,
            job_description: cleanDescription,
          }),
        });
      } catch (err) {
        console.error("Job submitted webhook error:", err);
      }
    }

    // Send customer session link email via SendGrid
    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    if (sendgridKey && body.email) {
      try {
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sendgridKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: body.email.toLowerCase().trim() }] }],
            from: { email: "hello@paintbookco.co.uk", name: "PaintBookCo" },
            subject: "Your PaintBookCo job is live — track it here",
            content: [{
              type: "text/html",
              value: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;">
  <div style="background:#1B3A5C;padding:20px 24px;border-radius:8px 8px 0 0;">
    <h1 style="color:#fff;font-size:18px;margin:0;">PaintBookCo</h1>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;">
    <p>Hi ${customer_first_name || "there"},</p>
    <p>Your job has been posted successfully. Your job reference is <strong>${jobRef}</strong>.</p>
    <p>Use the link below to track your job, chat with your painter, approve milestones and release payment. No password needed.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://www.paintbookco.co.uk/job/${customerToken}"
         style="background:#1B3A5C;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">
        Track My Job
      </a>
    </div>
    <p style="font-size:13px;color:#666;">This link is permanent for the life of your job. Keep it safe — anyone with this link can access your job details.</p>
    <p style="font-size:13px;color:#666;">Job ref: ${jobRef}</p>
    <hr style="margin:20px 0;border:none;border-top:1px solid #e5e5e5;">
    <p style="margin:0;font-size:11px;color:#aaa;">The PaintBookCo Team · paintbookco.co.uk</p>
  </div>
</body>
</html>`,
            }],
          }),
        });
      } catch (emailErr) {
        console.error("SendGrid email error:", emailErr);
      }
    }

    return json({
      success: true,
      session_id: session.id,
      customer_token: customerToken,
      job_ref: jobRef,
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
