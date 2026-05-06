import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CHAT_SESSION_HOURS = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorised" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthenticated" }, 401);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { session_id } = await req.json();
    if (!session_id) return json({ error: "session_id required" }, 400);

    // Get painter
    const { data: painter } = await serviceClient
      .from("painters")
      .select("id, first_name, last_name, email, phone, is_active, kyc_status, insurance_verified")
      .eq("user_id", user.id)
      .single();

    if (!painter) return json({ error: "Painter not found" }, 404);
    if (!painter.is_active) return json({ error: "Account not yet active" }, 403);

    // Get session
    const { data: session } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (!session) return json({ error: "Job not found" }, 404);

    // Generate Stream Chat token for painter
    const streamApiKey = Deno.env.get("STREAM_API_KEY")!;
    const streamSecret = Deno.env.get("STREAM_API_SECRET")!;

    // Create channel ID based on session
    const channelId = `job-${session_id}`;

    // Calculate expiry (3 hours from now)
    const expiresAt = new Date(Date.now() + CHAT_SESSION_HOURS * 60 * 60 * 1000);

    // Generate painter token
    const painterToken = await generateStreamToken(
      streamSecret,
      painter.id,
      expiresAt
    );

    // Create chat link for both parties
    const baseUrl = "https://www.paintbookco.co.uk";
    const painterChatLink = `${baseUrl}/chat/${channelId}?token=${painterToken}&user=${painter.id}&role=painter`;
    const customerChatLink = `${baseUrl}/chat/${channelId}?customer_token=${session.customer_token}&session_id=${session_id}`;

    // Job reference
    const jobRef = `PBC-${session_id.slice(-6).toUpperCase()}`;
    const postcodeDistrict = session.postcode?.split(" ")[0] || session.postcode;

    // Fire Make.com chat created webhook
    const chatWebhook = Deno.env.get("MAKE_CHAT_CREATED_WEBHOOK");
    if (chatWebhook) {
      try {
        await fetch(chatWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Customer notification
            customer_email: session.email,
            chat_link: customerChatLink,
            job_ref: jobRef,
            job_type: session.job_type,
            postcode: session.postcode,
            // Painter notification
            painter_email: painter.email,
            painter_name: `${painter.first_name} ${painter.last_name}`,
            painter_chat_link: painterChatLink,
            postcode_district: postcodeDistrict,
            // Session info
            channel_id: channelId,
            expires_at: expiresAt.toISOString(),
            stream_api_key: streamApiKey,
          }),
        });
      } catch (webhookErr) {
        console.error("Chat webhook error:", webhookErr);
      }
    }

    // Update session status and store channel_id
    await serviceClient
      .from("sessions")
      .update({ status: "painter_contacted", chat_channel_id: channelId })
      .eq("id", session_id);

    // Store channel_id on transaction if one exists
    const { data: existingTx } = await serviceClient
      .from("transactions")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();
    if (existingTx) {
      await serviceClient
        .from("transactions")
        .update({ chat_channel_id: channelId, status: "painter_contacted" })
        .eq("id", existingTx.id);
    }

    // Audit log
    await serviceClient.from("audit_log").insert({
      action: "chat_initiated",
      actor_id: user.id,
      actor_role: "painter",
      entity_type: "session",
      entity_id: session_id,
      details: {
        channel_id: channelId,
        painter_id: painter.id,
        expires_at: expiresAt.toISOString(),
      },
    });

    return json({
      success: true,
      channel_id: channelId,
      painter_token: painterToken,
      painter_chat_link: painterChatLink,
      customer_notified: !!session.email,
      expires_at: expiresAt.toISOString(),
      stream_api_key: streamApiKey,
    });

  } catch (err) {
    console.error("initiate-chat error:", err);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});

async function generateStreamToken(
  secret: string,
  userId: string,
  expiresAt: Date
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    user_id: userId,
    exp: Math.floor(expiresAt.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const sigInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(sigInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${sigInput}.${sigB64}`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
