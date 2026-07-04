export interface Env {
  HF_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { image_base64, image_type } = await request.json() as { image_base64: string; image_type: string };
      const imageBytes = Uint8Array.from(atob(image_base64), c => c.charCodeAt(0));

      const hfResponse = await fetch(
        "https://router.huggingface.co/hf-inference/models/nvidia/segformer-b5-finetuned-ade-640-640",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.HF_TOKEN}`,
            "Content-Type": image_type || "image/jpeg",
          },
          body: imageBytes,
        }
      );

      if (!hfResponse.ok) {
        const err = await hfResponse.text();
        return new Response(JSON.stringify({ error: "segmentation_unavailable", detail: err }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const segments = await hfResponse.json() as any[];
      const wallMasks: string[] = [];
      const excludedMasks: string[] = [];

      for (const seg of segments) {
        const label = seg.label?.toLowerCase();
        if (label === "wall" && seg.mask) {
          wallMasks.push(seg.mask);
        } else if (["floor", "ceiling", "window", "door", "furniture"].some(e => label?.includes(e)) && seg.mask) {
          excludedMasks.push(seg.mask);
        }
      }

      if (wallMasks.length === 0) {
        return new Response(JSON.stringify({ error: "segmentation_unavailable", detail: "No wall detected" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ wall_masks: wallMasks, excluded_masks: excludedMasks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
