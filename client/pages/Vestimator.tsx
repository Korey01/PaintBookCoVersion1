import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaintBucket, Calculator, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function num(v: string | number) { const n = typeof v === 'number' ? v : parseFloat(v || '0'); return isNaN(n) ? 0 : n; }

type PaintType = "interior_matt" | "satinwood" | "exterior_masonry";

// Coverage values from user-provided product pages
const BRAND_INFO: Record<string, Record<PaintType, { coverage: number; pricePerLitre: number }>> = {
  "Dulux Trade Vinyl Matt": { interior_matt: { coverage: 17, pricePerLitre: 25 }, satinwood: { coverage: 17, pricePerLitre: 25 }, exterior_masonry: { coverage: 17, pricePerLitre: 25 } },
  "Farrow & Ball Estate Emulsion": { interior_matt: { coverage: 14, pricePerLitre: 34 }, satinwood: { coverage: 14, pricePerLitre: 34 }, exterior_masonry: { coverage: 14, pricePerLitre: 34 } },
  "Johnstone's Trade Acrylic Durable Matt": { interior_matt: { coverage: 16, pricePerLitre: 20 }, satinwood: { coverage: 16, pricePerLitre: 20 }, exterior_masonry: { coverage: 16, pricePerLitre: 20 } },
  "Crown Trade Matt Vinyl Emulsion": { interior_matt: { coverage: 17, pricePerLitre: 19 }, satinwood: { coverage: 17, pricePerLitre: 19 }, exterior_masonry: { coverage: 17, pricePerLitre: 19 } },
};

const BRAND_LINKS: Record<string, string> = {
  "Dulux Trade Vinyl Matt": "https://www.duluxtradepaintexpert.co.uk/en/products/dulux-trade-vinyl-matt?size=1L",
  "Farrow & Ball Estate Emulsion": "https://www.farrow-ball.com/paint-finishes/estate-emulsion",
  "Johnstone's Trade Acrylic Durable Matt": "https://www.johnstonestrade.com/product/acrylic-durable-matt.html",
  "Crown Trade Matt Vinyl Emulsion": "https://www.crownpaintsprofessional.com/product/crown-trade-matt-vinyl-emulsion/",
};

