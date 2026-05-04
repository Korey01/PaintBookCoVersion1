/**
 * generate-stream-token — issues Stream Chat user token for painter–customer chat.
 *
 * Painter path (requires Bearer JWT):
 *   - painter must be KYC approved and active
 *   - painter must be matched to the session (painter_id on transaction OR session)
 *   - no escrow requirement — painters need chat before payment to send invoices
 *
 * Customer path (requires customer_token):
 *   - validates customer_token against sessions table (no Supabase auth)
 *   - issues anonymous customer token for the channel
 *
 * Request body:
 *   Painter:  { session_id: string }
 *   Customer: { session_id: string, customer_token: string }
 */

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({})) as Record<string, string>;
    const { session_id, customer_token } = body;

    if (!session_id) return json({ error: "session_id is required" }, 400);

    // Get session
    const { data: session, error: sessErr } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessErr || !session) return json({ error: "Session not found" }, 404);

    const streamApiKey = Deno.env.get("STREAM_API_KEY")!;
    const streamApiSecret = Deno.env.get("STREAM_API_SECRET")!;
    const channelId = `job-${session_id}`;
    const exp = Math.floor(Date.now() / 1000) + 3600;

    // ── Customer path (no Supabase auth required) ─────────────────────────────
    if (customer_token) {
      if (session.customer_token !== customer_token) {
        return json({ error: "Invalid customer token" }, 403);
      }

      const customerId = `customer-${session_id}`;
      const token = await generateStreamUserToken(customerId, streamApiSecret, exp);
      await upsertStreamUser(
        { id: customerId, name: session.first_name || "Customer", role: "customer" },
        streamApiKey,
        streamApiSecret,
      );

      return json({ token, user_id: customerId, channel_id: channelId });
    }

    // ── Painter path (requires valid Supabase JWT) ─────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    // Check admin access
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
    if (user.email === adminEmail) {
      const token = await generateStreamUserToken(user.id, streamApiSecret, exp);
      await upsertStreamUser({ id: user.id, name: "Admin", role: "admin" }, streamApiKey, streamApiSecret);
      return json({ token, user_id: user.id, channel_id: channelId });
    }

    // Painter validation
    const { data: painter } = await serviceClient
      .from("painters")
      .select("id, first_name, last_name, kyc_status, is_active")
      .eq("user_id", user.id)
      .single();

    if (!painter) return json({ error: "Painter account not found" }, 404);
    if (painter.kyc_status !== "approved") {
      return json({ error: "Complete KYC verification to access chat", code: "kyc_not_approved" }, 403);
    }
    if (!painter.is_active) {
      return json({ error: "Account not yet active" }, 403);
    }

    // Verify painter is assigned to this job
    const { data: tx } = await serviceClient
      .from("transactions")
      .select("id, painter_id, status")
      .eq("session_id", session_id)
      .eq("painter_id", painter.id)
      .maybeSingle();

    // Also check session.painter_id for jobs where transaction hasn't been created yet
    const sessionPainterMatch = session.painter_id === painter.id;

    if (!tx && !sessionPainterMatch) {
      return json({ error: "Chat not available for this job", code: "not_assigned" }, 403);
    }

    const displayName = [painter.first_name, painter.last_name].filter(Boolean).join(" ") || "Painter";
    const token = await generateStreamUserToken(painter.id, streamApiSecret, exp);
    await upsertStreamUser({ id: painter.id, name: displayName, role: "painter" }, streamApiKey, streamApiSecret);

    await serviceClient.from("audit_log").insert({
      action: "stream_token_generated",
      actor_id: user.id,
      actor_role: "painter",
      entity_type: "session",
      entity_id: session_id,
      details: { painter_id: painter.id, channel_id: channelId, exp },
    });

    return json({ token, user_id: painter.id, channel_id: channelId });

  } catch (err) {
    console.error("generate-stream-token error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function generateStreamUserToken(userId: string, secret: string, exp: number): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ user_id: userId, exp }));
  return `${header}.${payload}.${await hmacSha256(`${header}.${payload}`, secret)}`;
}

async function generateStreamServerToken(secret: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ server: true }));
  return `${header}.${payload}.${await hmacSha256(`${header}.${payload}`, secret)}`;
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlFromBuffer(new Uint8Array(sig));
}

function b64url(str: string): string {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlFromBuffer(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function upsertStreamUser(
  user: { id: string; name: string; role: string },
  apiKey: string,
  apiSecret: string,
): Promise<void> {
  const serverToken = await generateStreamServerToken(apiSecret);
  const res = await fetch(`https://chat.stream-io-api.com/users?api_key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: serverToken,
      "stream-auth-type": "jwt",
      "X-Stream-Client": "stream-chat-server",
    },
    body: JSON.stringify({ users: { [user.id]: { id: user.id, name: user.name, role: user.role } } }),
  });
  if (!res.ok) {
    console.error(`Stream upsert user error ${res.status}: ${await res.text().catch(() => "")}`);
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
