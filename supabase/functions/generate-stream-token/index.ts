/**
 * generate-stream-token — Supabase Edge Function
 *
 * Issues a Stream Chat user token for painter–customer job chat.
 *
 * Access rules:
 *   Customer: owns the job AND escrow_funded = true
 *   Painter:  kyc_status = 'approved' AND assigned to job AND escrow_funded = true
 *
 * Request body: { job_id: string }
 * Response:     { token, user_id, channel_id }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.paintbookco.co.uk",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: require valid Supabase JWT ──────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    // User client — validates JWT, applies RLS
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized." }, 401);

    // ── Parse body ────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { job_id } = body as { job_id?: string };
    if (!job_id) return json({ error: "job_id is required." }, 400);

    // ── Service client — bypasses RLS for access checks ───────
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: job, error: jobErr } = await serviceClient
      .from("jobs")
      .select("id, customer_id, assigned_painter_id, escrow_funded, status, title")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) return json({ error: "Job not found." }, 404);

    // ── Determine role and validate access conditions ─────────
    let userRole: "painter" | "customer";
    let displayName: string;

    if (job.customer_id === user.id) {
      // ── Customer path ───────────────────────────────────────
      if (!job.escrow_funded) {
        return json(
          { error: "Chat opens when payment is confirmed.", code: "escrow_not_funded" },
          403,
        );
      }
      userRole = "customer";
      displayName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        "Customer";
    } else {
      // ── Painter path ────────────────────────────────────────
      const { data: painter } = await serviceClient
        .from("painters")
        .select("id, kyc_status, first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (!painter) {
        return json(
          { error: "Chat not available for this job.", code: "not_assigned" },
          403,
        );
      }

      if (painter.kyc_status !== "approved") {
        return json(
          { error: "Complete verification to access chat.", code: "kyc_not_approved" },
          403,
        );
      }

      if (job.assigned_painter_id !== painter.id) {
        return json(
          { error: "Chat not available for this job.", code: "not_assigned" },
          403,
        );
      }

      if (!job.escrow_funded) {
        return json(
          { error: "Chat opens when payment is confirmed.", code: "escrow_not_funded" },
          403,
        );
      }

      userRole = "painter";
      displayName =
        [painter.first_name, painter.last_name].filter(Boolean).join(" ") || "Painter";
    }

    // ── Generate Stream Chat user token (1-hour expiry) ───────
    const streamApiKey = Deno.env.get("STREAM_API_KEY")!;
    const streamApiSecret = Deno.env.get("STREAM_API_SECRET")!;
    const exp = Math.floor(Date.now() / 1000) + 3600;

    const token = await generateStreamUserToken(user.id, streamApiSecret, exp);

    // ── Upsert Stream user via REST API ───────────────────────
    await upsertStreamUser(
      { id: user.id, name: displayName, role: userRole },
      streamApiKey,
      streamApiSecret,
    );

    // ── Audit log ─────────────────────────────────────────────
    await serviceClient.from("audit_log").insert({
      action: "stream_token_generated",
      actor_id: user.id,
      actor_role: userRole,
      entity_type: "job",
      entity_id: job_id,
      details: {
        user_id: user.id,
        channel_id: `job_${job_id}`,
        exp,
      },
    });

    return json({ token, user_id: user.id, channel_id: `job_${job_id}` });
  } catch (err) {
    console.error("generate-stream-token error:", err);
    return json({ error: "Internal server error." }, 500);
  }
});

// ── Stream JWT helpers ────────────────────────────────────────────────────────

/**
 * Generates a Stream Chat user token (HS256 JWT).
 * Payload: { user_id, exp }
 */
async function generateStreamUserToken(
  userId: string,
  secret: string,
  exp: number,
): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ user_id: userId, exp }));
  return `${header}.${payload}.${await hmacSha256(`${header}.${payload}`, secret)}`;
}

/**
 * Generates a Stream Chat server token (HS256 JWT, no expiry).
 * Payload: { server: true }
 */
async function generateStreamServerToken(secret: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ server: true }));
  return `${header}.${payload}.${await hmacSha256(`${header}.${payload}`, secret)}`;
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlFromBuffer(new Uint8Array(sig));
}

function b64url(str: string): string {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlFromBuffer(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// ── Stream REST API ───────────────────────────────────────────────────────────

async function upsertStreamUser(
  user: { id: string; name: string; role: string },
  apiKey: string,
  apiSecret: string,
): Promise<void> {
  const serverToken = await generateStreamServerToken(apiSecret);

  const res = await fetch(
    `https://chat.stream-io-api.com/users?api_key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: serverToken,
        "stream-auth-type": "jwt",
        "X-Stream-Client": "stream-chat-server",
      },
      body: JSON.stringify({
        users: {
          [user.id]: { id: user.id, name: user.name, role: user.role },
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "(unreadable)");
    console.error(`Stream upsert user error ${res.status}: ${text}`);
    // Non-fatal — token is still valid even if upsert fails
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
