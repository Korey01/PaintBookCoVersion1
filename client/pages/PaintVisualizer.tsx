import { Card, CardContent } from "@/components/ui/card";

export default function PaintVisualizer() {
  return (
    <div className="container mx-auto grid gap-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Paint Visualizer</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload a photo and select a paint color to see the result instantly.</p>
      </div>
      <Card className="border-muted/60">
        <CardContent className="p-0">
          <div className="relative h-[420px] md:h-[520px] w-full overflow-hidden rounded-md">
            <iframe
              src="https://appdemo.floori.io/"
              title="Floori Studio Visualizer"
              className="absolute left-0 top-0 h-[1200px] w-full"
              loading="lazy"
              scrolling="no"
              style={{ border: 0, transform: "scale(1.1)", transformOrigin: "top center" }}
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
