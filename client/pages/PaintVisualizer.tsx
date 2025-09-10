import { Card, CardContent } from "@/components/ui/card";

export default function PaintVisualizer() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="border-muted/60">
        <CardContent className="p-0">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-md">
            <iframe
              src="https://appdemo.floori.io/"
              title="Floori Studio Visualizer"
              className="h-full w-full"
              loading="lazy"
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
