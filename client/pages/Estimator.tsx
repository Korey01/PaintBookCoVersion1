import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function num(v: string | number) { const n = typeof v === 'number' ? v : parseFloat(v || '0'); return isNaN(n) ? 0 : n; }

type PaintType = "interior_matt" | "satinwood" | "exterior_masonry";

const BRAND_INFO: Record<string, Record<PaintType, { coverage: number; pricePerLitre: number }>> = {
  "Dulux": {
    interior_matt: { coverage: 13, pricePerLitre: 20 },
    satinwood: { coverage: 12, pricePerLitre: 22 },
    exterior_masonry: { coverage: 11, pricePerLitre: 21 },
  },
  "JOHNSTONE'S": {
    interior_matt: { coverage: 12, pricePerLitre: 18 },
    satinwood: { coverage: 11, pricePerLitre: 19 },
    exterior_masonry: { coverage: 10, pricePerLitre: 19 },
  },
  "wilko": {
    interior_matt: { coverage: 10, pricePerLitre: 12 },
    satinwood: { coverage: 9, pricePerLitre: 13 },
    exterior_masonry: { coverage: 8, pricePerLitre: 12 },
  },
  "Leyland": {
    interior_matt: { coverage: 12, pricePerLitre: 16 },
    satinwood: { coverage: 11, pricePerLitre: 17 },
    exterior_masonry: { coverage: 10, pricePerLitre: 17 },
  },
};

