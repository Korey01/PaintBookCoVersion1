import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridKey) {
      return new Response(JSON.stringify({ error: "Mail service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: "hello@paintbookco.co.uk", name: "PaintBookCo" }],
          subject: `Contact form: ${subject}`,
        }],
        from: { email: "noreply@paintbookco.co.uk", name: "PaintBookCo Contact Form" },
        reply_to: { email, name },
        content: [{
          type: "text/html",
          value: `
            <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FBF7F0;">
              <img src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png" alt="PaintBookCo" style="height: 32px; margin-bottom: 24px;" />
              <h2 style="font-family: Georgia, serif; color: #1A1A14; margin-bottom: 24px;">New contact form message</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px; width: 100px;">Name</td><td style="padding: 8px 0; color: #1A1A14; font-size: 13px; font-weight: 500;">${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #D85A30; font-size: 13px;"><a href="mailto:${email}" style="color: #D85A30;">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #6B6860; font-size: 13px;">Subject</td><td style="padding: 8px 0; color: #1A1A14; font-size: 13px; font-weight: 500;">${subject}</td></tr>
              </table>
              <div style="margin-top: 24px; padding: 16px; background: #FFFFFF; border: 0.5px solid rgba(180,150,100,0.18); border-radius: 8px;">
                <p style="color: #6B6860; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
                <p style="color: #1A1A14; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 24px; font-size: 11px; color: #B4B2A9;">Reply directly to this email to respond to ${name}.</p>
            </div>
          `
        }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("SendGrid error:", err);
      return new Response(JSON.stringify({ error: "Failed to send message" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
