const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// SAM2 correct version hash
const SAM2_VERSION = "fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83";

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

    // Submit prediction — use point in middle-upper area (likely wall)
    const submitRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: SAM2_VERSION,
        input: {
          image: imageDataUrl,
          // Point prompts at upper-middle area where walls typically are
          point_coords: [[0.5, 0.3], [0.2, 0.4], [0.8, 0.4]],
          point_labels: [1, 1, 1],
          use_m2m: true,
        },
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Submit error:", submitRes.status, errText);
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: errText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = await submitRes.json();
    const predictionId = prediction.id;
    console.log("Prediction submitted:", predictionId);

    // Poll for result (max 50 seconds)
    const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
    let result = prediction;

    for (let i = 0; i < 25; i++) {
      if (result.status === "succeeded" || result.status === "failed" || result.status === "canceled") {
        break;
      }
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { "Authorization": `Bearer ${replicateKey}` },
      });
      result = await pollRes.json();
      console.log(`Poll ${i+1}: status=${result.status}`);
    }

    console.log("Final result keys:", Object.keys(result).join(","));
    console.log("Output type:", typeof result.output, Array.isArray(result.output) ? "array len=" + result.output.length : "");

    if (result.status !== "succeeded" || !result.output) {
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: result.error || result.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SAM2 returns combined_mask or array of masks
    const output = result.output;
    const maskUrl = output.combined_mask || (Array.isArray(output) ? output[0] : output);
    console.log("Mask URL:", String(maskUrl).substring(0, 80));

    if (!maskUrl || typeof maskUrl !== "string" || !maskUrl.startsWith("http")) {
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: "no valid mask URL" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Proxy mask to avoid CORS
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

  } catch (err) {
    console.error("segment-walls error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

