import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, ImageIcon, Loader2 } from "lucide-react";

const SWATCHES = [
  { name: "Soft White", value: "#F5F6F7" },
  { name: "Calm Blue", value: "#9EC5FE" },
  { name: "Sage Green", value: "#B8E0C2" },
  { name: "Warm Sand", value: "#E9D8B4" },
  { name: "Charcoal", value: "#4A4A4A" },
  { name: "Terracotta", value: "#D27C5A" },
];

export default function MockAiVisualizer(){
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [color, setColor] = useState<string>(SWATCHES[1].value);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => setFileUrl(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function generate(){
    if(!fileUrl) return;
    setLoading(true);
    // Simulate API processing delay
    await new Promise(r=>setTimeout(r, 1200));

    // Simple client-side transform using canvas to mimic AI output
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      // Apply color tint
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Add subtle shading via soft-light imitation
      ctx.globalCompositeOperation = "soft-light" as globalCompositeOperation;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Restore and export
      ctx.globalCompositeOperation = "source-over";
      setResult(canvas.toDataURL("image/jpeg", 0.92));
      setLoading(false);
    };
    img.src = fileUrl;
  }

  return (
    <Card className="border-muted/60">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm font-medium"><Palette className="h-4 w-4"/> Mock Upload & Preview (HomeDesignsAI‑style)</div>
        <p className="mt-1 text-xs text-muted-foreground">Imitates an external API flow: upload, choose colour, generate transformed image.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-3">
            <div>
              <Label>Upload room photo</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={onFile} />
                {!fileUrl && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ImageIcon className="h-4 w-4"/> JPG/PNG</span>}
              </div>
            </div>
            <div>
              <Label>Colour swatch</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SWATCHES.map(s=> (
                  <button key={s.value} onClick={()=>setColor(s.value)} className={`h-8 w-8 rounded-md border ${color===s.value? 'ring-2 ring-primary':''}`} style={{ backgroundColor: s.value }} title={s.name} aria-label={s.name}/>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={generate} disabled={!fileUrl || loading}>{loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating…</>) : 'Generate Preview'}</Button>
              {fileUrl && <Button variant="secondary" onClick={()=>setResult(null)}>Reset</Button>}
            </div>
          </div>
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted/30">
              {result ? (
                <img src={result} alt="Transformed preview" className="h-full w-full object-cover"/>
              ) : fileUrl ? (
                <img src={fileUrl} alt="Uploaded" className="h-full w-full object-cover opacity-70"/>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Upload a photo to preview</div>
              )}
            </div>
          </div>
        </div>
        {result && (
          <div className="mt-3 text-xs text-muted-foreground">Preview generated locally for demo purposes. Integrates with provider APIs in production.</div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
