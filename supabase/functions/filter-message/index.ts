/**
 * filter-message — Supabase Edge Function
 *
 * Two-layer PII filter for PaintBookCo chat messages.
 *
 * When layer1_blocked = true:
 *   Layer 1 (client regex) already blocked — just log for audit.
 *
 * When layer1_blocked = false:
 *   Layer 2 — calls SightEngine text moderation API to detect
 *   personal_info, phone, and email in the message.
 *   If flagged: block, log, check 24-hour violation count.
 *   If 3+ violations: fire Make.com webhook.
 *
 * Request body:
 *   { content, job_id, sender_role, layer1_blocked }
 *
 * Response:
 *   { blocked: boolean, message?: string }
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

// ── Block message shown to users ──────────────────────────────────────────────

const BLOCK_MESSAGE =
  "For security, contact details cannot be shared in chat. " +
  "Once your booking is confirmed, PaintBookCo shares contact information " +
  "through official platform communications only.";

// ── Server-side PII patterns (fast path, avoids SightEngine call) ─────────────

const SERVER_PII_PATTERNS = [
  /(\+44|0044|0)7\d{9}/,
  /(\+44|0044|0)[123]\d{9}/,
  /\+\d{10,13}/,
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
  /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i,
  /(whatsapp|telegram|signal|snapchat|instagram|facebook|tiktok|twitter|linkedin)/i,
  /\d+\s+[a-zA-Z]+\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|close|cl|way)\b/i,
];

function serverDetectPII(text: string): boolean {
  const norm = text.replace(/[\s\.\-_]/g, "");
  if (SERVER_PII_PATTERNS.some((p) => p.test(text) || p.test(norm))) return true;
  const digits = text.replace(/\D/g, "");
  if (/07\d{9}/.test(digits) || /0[123]\d{9}/.test(digits)) return true;
  if (digits.length >= 10 && digits.length <= 13 && /^0/.test(digits)) return true;
  return false;
}

// ── Recent-message buffer for split-PII detection ──────────────────────────────
// In-memory only — resets on cold start, keyed by job_id:user_id

const recentMessagesBuffer = new Map<string, string[]>();

function addToServerBuffer(key: string, text: string): void {
  const history = recentMessagesBuffer.get(key) ?? [];
  history.push(text);
  if (history.length > 3) history.shift();
  recentMessagesBuffer.set(key, history);
}

function checkServerSplitPII(key: string, currentMessage: string): boolean {
  const history = recentMessagesBuffer.get(key) ?? [];
  const combined = [...history, currentMessage].join(" ");
  const norm = combined.replace(/[\s\.\-_]/g, "").toLowerCase();
  // Combined recent messages forming a complete UK postcode
  if (/[a-z]{1,2}\d{1,2}[a-z]?\d[a-z]{2}/.test(norm)) return true;
  // Combined messages forming a phone number
  const digits = combined.replace(/\D/g, "");
  if (/07\d{9}/.test(digits) || /0[123]\d{9}/.test(digits)) return true;
  return false;
}

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
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized." }, 401);

    // ── Parse body ────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { action, content, job_id, sender_role, layer1_blocked, message_id, reporter_id, reason } = body as {
      action?: string;
      content?: string;
      job_id?: string;
      sender_role?: string;
      layer1_blocked?: boolean;
      message_id?: string;
      reporter_id?: string;
      reason?: string;
    };

    // ── Report message action ─────────────────────────────────
    if (action === "report_message") {
      if (!job_id || !message_id) {
        return json({ error: "job_id and message_id are required." }, 400);
      }
      const disputeWebhook = Deno.env.get("MAKE_DISPUTE_RAISED_WEBHOOK");
      if (disputeWebhook) {
        await fetch(disputeWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "message_report",
            job_ref: `PBC-${job_id.slice(-6).toUpperCase()}`,
            message_id,
            reason: reason ?? "",
            admin_link: "https://www.paintbookco.co.uk/admin",
          }),
        }).catch((e) => console.error("MAKE_DISPUTE_RAISED_WEBHOOK failed:", e));
      }
      return json({ success: true });
    }

    if (!content || !job_id) {
      return json({ error: "content and job_id are required." }, 400);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // ── SHA-256 hash of content (never store raw blocked text) ─
    const contentHash = await sha256Hex(content);

    // ── Layer 1 audit log ─────────────────────────────────────
    if (layer1_blocked) {
      await logBlock(serviceClient, {
        job_id,
        sender_user_id: user.id,
        sender_role: sender_role ?? "unknown",
        filter_triggered: "layer1_regex",
        content_hash: contentHash,
      });

      await maybeFireViolationWebhook(serviceClient, user.id, job_id, sender_role ?? "unknown");

      return json({ blocked: true, message: BLOCK_MESSAGE });
    }

    // ── Layer 1.5: server-side regex fast path (before SightEngine) ─
    const bufferKey = `${job_id}:${user.id}`;
    if (serverDetectPII(content) || checkServerSplitPII(bufferKey, content)) {
      await logBlock(serviceClient, {
        job_id,
        sender_user_id: user.id,
        sender_role: sender_role ?? "unknown",
        filter_triggered: "layer2_regex",
        content_hash: contentHash,
      });

      await maybeFireViolationWebhook(serviceClient, user.id, job_id, sender_role ?? "unknown");

      return json({ blocked: true, message: BLOCK_MESSAGE });
    }
    addToServerBuffer(bufferKey, content);

    // ── Layer 2: SightEngine text moderation ──────────────────
    const sightEngineUser = Deno.env.get("SIGHTENGINE_API_USER");
    const sightEngineSecret = Deno.env.get("SIGHTENGINE_API_SECRET");

    if (!sightEngineUser || !sightEngineSecret) {
      console.warn("SightEngine credentials not set — allowing message.");
      return json({ blocked: false });
    }

    const params = new URLSearchParams({
      text: content,
      mode: "standard",
      lang: "en",
      api_user: sightEngineUser,
      api_secret: sightEngineSecret,
    });

    const seRes = await fetch(
      "https://api.sightengine.com/1.0/text/check.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    if (!seRes.ok) {
      const errText = await seRes.text().catch(() => "(unreadable)");
      console.error(`SightEngine error ${seRes.status}: ${errText}`);
      // Fail closed — block the message if moderation service is down
      return json({ blocked: true, message: BLOCK_MESSAGE });
    }

    const seResult = await seRes.json();

    // Check for personal info (email, phone, address) detection
    const personalDetected = seResult?.personal?.detection === "yes";
    const matchedCategories: string[] = [];

    if (personalDetected && Array.isArray(seResult?.personal?.matches)) {
      matchedCategories.push(
        ...seResult.personal.matches.map((m: { type?: string }) => m.type ?? "unknown"),
      );
    }

    if (personalDetected) {
      await logBlock(serviceClient, {
        job_id,
        sender_user_id: user.id,
        sender_role: sender_role ?? "unknown",
        filter_triggered: "layer2_ai",
        content_hash: contentHash,
      });

      await maybeFireViolationWebhook(serviceClient, user.id, job_id, sender_role ?? "unknown");

      console.log(
        `Layer 2 blocked message. Categories: ${matchedCategories.join(", ")}. ` +
          `User: ${user.id}, Job: ${job_id}`,
      );

      return json({ blocked: true, message: BLOCK_MESSAGE });
    }

    return json({ blocked: false });
  } catch (err) {
    console.error("filter-message error:", err);
    return json({ error: "Internal server error." }, 500);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function logBlock(
  client: ReturnType<typeof createClient>,
  row: {
    job_id: string;
    sender_user_id: string;
    sender_role: string;
    filter_triggered: string;
    content_hash: string;
  },
): Promise<void> {
  const { error } = await client.from("message_block_log").insert(row);
  if (error) {
    console.error("message_block_log insert error:", error.message);
  }
}

async function maybeFireViolationWebhook(
  client: ReturnType<typeof createClient>,
  userId: string,
  jobId: string,
  senderRole: string,
): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await client
    .from("message_block_log")
    .select("*", { count: "exact", head: true })
    .eq("sender_user_id", userId)
    .gte("created_at", since);

  const violationCount = count ?? 0;

  if (violationCount >= 3) {
    const webhook = Deno.env.get("MAKE_PII_VIOLATION_WEBHOOK");
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_ref: `PBC-${jobId.slice(-6).toUpperCase()}`,
          violation_count: violationCount,
          user_role: senderRole,
          admin_link: "https://www.paintbookco.co.uk/admin",
          supabase_logs_link: "https://supabase.com/dashboard/project/kvuidnkmxqftbmlyvlyl/editor",
        }),
      }).catch((e) => console.error("MAKE_PII_VIOLATION_WEBHOOK failed:", e));
    }
  }
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
