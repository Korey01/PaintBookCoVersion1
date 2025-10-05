import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BRAND_INFO,
  DEFAULT_ESTIMATOR_INPUT,
  PAINT_TYPES,
  computeEstimate,
} from "@/lib/paint-estimator";

function num(v: string | number) {
  const n = typeof v === "number" ? v : parseFloat(v || "0");
  return Number.isFinite(n) ? n : 0;
}

type PaintType = (typeof PAINT_TYPES)[number]["value"];

export default function Estimator() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [length, setLength] = useState(Number(params.get('length') || DEFAULT_ESTIMATOR_INPUT.length));
  const [width, setWidth] = useState(Number(params.get('width') || DEFAULT_ESTIMATOR_INPUT.width));
  const [height, setHeight] = useState(Number(params.get('height') || DEFAULT_ESTIMATOR_INPUT.height));
  const [coats, setCoats] = useState(Number(params.get('coats') || DEFAULT_ESTIMATOR_INPUT.coats));
  const [paintType, setPaintType] = useState<PaintType>(DEFAULT_ESTIMATOR_INPUT.paintType);
  const [openings, setOpenings] = useState(Number(params.get('openings') || DEFAULT_ESTIMATOR_INPUT.openings));
  const [openingArea, setOpeningArea] = useState(Number(params.get('openingArea') || DEFAULT_ESTIMATOR_INPUT.openingArea));
  const [coverage, setCoverage] = useState(Number(params.get('coverage') || DEFAULT_ESTIMATOR_INPUT.coverage));
  const [pricePerLitre, setPricePerLitre] = useState(Number(params.get('price') || DEFAULT_ESTIMATOR_INPUT.pricePerLitre));

  const { wallArea, litres, materialCost, brandEstimates } = useMemo(() => {
    return computeEstimate({ length, width, height, coats, openings, openingArea, coverage, pricePerLitre, paintType });
  }, [length, width, height, coats, openings, openingArea, coverage, pricePerLitre, paintType]);

  function attachToPost() {
    const qp = new URLSearchParams({
      estimate: JSON.stringify({
        length,
        width,
        height,
        coats,
        openings,
        openingArea,
        coverage,
        pricePerLitre,
        paintType,
        litres,
        materialCost,
        wallArea,
      }),
    });
    navigate(`/post-job?${qp.toString()}`);
  }

  function attachBrand(name: string, coverageVal: number, litresVal: number, priceVal: number, costVal: number) {
    const qp = new URLSearchParams({
      estimate: JSON.stringify({
        length,
        width,
        height,
        coats,
        openings,
        openingArea,
        coverage: coverageVal,
        pricePerLitre: priceVal,
        paintType,
        litres: litresVal,
        materialCost: costVal,
        wallArea,
        brand: name,
      }),
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
              <Input type="number" min={0.5} step="0.1" value={length} onChange={e=>setLength(Math.max(0.5, num(e.target.value)))}/>
            </div>
            <div>
              <Label>Room width (m)</Label>
              <Input type="number" min={0.5} step="0.1" value={width} onChange={e=>setWidth(Math.max(0.5, num(e.target.value)))}/>
            </div>
            <div>
              <Label>Wall height (m)</Label>
              <Input type="number" min={1.5} step="0.1" value={height} onChange={e=>setHeight(Math.max(1.5, num(e.target.value)))}/>
            </div>
            <div>
              <Label>Number of coats</Label>
              <Input type="number" min={1} step="1" value={coats} onChange={e=>setCoats(Math.max(1, num(e.target.value)))}/>
            </div>
            <div className="sm:col-span-2">
              <Label>Paint type</Label>
              <Select value={paintType} onValueChange={(v)=>setPaintType(v as PaintType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAINT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
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
              <Button variant="secondary" onClick={()=>{ const list = JSON.parse(localStorage.getItem('paintbook:estimates')||'[]'); list.unshift({ createdAt: new Date().toISOString(), wallArea, coats, litres, materialCost }); localStorage.setItem('paintbook:estimates', JSON.stringify(list)); }}>Save estimate</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Brand estimates</h2>
            <p className="mt-1 text-sm text-muted-foreground">Based on typical coverage and average retail price per litre. Actual results vary by surface and application.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {brandEstimates.map((b) => (
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
