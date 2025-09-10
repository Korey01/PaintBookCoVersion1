import { Card, CardContent } from "@/components/ui/card";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function PaintVisualizer() { useEffect(()=>{ document.title = "Paint Visualizer | PaintBook"; },[]);
  return (
    <div className="container mx-auto grid gap-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Paint Visualizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload a photo and select a paint color to see the result instantly.</p>
      </div>
      <Card className="border-muted/60">
        <CardContent className="p-0">
          <div className="relative h-[75vh] w-full overflow-hidden rounded-md" aria-label="Interactive paint visualizer">
            <iframe
              src="https://appdemo.floori.io/"
              title="Floori Studio Visualizer"
              className="absolute left-0 top-0 h-[1200px] w-full"
              loading="lazy"
              scrolling="no"
              style={{ border: 0 }}
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground">Having trouble? <a className="underline" href="https://appdemo.floori.io/" target="_blank" rel="noreferrer">Open full‑screen</a>.</div>
    </div>
  );
}
