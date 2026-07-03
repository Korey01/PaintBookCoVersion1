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
    const { image_base64, image_type } = await req.json();

    if (!image_base64) {
      return new Response(JSON.stringify({ error: "image_base64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hfToken = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!hfToken) {
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: "HUGGINGFACE_API_KEY not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBytes = Uint8Array.from(atob(image_base64), c => c.charCodeAt(0));

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/nvidia/segformer-b5-finetuned-ade-640-640",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": image_type || "image/jpeg",
        },
        body: imageBytes,
      }
    );

    if (!hfResponse.ok) {
      const err = await hfResponse.text();
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: err }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const segments = await hfResponse.json();

    let wallMask = null;
    let exclusionMask = null;

    for (const seg of segments) {
      const label = seg.label?.toLowerCase();
      if (label === "wall" && seg.mask) wallMask = seg.mask;
      if (["floor", "ceiling", "window", "door", "furniture"].some(e => label?.includes(e))) {
        exclusionMask = exclusionMask || seg.mask;
      }
    }

    if (!wallMask) {
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: "No wall detected" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ output: wallMask, exclusion_mask: exclusionMask, wall_coverage: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