export default function Vestimator() {
  useEffect(()=>{ document.title = "Paint Vestimator | Visualize + Estimate"; },[]);
  const navigate = useNavigate();

  // Uploads for visualizer context
  const [images, setImages] = useState<string[]>([]);
  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 6);
    files.forEach((file)=>{
      const reader = new FileReader();
      reader.onload = () => setImages(prev => [...prev, String(reader.result)]);
      reader.readAsDataURL(file);
    });
  }

  // Estimator state
  const [length, setLength] = useState(4);
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(2.6);
  const [coats, setCoats] = useState(2);
  const [paintType, setPaintType] = useState<PaintType>('interior_matt');
  const [selectedBrand, setSelectedBrand] = useState<keyof typeof BRAND_INFO>('Dulux Trade Vinyl Matt');
  const [openings, setOpenings] = useState(2);
  const [openingArea, setOpeningArea] = useState(1.9);
  const [coverage, setCoverage] = useState(BRAND_INFO['Dulux Trade Vinyl Matt'].interior_matt.coverage); // m2/L
  const [pricePerLitre, setPricePerLitre] = useState(BRAND_INFO['Dulux Trade Vinyl Matt'].interior_matt.pricePerLitre);

  const wallArea = useMemo(() => {
    const perimeter = 2 * (length + width);
    const gross = perimeter * height;
    const subtract = openings * openingArea;
    return Math.max(0, gross - subtract);
  }, [length, width, height, openings, openingArea]);

  const litres = useMemo(() => {
    const perCoat = wallArea / coverage;
    return Math.ceil((perCoat * coats) * 10) / 10;
  }, [wallArea, coverage, coats]);

  const materialCost = useMemo(() => Math.round(litres * pricePerLitre), [litres, pricePerLitre]);

  // Sync coverage and price from selected brand
  useEffect(() => {
    const info = BRAND_INFO[selectedBrand][paintType] || BRAND_INFO[selectedBrand].interior_matt;
    setCoverage(info.coverage);
    setPricePerLitre(info.pricePerLitre);
  }, [selectedBrand, paintType]);

  function attachToPost() {
    const qp = new URLSearchParams({
      estimate: JSON.stringify({ length, width, height, coats, openings, openingArea, coverage, litres, materialCost })
    });
    navigate(`/post-job?${qp.toString()}`);
  }

  return (
    <div className="relative">
      <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fafed5108652c40a68e45dd3a3d173e3e?format=webp&width=1600" alt="" aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"/>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background/60 backdrop-blur-[2px]" />
      <div className="container mx-auto grid gap-6 px-4 py-8">
      <div className="flex items-center gap-3"><PaintBucket className="h-6 w-6 text-primary"/><h1 className="text-2xl font-bold">Paint Vestimator</h1></div>
      <p className="text-sm text-muted-foreground">Upload your room photos, preview colors in the Floori visualizer, and get instant paint quantity and cost estimates.</p>
      <div className="mt-3">
        <Button onClick={attachToPost}>Attach to Post Job <ArrowRight className="ml-2 h-4 w-4"/></Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="visualize">
              <TabsList className="mx-4 mt-4 w-auto">
                <TabsTrigger value="visualize">Visualize</TabsTrigger>
                <TabsTrigger value="estimate">Estimate</TabsTrigger>
              </TabsList>
              <TabsContent value="visualize" className="m-0">
                <div className="grid gap-4 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tip: Use the Floori Studio below to upload photos and paint walls virtually.</p>
                  </div>
                  <div className="relative h-[85vh] w-full overflow-visible rounded-md border" aria-label="Interactive paint visualizer">
                    <iframe
                      src="https://appdemo.floori.io/"
                      title="Floori Studio Visualizer"
                      className="absolute left-0 top-0 h-full w-full"
                      loading="lazy"
                      scrolling="auto"
                      style={{ border: 0 }}
                      allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; display-capture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="estimate" className="m-0">
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Brand</Label>
                    <select value={selectedBrand as string} onChange={e=>setSelectedBrand(e.target.value as keyof typeof BRAND_INFO)} className="mt-1 w-full rounded-md border bg-background p-2">
                      {Object.keys(BRAND_INFO).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Room length (m)</Label>
                    <Input type="number" min={0.5} step="0.1" value={length} onChange={e=>setLength(Math.max(0.5, num(e.target.value)))} />
                  </div>
                  <div>
                    <Label>Room width (m)</Label>
                    <Input type="number" min={0.5} step="0.1" value={width} onChange={e=>setWidth(Math.max(0.5, num(e.target.value)))} />
                  </div>
                  <div>
                    <Label>Wall height (m)</Label>
                    <Input type="number" min={1.5} step="0.1" value={height} onChange={e=>setHeight(Math.max(1.5, num(e.target.value)))} />
                  </div>
                  <div>
                    <Label>Number of coats</Label>
                    <Input type="number" min={1} step="1" value={coats} onChange={e=>setCoats(Math.max(1, num(e.target.value)))} />
                  </div>
                  <div>
                    <Label>Openings (doors/windows)</Label>
                    <Input type="number" step="1" value={openings} onChange={e=>setOpenings(num(e.target.value))} />
                  </div>
                  <div>
                    <Label>Avg opening area (m²)</Label>
                    <Input type="number" step="0.1" value={openingArea} onChange={e=>setOpeningArea(num(e.target.value))} />
                  </div>
                  <div>
                    <Label>Coverage (m² per litre)</Label>
                    <Input type="number" step="0.1" value={coverage} onChange={e=>setCoverage(num(e.target.value))} />
                  </div>
                  <div>
                    <Label>Price per litre (£)</Label>
                    <Input type="number" step="0.1" value={pricePerLitre} onChange={e=>setPricePerLitre(num(e.target.value))} />
                  </div>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Wall area</div><div className="text-xl font-bold">{wallArea.toFixed(1)} m²</div></div>
                  <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Litres required</div><div className="text-xl font-bold">{litres.toFixed(1)} L</div></div>
                  <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Coats</div><div className="text-xl font-bold">{coats}</div></div>
                  <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Material cost</div><div className="text-xl font-bold">£{materialCost}</div></div>
                </div>
                <div className="flex flex-wrap gap-3 p-4">
                  <Button variant="outline" onClick={()=>navigate('/find-painter')}>Find A Painter/Decorator</Button>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">Brand estimates</h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(BRAND_INFO).map(([name, info])=>{
                      const { coverage: cov, pricePerLitre: ppl } = info[paintType];
                      const perCoat = wallArea / cov;
                      const litresCalc = Math.ceil((perCoat * coats) * 10) / 10;
                      const cost = Math.round(litresCalc * ppl);
                      return (
                        <Card key={name} className="border-muted/60">
                          <CardContent className="p-4 text-sm">
                            <div className="text-base font-semibold">{name}</div>
                            <div className="mt-2 grid gap-1">
                              <div className="flex justify-between"><span className="text-muted-foreground">Coverage</span><span>{cov} m²/L</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Price/L</span><span>£{ppl}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Litres</span><span>{litresCalc.toFixed(1)} L</span></div>
                              <div className="flex justify-between font-medium"><span>Material cost</span><span>£{cost}</span></div>
                            </div>
                            <div className="mt-3">
                              <Button asChild size="sm" className="w-full">
                                <a href={BRAND_LINKS[name] || '#'} target="_blank" rel="noopener noreferrer">Buy through us</a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary"/><div className="text-sm font-medium">Summary</div></div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between"><span>Wall area</span><span>{wallArea.toFixed(1)} m²</span></div>
              <div className="flex items-center justify-between"><span>Litres</span><span>{litres.toFixed(1)} L</span></div>
              <div className="flex items-center justify-between"><span>Material cost</span><span>£{materialCost}</span></div>
            </div>
            <Button className="mt-2 w-full" variant="secondary" onClick={()=>window.open('https://appdemo.floori.io/','_blank')}>Open Floori Studio</Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
