/**
 * segment-walls — proxies image segmentation to Replicate API
 *
 * Accepts: { image_base64: string, image_type: string }
 * Returns: Replicate prediction result with segmentation mask URL
 *
 * The Replicate API key stays server-side only — never exposed to the client.
 * Falls back to a second model if the primary fails.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// SAM 2 (Segment Anything Model 2 by Meta) — best for wall segmentation
const SAM2_VERSION = "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";

// Fallback: CLIPSeg — prompt-guided segmentation
const CLIPSEG_VERSION = "2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591";

// Timeout: Replicate predictions can take 15-30s; Supabase edge fn limit is 60s
const REPLICATE_TIMEOUT_MS = 55_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, image_type } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const replicateKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateKey) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageDataUrl = `data:${image_type || "image/jpeg"};base64,${image_base64}`;

    // ── Primary: SAM 2 ────────────────────────────────────────────────────────
    const sam2Result = await callReplicate(replicateKey, {
      version: SAM2_VERSION,
      input: {
        image: imageDataUrl,
        task_type: "semantic_segmentation",
      },
    });

    if (sam2Result && !sam2Result.error && sam2Result.output) {
      // Proxy mask image to avoid CORS issues
      try {
        const maskUrl = Array.isArray(sam2Result.output) ? sam2Result.output[0] : sam2Result.output;
        const maskRes = await fetch(maskUrl);
        const maskBuffer = await maskRes.arrayBuffer();
        const uint8 = new Uint8Array(maskBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < uint8.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8.slice(i, i + chunkSize));
        }
        const maskBase64 = btoa(binary);
        const contentType = maskRes.headers.get("content-type") || "image/png";
        const maskDataUrl = `data:${contentType};base64,${maskBase64}`;
        return new Response(JSON.stringify({ output: maskDataUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify(sam2Result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Fallback: CLIPSeg with "wall" prompt ─────────────────────────────────
    console.log("SAM2 failed, trying CLIPSeg fallback:", sam2Result?.error);

    const clipsegResult = await callReplicate(replicateKey, {
      version: CLIPSEG_VERSION,
      input: {
        image: imageDataUrl,
        prompt: "wall",
      },
    });

    if (clipsegResult && clipsegResult.output) {
      try {
        const maskUrl = Array.isArray(clipsegResult.output) ? clipsegResult.output[0] : clipsegResult.output;
        const maskRes = await fetch(maskUrl);
        const maskBuffer = await maskRes.arrayBuffer();
        const uint8 = new Uint8Array(maskBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < uint8.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8.slice(i, i + chunkSize));
        }
        const maskBase64 = btoa(binary);
        const contentType = maskRes.headers.get("content-type") || "image/png";
        const maskDataUrl = `data:${contentType};base64,${maskBase64}`;
        return new Response(JSON.stringify({ output: maskDataUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify(clipsegResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Both models failed — return a structured error so client falls back gracefully
    return new Response(
      JSON.stringify({
        error: "segmentation_unavailable",
        detail: clipsegResult?.error ?? "Both models returned no output",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("segment-walls error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Helper: call Replicate with Prefer: wait=55 ───────────────────────────────

async function callReplicate(
  apiKey: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Ask Replicate to wait up to 55s before returning (synchronous mode)
        Prefer: "wait=55",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Replicate HTTP error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();

    // If still processing, poll once
    if (data.status === "processing" && data.urls?.get) {
      return await pollPrediction(apiKey, data.urls.get);
    }

    return data;
  } catch (err) {
    console.error("callReplicate error:", err);
    return null;
  }
}

async function pollPrediction(
  apiKey: string,
  pollUrl: string,
  maxAttempts = 8,
  intervalMs = 4000
): Promise<Record<string, unknown> | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    try {
      const res = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();

      if (data.status === "succeeded") return data;
      if (data.status === "failed" || data.error) return data;
    } catch (err) {
      console.error("poll error:", err);
    }
  }

  return { error: "prediction_timed_out" };
}
