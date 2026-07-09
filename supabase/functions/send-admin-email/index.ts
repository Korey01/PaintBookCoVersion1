import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorised" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorised" }, 401);
    if (user.email !== ADMIN_EMAIL) return json({ error: "Forbidden" }, 403);

    const { from, to, toName, subject, body, attachmentBase64, attachmentName, attachmentType } = await req.json();

    if (!from || !to || !subject || !body) {
      return json({ error: "from, to, subject and body are required" }, 400);
    }

    const LOGO = "https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png";

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1B3A5C;padding:20px 32px;text-align:center;">
            <img src="${LOGO}" alt="PaintBookCo" style="height:36px;max-width:160px;object-fit:contain;display:block;margin:0 auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${body.replace(/\n/g, "<br>")}
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #e5e5e5;text-align:center;">
            <p style="font-size:11px;color:#999;margin:0;">
              © PaintBookCo — The Paint Book Company Ltd · Company No. 16690724<br>
              <a href="mailto:hello@paintbookco.co.uk" style="color:#bbb;text-decoration:none;">hello@paintbookco.co.uk</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const sendgridPayload: any = {
      personalizations: [{ to: [{ email: to, name: toName }] }],
      from: { email: from, name: "PaintBookCo" },
      subject,
      content: [{ type: "text/html", value: emailHtml }],
    };

    // Add attachment if provided
    if (attachmentBase64 && attachmentName) {
      sendgridPayload.attachments = [{
        content: attachmentBase64,
        filename: attachmentName,
        type: attachmentType || "application/octet-stream",
        disposition: "attachment",
      }];
    }

    const sendgridKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridKey) return json({ error: "SendGrid not configured" }, 500);

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Authorization": `Bearer ${sendgridKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(sendgridPayload),
    });

    if (!sgRes.ok) {
      const err = await sgRes.text();
      console.error("SendGrid error:", sgRes.status, err);
      return json({ error: "Failed to send email", detail: err }, 500);
    }

    // Log to audit
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );
    await serviceClient.from("audit_log").insert({
      action: "admin_email_sent",
      actor_id: user.id,
      actor_role: "admin",
      details: { from, to, subject },
    }).catch(() => {});

    return json({ success: true });
  } catch (err) {
    console.error("send-admin-email error:", err);
    return json({ error: String(err) }, 500);
  }
});
