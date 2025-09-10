import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Palette, PaintBucket, Lock } from "lucide-react";

const SWATCHES = [
  { name: "Soft White", value: "#F5F6F7" },
  { name: "Calm Blue", value: "#9EC5FE" },
  { name: "Sage Green", value: "#B8E0C2" },
  { name: "Warm Sand", value: "#E9D8B4" },
  { name: "Charcoal", value: "#4A4A4A" },
  { name: "Terracotta", value: "#D27C5A" },
];

export default function PaintVisualizer(){
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [color, setColor] = useState<string>(SWATCHES[1].value);
  const [intensity, setIntensity] = useState<number[]>([65]);
  const [mode, setMode] = useState<"multiply"|"color"|"overlay"|"soft-light">("color");
  const [shadow, setShadow] = useState<number[]>([20]);
  const [highlight, setHighlight] = useState<number[]>([8]);
  const [saturation, setSaturation] = useState<number[]>([95]);
  const [contrast, setContrast] = useState<number[]>([105]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  }

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Palette className="h-3.5 w-3.5"/> Paint Visualizer (Concept)
        </div>
        <h1 className="mt-3 text-2xl font-bold">Try colours on your room photo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload a wall/room image, pick a colour swatch, and preview a simple overlay. This is a static demo preview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted/60">
          <CardContent className="p-6">
            <div className="grid gap-4">
              <div>
                <Label>Upload image</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={onFile} />
                  {!image && <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><ImageIcon className="h-4 w-4"/> JPG/PNG recommended</div>}
                </div>
              </div>

              <div>
                <Label>Pick a colour</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SWATCHES.map(s => (
                    <button
                      key={s.value}
                      onClick={()=>setColor(s.value)}
                      className={`h-9 w-9 rounded-md border shadow-sm ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-ring ${color===s.value? 'ring-2 ring-primary': ''}`}
                      style={{ backgroundColor: s.value }}
                      title={s.name}
                      aria-label={s.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Overlay intensity ({intensity[0]}%)</Label>
                <Slider min={0} max={100} step={1} value={intensity} onValueChange={setIntensity} />
              </div>

              <div className="rounded-lg bg-secondary p-3 text-xs inline-flex items-center gap-2">
                <PaintBucket className="h-4 w-4"/> Placeholder effect uses a colour overlay with blend mode for concept preview.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardContent className="p-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/30">
              {image ? (
                <>
                  <img src={image} alt="Uploaded room" className="h-full w-full object-cover"/>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: color,
                      mixBlendMode: 'multiply' as any,
                      opacity: intensity[0]/100,
                    }}
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Upload a room photo to preview colours
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5"/> Escrow via Stripe (FCA-regulated payment partner)</div>
              <Button onClick={()=>navigate('/post-job')}>Hire a Painter to Bring This to Life</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