export default function Estimator() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [length, setLength] = useState(Number(params.get('length') || 4));
  const [width, setWidth] = useState(Number(params.get('width') || 3));
  const [height, setHeight] = useState(Number(params.get('height') || 2.6));
  const [coats, setCoats] = useState(Number(params.get('coats') || 2));
  const [paintType, setPaintType] = useState<PaintType>('interior_matt');
  const [openings, setOpenings] = useState(Number(params.get('openings') || 2));
  const [openingArea, setOpeningArea] = useState(Number(params.get('openingArea') || 1.9));
  const [coverage, setCoverage] = useState(Number(params.get('coverage') || 10)); // m2 per litre
  const [pricePerLitre, setPricePerLitre] = useState(Number(params.get('price') || 18));

  const wallArea = useMemo(() => {
    const perimeter = 2 * (length + width);
    const gross = perimeter * height;
    const subtract = openings * openingArea;
    return Math.max(0, gross - subtract);
  }, [length, width, height, openings, openingArea]);

  const litres = useMemo(() => {
    const perCoat = wallArea / coverage;
    return Math.ceil((perCoat * coats) * 10) / 10; // round 0.1L
  }, [wallArea, coverage, coats]);

  const materialCost = useMemo(() => Math.round(litres * pricePerLitre), [litres, pricePerLitre]);

  const brandEstimates = useMemo(() => {
    return Object.entries(BRAND_INFO).map(([name, info]) => {
      const { coverage, pricePerLitre } = info[paintType];
      const perCoat = wallArea / coverage;
      const litres = Math.ceil((perCoat * coats) * 10) / 10;
      const cost = Math.round(litres * pricePerLitre);
      return { name, coverage, pricePerLitre, litres, cost };
    });
  }, [paintType, wallArea, coats]);

  function attachToPost() {
    const qp = new URLSearchParams({
      estimate: JSON.stringify({ length, width, height, coats, openings, openingArea, coverage, litres, materialCost })
    });
    navigate(`/post-job?${qp.toString()}`);
  }

  function attachBrand(name: string, coverageVal: number, litresVal: number, priceVal: number, costVal: number) {
    const qp = new URLSearchParams({
      estimate: JSON.stringify({ length, width, height, coats, openings, openingArea, coverage: coverageVal, litres: litresVal, materialCost: costVal, brand: name, paintType, pricePerLitre: priceVal })
    });
    navigate(`/post-job?${qp.toString()}`);
  }

  useEffect(() => {
    const payload = { length, width, height, coats, openings, openingArea, coverage, pricePerLitre };
    localStorage.setItem('paintbook:lastEstimate', JSON.stringify(payload));
  }, [length, width, height, coats, openings, openingArea, coverage, pricePerLitre]);

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[-5]">
        <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fe18bb9f89de1478cadd8e962e4c0ccbc?format=webp&width=2000" alt="" className="h-full w-full object-cover object-left" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>
      <div className="container mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Calculator className="h-6 w-6 text-primary"/>
        <h1 className="text-2xl font-bold">Paint Estimator</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_420px]">
        <Card className="order-2 md:order-1">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <Label>Room length (m)</Label>
              <Input type="number" step="0.1" value={length} onChange={e=>setLength(num(e.target.value))}/>
            </div>
            <div>
              <Label>Room width (m)</Label>
              <Input type="number" step="0.1" value={width} onChange={e=>setWidth(num(e.target.value))}/>
            </div>
            <div>
              <Label>Wall height (m)</Label>
              <Input type="number" step="0.1" value={height} onChange={e=>setHeight(num(e.target.value))}/>
            </div>
            <div>
              <Label>Number of coats</Label>
              <Input type="number" step="1" value={coats} onChange={e=>setCoats(num(e.target.value))}/>
            </div>
            <div className="sm:col-span-2">
              <Label>Paint type</Label>
              <Select value={paintType} onValueChange={(v)=>setPaintType(v as PaintType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interior_matt">Interior Matt (Emulsion)</SelectItem>
                  <SelectItem value="satinwood">Satinwood (Trim/Woodwork)</SelectItem>
                  <SelectItem value="exterior_masonry">Exterior Masonry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Openings (doors/windows)</Label>
              <Input type="number" step="1" value={openings} onChange={e=>setOpenings(num(e.target.value))}/>
            </div>
            <div>
              <Label>Avg opening area (m²)</Label>
              <Input type="number" step="0.1" value={openingArea} onChange={e=>setOpeningArea(num(e.target.value))}/>
            </div>
            <div>
              <Label>Coverage (m² per litre)</Label>
              <Input type="number" step="0.1" value={coverage} onChange={e=>setCoverage(num(e.target.value))}/>
            </div>
            <div>
              <Label>Price per litre (£)</Label>
              <Input type="number" step="0.1" value={pricePerLitre} onChange={e=>setPricePerLitre(num(e.target.value))}/>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 md:order-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Results</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Wall area</div><div className="text-xl font-bold">{wallArea.toFixed(1)} m²</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Coats</div><div className="text-xl font-bold">{coats}</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Litres required</div><div className="text-xl font-bold">{litres.toFixed(1)} L</div></div>
              <div className="rounded-lg bg-secondary p-3"><div className="text-muted-foreground">Material cost</div><div className="text-xl font-bold">£{materialCost}</div></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={attachToPost}>Attach to Post Job <ArrowRight className="ml-2 h-4 w-4"/></Button>
              <Button variant="outline" onClick={()=>navigate('/find-painter')}>Find a Painter</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Brand estimates</h2>
            <p className="mt-1 text-sm text-muted-foreground">Based on typical coverage and average retail price per litre. Actual results vary by surface and application.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {brandEstimates.map(b => (
                <Card key={b.name} className="border-muted/60">
                  <CardContent className="p-4 text-sm">
                    <div className="text-base font-semibold">{b.name}</div>
                    <div className="mt-2 grid gap-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Coverage</span><span>{b.coverage} m²/L</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Price/L</span><span>£{b.pricePerLitre}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Litres</span><span>{b.litres.toFixed(1)} L</span></div>
                      <div className="flex justify-between font-medium"><span>Material cost</span><span>£{b.cost}</span></div>
                    </div>
                    <Button className="mt-3 w-full" onClick={()=>attachBrand(b.name, b.coverage, b.litres, b.pricePerLitre, b.cost)}>Attach this estimate</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
