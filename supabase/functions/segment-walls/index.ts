const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SAM2_VERSION = "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";

async function runReplicate(replicateKey: string, version: string, input: Record<string, unknown>) {
  const submitRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${replicateKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`Replicate submit failed: ${submitRes.status} ${errText}`);
  }

  const prediction = await submitRes.json();
  const pollUrl = `https://api.replicate.com/v1/predictions/${prediction.id}`;
  let result = prediction;

  for (let i = 0; i < 30; i++) {
    if (result.status === "succeeded" || result.status === "failed" || result.status === "canceled") break;
    await new Promise(r => setTimeout(r, 2000));
    const pollRes = await fetch(pollUrl, {
      headers: { "Authorization": `Bearer ${replicateKey}` },
    });
    result = await pollRes.json();
    console.log(`Poll ${i+1}: ${result.status}`);
  }

  return result;
}

async function proxyImageToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8.slice(i, i + chunkSize));
  }
  const contentType = res.headers.get("content-type") || "image/png";
  return `data:${contentType};base64,${btoa(binary)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, image_type } = await req.json();

    if (!image_base64) {
      return new Response(JSON.stringify({ error: "image_base64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const replicateKey = Deno.env.get("REPLICATE_API_KEY");
    if (!replicateKey) {
      return new Response(JSON.stringify({ error: "REPLICATE_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageDataUrl = `data:${image_type || "image/jpeg"};base64,${image_base64}`;

    // ── Step 1: SAM2 wall detection with point prompts ─────────────────────
    console.log("Step 1: SAM2 wall segmentation");
    const sam2Result = await runReplicate(replicateKey, SAM2_VERSION, {
      image: imageDataUrl,
      point_coords: [[0.5, 0.3], [0.2, 0.35], [0.8, 0.35], [0.5, 0.5]],
      point_labels: [1, 1, 1, 1],
      use_m2m: true,
    });

    if (sam2Result.status !== "succeeded" || !sam2Result.output) {
      console.error("SAM2 failed:", sam2Result.error);
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: sam2Result.error }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const wallMaskUrl = sam2Result.output.combined_mask ||
      (Array.isArray(sam2Result.output) ? sam2Result.output[0] : sam2Result.output);

    console.log("Wall mask URL:", String(wallMaskUrl).substring(0, 80));

    // ── Step 2: GroundingDINO exclusion mask ───────────────────────────────
    // Detect non-paintable surfaces to exclude
    console.log("Step 2: GroundingDINO exclusion detection");
    let exclusionMaskUrl: string | null = null;

    try {
      const gdResult = await runReplicate(
        replicateKey,
        "adirik/grounding-dino:efd10a8ddc57511cce9b191f4e93af79ca1b4f725aa5b3e11ca6ae80cd5bdcc1",
        {
          image: imageDataUrl,
          prompt: "window. door. floor. ceiling. sofa. chair. table. curtain. picture frame. light switch. radiator. fireplace. furniture. carpet. rug. skirting board",
          box_threshold: 0.3,
          text_threshold: 0.25,
        }
      );

      if (gdResult.status === "succeeded" && gdResult.output) {
        // GroundingDINO returns annotated image — we need the bounding boxes
        // Return both masks to frontend for pixel-level exclusion
        console.log("GroundingDINO succeeded, output type:", typeof gdResult.output);
        
        // Get the exclusion mask if available
        if (typeof gdResult.output === "string" && gdResult.output.startsWith("http")) {
          exclusionMaskUrl = gdResult.output;
        } else if (gdResult.output?.annotated_image) {
          exclusionMaskUrl = gdResult.output.annotated_image;
        }
      }
    } catch (gdErr) {
      console.error("GroundingDINO failed (non-fatal):", gdErr);
      // Continue with just the wall mask
    }

    // ── Step 3: Proxy wall mask ────────────────────────────────────────────
    const wallMaskBase64 = await proxyImageToBase64(String(wallMaskUrl));

    const response: Record<string, string> = { output: wallMaskBase64 };

    if (exclusionMaskUrl) {
      try {
        response.exclusion_mask = await proxyImageToBase64(exclusionMaskUrl);
      } catch {
        // exclusion mask proxy failed — not critical
      }
    }

    console.log("Returning masks - has exclusion:", !!response.exclusion_mask);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("segment-walls error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

