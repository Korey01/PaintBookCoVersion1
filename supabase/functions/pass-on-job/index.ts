/**
 * pass-on-job — returns a session to the job_posted queue.
 *
 * Painter path (requires Bearer JWT):
 *   { session_id, painter_id, reason: "painter_passed" }
 *   - Validates JWT, confirms painter is assigned to session
 *   - Resets session: painter_id=null, chat_channel_id=null, status=job_posted
 *   - Fires MAKE_NEW_JOB_WEBHOOK to notify customer and re-queue
 *
 * Customer path (no JWT, customer_token in body):
 *   { session_id, customer_token, reason: "customer_requested_new_painter" }
 *   - Validates customer_token matches session
 *   - Same session reset
 *   - Fires MAKE_NEW_JOB_WEBHOOK to notify painter and re-queue
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
    const body = await req.json().catch(() => ({})) as Record<string, string>;
    const { session_id, painter_id, customer_token, reason } = body;

    if (!session_id) return json({ error: "session_id is required" }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: session, error: sessErr } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessErr || !session) return json({ error: "Session not found" }, 404);

    const allowedStatuses = ["job_posted", "painter_contacted", "invoice_sent"];
    if (!allowedStatuses.includes(session.status)) {
      return json({ error: "Job cannot be returned to queue at this stage" }, 400);
    }

    // ── Painter path ──────────────────────────────────────────────────────────
    if (painter_id && !customer_token) {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) {
        return json({ error: "Unauthorized" }, 401);
      }

      const anonKey = Deno.env.get("ANON_KEY")!;
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        anonKey,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) return json({ error: "Unauthorized" }, 401);

      const { data: painter } = await serviceClient
        .from("painters")
        .select("id, user_id, email, first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (!painter) return json({ error: "Painter account not found" }, 404);

      // Validate this painter is assigned (session.painter_id stores auth UUID)
      if (session.painter_id !== painter.user_id) {
        return json({ error: "You are not assigned to this job" }, 403);
      }

      const oldChannelId = session.chat_channel_id;

      await serviceClient
        .from("sessions")
        .update({
          painter_id: null,
          chat_channel_id: null,
          status: "job_posted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session_id);

      if (oldChannelId) {
        await truncateStreamChannel(oldChannelId);
      }

      const makeWebhook = Deno.env.get("MAKE_NEW_JOB_WEBHOOK");
      if (makeWebhook) {
        fetch(makeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "painter_passed",
            session_id,
            reason: reason ?? "painter_passed",
            customer_email: session.email,
            customer_first_name: session.first_name,
            job_type: session.job_type,
            postcode: session.postcode,
          }),
        }).catch(console.error);
      }

      await serviceClient.from("audit_log").insert({
        action: "painter_passed_on_job",
        actor_id: user.id,
        actor_role: "painter",
        entity_type: "session",
        entity_id: session_id,
        details: { reason: reason ?? "painter_passed", painter_db_id: painter.id },
      });

      return json({ success: true });
    }

    // ── Customer path ─────────────────────────────────────────────────────────
    if (customer_token) {
      if (session.customer_token !== customer_token) {
        return json({ error: "Invalid customer token" }, 403);
      }

      const oldChannelId = session.chat_channel_id;

      await serviceClient
        .from("sessions")
        .update({
          painter_id: null,
          chat_channel_id: null,
          status: "job_posted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session_id);

      if (oldChannelId) {
        await truncateStreamChannel(oldChannelId);
      }

      const makeWebhook = Deno.env.get("MAKE_NEW_JOB_WEBHOOK");
      if (makeWebhook) {
        fetch(makeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "customer_requested_new_painter",
            session_id,
            reason: reason ?? "customer_requested_new_painter",
            customer_email: session.email,
            customer_first_name: session.first_name,
            job_type: session.job_type,
            postcode: session.postcode,
            painter_id: session.painter_id,
          }),
        }).catch(console.error);
      }

      await serviceClient.from("audit_log").insert({
        action: "customer_requested_new_painter",
        actor_role: "customer",
        entity_type: "session",
        entity_id: session_id,
        details: { reason: reason ?? "customer_requested_new_painter" },
      });

      return json({ success: true });
    }

    return json({ error: "Either painter_id or customer_token is required" }, 400);

  } catch (err) {
    console.error("pass-on-job error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

// ── Stream helpers ─────────────────────────────────────────────────────────────

async function truncateStreamChannel(channelId: string): Promise<void> {
  const apiKey = Deno.env.get("STREAM_API_KEY");
  const apiSecret = Deno.env.get("STREAM_API_SECRET");
  if (!apiKey || !apiSecret) return;

  try {
    const serverToken = await generateServerToken(apiSecret);
    await fetch(
      `https://chat.stream-io-api.com/channels/messaging/${channelId}/truncate?api_key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": serverToken,
          "stream-auth-type": "jwt",
        },
        body: JSON.stringify({}),
      },
    );
  } catch (err) {
    console.error("Stream truncate error:", err);
  }
}

async function generateServerToken(secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    server: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const sigInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sigInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `${sigInput}.${sigB64}`;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
