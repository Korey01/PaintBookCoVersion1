import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callTranspact,
  getAuthParams,
  parseTranspactResponse,
} from "../_shared/transpact.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.paintbookco.co.uk",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

interface CacheEntry {
  data: Record<string, unknown>;
  expiry: number;
}
const statusCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key: string): Record<string, unknown> | null {
  const entry = statusCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) { statusCache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: Record<string, unknown>) {
  statusCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

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

    const { job_id } = await req.json();
    if (!job_id) return json({ error: "job_id is required." }, 400);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
    );

    const { data: job, error: jobError } = await serviceClient
      .from("jobs")
      .select("id, customer_id, assigned_painter_id, transpact_transaction_id")
      .eq("id", job_id)
      .single();

    if (jobError || !job) return json({ error: "Job not found." }, 404);

    const isPainter = await (async () => {
      if (job.assigned_painter_id) {
        const { data: p } = await serviceClient.from("painters").select("id").eq("id", job.assigned_painter_id).eq("user_id", user.id).maybeSingle();
        return !!p;
      }
      return false;
    })();

    if (job.customer_id !== user.id && !isPainter) {
      return json({ error: "Forbidden." }, 403);
    }

    if (!job.transpact_transaction_id) {
      return json({ error: "No Transpact transaction found for this job." }, 404);
    }

    const cacheKey = `status:${job.transpact_transaction_id}`;
    const cached = getCached(cacheKey);
    if (cached) return json({ ...cached, cached: true });

    const auth = getAuthParams();
    const soapXml = await callTranspact("ViewTranspact", {
      ...auth,
      TranspactNumber: job.transpact_transaction_id,
    });

    const amountHeld = parseFloat(parseTranspactResponse(soapXml, "AmountHeld") || "0");
    const stageDescription = parseTranspactResponse(soapXml, "StageDescription");
    const currency = parseTranspactResponse(soapXml, "Currency") || "GBP";
    const createdAt = parseTranspactResponse(soapXml, "DateCreated") || "";

    const result: Record<string, unknown> = {
      transaction_id: job.transpact_transaction_id,
      status: stageDescription,
      amount_held: amountHeld,
      currency,
      created_at: createdAt,
    };

    setCache(cacheKey, result);
    return json(result);
  } catch (err) {
    console.error("get-transpact-status error:", err);
    return json({ error: "Internal error. Please contact support." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
