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

    const segformerUrl = Deno.env.get("SEGFORMER_API_URL");
    if (!segformerUrl) {
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: "SEGFORMER_API_URL not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling AWS SegFormer service");

    const res = await fetch(segformerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64, image_type }),
    });

    const data = await res.json();
    console.log("SegFormer response - wall coverage:", data.wall_coverage_percent, "%");

    if (data.error) {
      return new Response(
        JSON.stringify({ error: "segmentation_unavailable", detail: data.error }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return in format frontend expects
    return new Response(
      JSON.stringify({
        output: data.wall_mask,
        exclusion_mask: data.exclusion_mask,
        wall_coverage: data.wall_coverage_percent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("segment-walls error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
