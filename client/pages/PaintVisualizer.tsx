import { Card, CardContent } from "@/components/ui/card";

export default function PaintVisualizer() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="border-muted/60">
        <CardContent className="p-0">
          <div className="relative h-[460px] md:h-[520px] w-full overflow-hidden rounded-md">
            <iframe
              src="https://appdemo.floori.io/"
              title="Floori Studio Visualizer"
              className="absolute left-0 top-0 h-[1200px] w-full"
              loading="lazy"
              scrolling="no"
              style={{ pointerEvents: "none", border: 0 }}
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
