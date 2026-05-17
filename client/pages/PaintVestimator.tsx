import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  PAINT_PRODUCTS as STATIC_PRODUCTS,
  PaintProduct,
  COLOUR_FAMILIES,
  BRANDS,
  COVERAGE_RATES,
} from "@/data/paintBrands";

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = "calculator" | "colours" | "visualiser" | "quote";

type RoomShape = "rectangular" | "l-shaped" | "other";

interface RoomInputs {
  roomType: string;
  height: number;
  shape: RoomShape;
  width: number;
  length: number;
  width2: number;
  length2: number;
  doors: number;
  windows: number;
  coats: 1 | 2;
  surfaceType: string;
  paintType: string;
}

interface CalculatorResult {
  wallArea: number;
  totalArea: number;
  litresNeeded: number;
  cans: { qty: number; size: number }[];
}

interface QuoteItem {
  roomType: string;
  wallArea: number;
  litresNeeded: number;
  cans: { qty: number; size: number }[];
  selectedColour: PaintProduct | null;
  estimatedCost: number;
  timestamp: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Hallway",
  "Dining Room",
  "Office",
  "Other",
];

const SURFACE_TYPES = [
  "New plaster",
  "Previously painted",
  "Bare brick",
  "Wood",
];

const PAINT_TYPES = Object.keys(COVERAGE_RATES);

const STORAGE_KEY = "paintbookco_quote";

// ── Calculation helpers ───────────────────────────────────────────────────────

function calcWallArea(inputs: RoomInputs): number {
  if (inputs.shape === "rectangular") {
    return (
      (inputs.width + inputs.length) * 2 * inputs.height -
      inputs.doors * 1.9 -
      inputs.windows * 1.4
    );
  }
  if (inputs.shape === "l-shaped") {
    const perimeter =
      2 * (inputs.width + inputs.length) +
      2 * (inputs.width2 + inputs.length2) -
      2 * Math.min(inputs.width, inputs.width2);
    return (
      perimeter * inputs.height - inputs.doors * 1.9 - inputs.windows * 1.4
    );
  }
  // "other" — use rectangular formula as approximation
  return (
    (inputs.width + inputs.length) * 2 * inputs.height -
    inputs.doors * 1.9 -
    inputs.windows * 1.4
  );
}

function calcLitres(area: number, coats: number, paintType: string): number {
  const coverage = COVERAGE_RATES[paintType] ?? 12;
  const raw = (area * coats) / coverage;
  return Math.ceil(raw * 2) / 2; // round up to nearest 0.5L
}

function calcCans(litres: number): { qty: number; size: number }[] {
  const sizes = [10, 5, 2.5];
  const result: { qty: number; size: number }[] = [];
  let remaining = litres;
  for (const size of sizes) {
    const qty = Math.floor(remaining / size);
    if (qty > 0) {
      result.push({ qty, size });
      remaining -= qty * size;
    }
  }
  if (remaining > 0) {
    const existing = result.find((c) => c.size === 2.5);
    if (existing) {
      existing.qty += 1;
    } else {
      result.push({ qty: 1, size: 2.5 });
    }
  }
  return result;
}

// ── Canvas helper ─────────────────────────────────────────────────────────────

function applyColourOverlay(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  hex: string,
  opacity: number
) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PaintVestimator() {
  const [tab, setTab] = useState<Tab>("calculator");

  // Paint products (static fallback, DB override)
  const [products, setProducts] = useState<PaintProduct[]>(STATIC_PRODUCTS);

  // Calculator state
  const [inputs, setInputs] = useState<RoomInputs>({
    roomType: "Living Room",
    height: 2.4,
    shape: "rectangular",
    width: 4,
    length: 5,
    width2: 2,
    length2: 3,
    doors: 1,
    windows: 1,
    coats: 2,
    surfaceType: "Previously painted",
    paintType: "Matt Emulsion",
  });
  const [calcResult, setCalcResult] = useState<CalculatorResult | null>(null);
  const [selectedColour, setSelectedColour] = useState<PaintProduct | null>(null);

  // Colour browser state
  const [brandFilter, setBrandFilter] = useState("All");
  const [familyFilter, setFamilyFilter] = useState("All");
  const [finishFilter, setFinishFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<PaintProduct | null>(null);

  // Visualiser state
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [visualColour, setVisualColour] = useState<PaintProduct | null>(null);
  const [opacity, setOpacity] = useState(0.45);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Quote state
  const [quote, setQuote] = useState<QuoteItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  // ── Load products from Supabase ─────────────────────────────────────────────

  useEffect(() => {
    document.title =
      "Paint Vestimator — Calculate Paint Quantities & Find Colours | PaintBookCo";

    supabase
      .from("paint_products")
      .select("*")
      .eq("is_active", true)
      .order("brand", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Map DB rows to PaintProduct shape
          const mapped: PaintProduct[] = data.map((row: any) => ({
            id: row.id,
            brand: row.brand,
            name: row.colour_name,
            hex: row.hex_code ?? "#CCCCCC",
            rgb: { r: row.rgb_r ?? 204, g: row.rgb_g ?? 204, b: row.rgb_b ?? 204 },
            finish: row.finish ?? "Matt",
            coverage: row.coverage_m2_per_litre ?? 12,
            coatRecommended: row.coats_recommended ?? 2,
            sizes: (row.size_litres ?? []).map((l: number, i: number) => ({
              litres: l,
              approxPrice: (row.approx_price_gbp ?? [])[i] ?? 0,
            })),
            affiliateLinks: {
              amazon: row.amazon_search_url ?? undefined,
              bq: row.bq_search_url ?? undefined,
            },
            colourFamily: (row.colour_family ?? "Beige") as PaintProduct["colourFamily"],
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {
        // silently fall back to static data
      });
  }, []);

  // ── Persist quote ───────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
  }, [quote]);

  // ── Visualiser canvas redraw ────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !visualColour) return;
    applyColourOverlay(canvas, img, visualColour.hex, opacity);
  }, [visualColour, opacity]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleCalculate() {
    const wallArea = Math.max(0, calcWallArea(inputs));
    const totalArea = wallArea * inputs.coats;
    const litresNeeded = calcLitres(wallArea, inputs.coats, inputs.paintType);
    const cans = calcCans(litresNeeded);
    setCalcResult({ wallArea, totalArea, litresNeeded, cans });
  }

  function handleInput<K extends keyof RoomInputs>(key: K, value: RoomInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setCalcResult(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageDataUrl(dataUrl);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "paint-preview.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function handleAddToQuote() {
    if (!calcResult) return;
    const cheapestSize = selectedColour?.sizes[0];
    const pricePerLitre = cheapestSize
      ? cheapestSize.approxPrice / cheapestSize.litres
      : 0;
    const estimatedCost = calcResult.litresNeeded * pricePerLitre;
    const item: QuoteItem = {
      roomType: inputs.roomType,
      wallArea: calcResult.wallArea,
      litresNeeded: calcResult.litresNeeded,
      cans: calcResult.cans,
      selectedColour,
      estimatedCost,
      timestamp: Date.now(),
    };
    setQuote((prev) => [...prev, item]);
    setTab("quote");
  }

  function handleRemoveQuoteItem(idx: number) {
    setQuote((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleShareQuote() {
    const params = new URLSearchParams({
      q: JSON.stringify(
        quote.map((i) => ({
          room: i.roomType,
          litres: i.litresNeeded,
          colour: i.selectedColour?.name ?? "",
          brand: i.selectedColour?.brand ?? "",
        }))
      ),
    });
    const url = `${window.location.origin}/vestimator?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => alert("Share link copied to clipboard!"));
  }

  // ── Filtered products ────────────────────────────────────────────────────────

  const filteredProducts = products.filter((p) => {
    if (brandFilter !== "All" && p.brand !== brandFilter) return false;
    if (familyFilter !== "All" && p.colourFamily !== familyFilter) return false;
    if (finishFilter !== "All" && p.finish !== finishFilter) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.brand.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const dynamicBrands = ["All", ...Array.from(new Set(products.map((p) => p.brand))).sort()];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-background to-accent/20 border-b border-border py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Paint Vestimator
          </h1>
          <p className="text-muted-foreground mt-2">
            Calculate exactly how much paint you need, find the perfect colour,
            and buy from trusted retailers.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            * Buy Now links are affiliate links. PaintBookCo may earn a small
            commission at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {(
            [
              { id: "calculator", label: "Calculator" },
              { id: "colours", label: "Colour Browser" },
              { id: "visualiser", label: "Visualiser" },
              { id: "quote", label: `My Quote${quote.length ? ` (${quote.length})` : ""}` },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                tab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ── CALCULATOR TAB ──────────────────────────────────────────────── */}
        {tab === "calculator" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Paint Calculator
            </h2>

            <div className="space-y-5">
              {/* Room type */}
              <Field label="Room type">
                <Select
                  value={inputs.roomType}
                  onChange={(v) => handleInput("roomType", v)}
                  options={ROOM_TYPES}
                />
              </Field>

              {/* Wall height */}
              <Field label="Wall height (metres)">
                <NumberInput
                  value={inputs.height}
                  onChange={(v) => handleInput("height", v)}
                  step={0.1}
                  min={1}
                />
              </Field>

              {/* Room shape */}
              <Field label="Room shape">
                <div className="flex gap-3">
                  {(["rectangular", "l-shaped", "other"] as RoomShape[]).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                      <input
                        type="radio"
                        checked={inputs.shape === s}
                        onChange={() => handleInput("shape", s)}
                      />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </Field>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Width (m)">
                  <NumberInput
                    value={inputs.width}
                    onChange={(v) => handleInput("width", v)}
                    step={0.1}
                    min={0.1}
                  />
                </Field>
                <Field label="Length (m)">
                  <NumberInput
                    value={inputs.length}
                    onChange={(v) => handleInput("length", v)}
                    step={0.1}
                    min={0.1}
                  />
                </Field>
              </div>

              {/* L-shaped second section */}
              {inputs.shape === "l-shaped" && (
                <div className="grid grid-cols-2 gap-4 border border-border rounded-lg p-4 bg-muted/30">
                  <p className="col-span-2 text-xs text-muted-foreground font-medium">
                    Second section dimensions
                  </p>
                  <Field label="Width 2 (m)">
                    <NumberInput
                      value={inputs.width2}
                      onChange={(v) => handleInput("width2", v)}
                      step={0.1}
                      min={0.1}
                    />
                  </Field>
                  <Field label="Length 2 (m)">
                    <NumberInput
                      value={inputs.length2}
                      onChange={(v) => handleInput("length2", v)}
                      step={0.1}
                      min={0.1}
                    />
                  </Field>
                </div>
              )}

              {/* Doors & windows */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Number of doors">
                  <NumberInput
                    value={inputs.doors}
                    onChange={(v) => handleInput("doors", Math.max(0, Math.round(v)))}
                    step={1}
                    min={0}
                  />
                </Field>
                <Field label="Number of windows">
                  <NumberInput
                    value={inputs.windows}
                    onChange={(v) =>
                      handleInput("windows", Math.max(0, Math.round(v)))
                    }
                    step={1}
                    min={0}
                  />
                </Field>
              </div>

              {/* Coats */}
              <Field label="Number of coats">
                <div className="flex gap-4">
                  {([1, 2] as const).map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                      <input
                        type="radio"
                        checked={inputs.coats === c}
                        onChange={() => handleInput("coats", c)}
                      />
                      {c} {c === 1 ? "coat" : "coats"}
                    </label>
                  ))}
                </div>
              </Field>

              {/* Surface type */}
              <Field label="Surface type">
                <Select
                  value={inputs.surfaceType}
                  onChange={(v) => handleInput("surfaceType", v)}
                  options={SURFACE_TYPES}
                />
              </Field>

              {/* Paint type */}
              <Field label="Paint type">
                <Select
                  value={inputs.paintType}
                  onChange={(v) => handleInput("paintType", v)}
                  options={PAINT_TYPES}
                />
              </Field>

              <button
                onClick={handleCalculate}
                className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Calculate
              </button>
            </div>

            {/* Result */}
            {calcResult && (
              <div className="mt-8 border border-primary/30 bg-primary/5 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Your Results</h3>

                <div className="space-y-2 text-sm">
                  <ResultRow label="Total wall area" value={`${calcResult.wallArea.toFixed(2)} m²`} />
                  <ResultRow
                    label="Paint needed"
                    value={`${calcResult.litresNeeded}L`}
                    highlight
                  />
                  <ResultRow
                    label="Recommended cans"
                    value={calcResult.cans.map((c) => `${c.qty} × ${c.size}L`).join(" + ") || "—"}
                  />
                </div>

                {/* Selected colour preview */}
                {selectedColour && (
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div
                      className="w-8 h-8 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: selectedColour.hex }}
                    />
                    <span className="text-sm text-foreground font-medium">
                      {selectedColour.brand} — {selectedColour.name}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setTab("colours")}
                    className="flex-1 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    Choose a colour
                  </button>
                  <button
                    onClick={handleAddToQuote}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add to Quote
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COLOUR BROWSER TAB ──────────────────────────────────────────── */}
        {tab === "colours" && (
          <div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: grid */}
              <div className="flex-1 min-w-0">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Search colours..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48"
                  />
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {dynamicBrands.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  <select
                    value={familyFilter}
                    onChange={(e) => setFamilyFilter(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {COLOUR_FAMILIES.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                  <select
                    value={finishFilter}
                    onChange={(e) => setFinishFilter(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {["All", "Matt", "Silk", "Satin", "Gloss", "Eggshell"].map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Colour grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setDetailProduct(p)}
                      className={[
                        "group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all text-center",
                        detailProduct?.id === p.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-border",
                      ].join(" ")}
                    >
                      <div
                        className="w-12 h-12 rounded-full border border-border/50 shadow-sm"
                        style={{ backgroundColor: p.hex }}
                      />
                      <div className="w-full">
                        <p className="text-[10px] text-muted-foreground leading-tight truncate w-full">
                          {p.brand}
                        </p>
                        <p className="text-xs font-medium text-foreground leading-tight truncate w-full">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {p.finish}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <p className="text-muted-foreground text-sm py-12 text-center">
                    No colours match your filters.
                  </p>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  Prices are approximate RRP. PaintBookCo participates in
                  affiliate programmes. We may earn a commission when you click
                  through and make a purchase. This doesn't affect our
                  recommendations.
                </p>
              </div>

              {/* Right: product detail panel */}
              {detailProduct && (
                <div className="w-full md:w-80 flex-shrink-0">
                  <div className="border border-border rounded-xl p-5 sticky top-24">
                    {/* Colour swatch */}
                    <div
                      className="w-full h-32 rounded-lg mb-4 border border-border"
                      style={{ backgroundColor: detailProduct.hex }}
                    />

                    <p className="text-xs text-muted-foreground mb-1">
                      {detailProduct.brand}
                    </p>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {detailProduct.name}
                    </h3>
                    <span className="inline-block text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground mb-4">
                      {detailProduct.finish}
                    </span>

                    <div className="space-y-2 text-sm mb-4">
                      <ResultRow
                        label="Coverage"
                        value={`${detailProduct.coverage} m²/litre`}
                      />
                      <ResultRow
                        label="Recommended coats"
                        value={String(detailProduct.coatRecommended)}
                      />
                      {calcResult && (
                        <ResultRow
                          label="Litres needed"
                          value={`${calcResult.litresNeeded}L`}
                          highlight
                        />
                      )}
                    </div>

                    {/* Sizes & prices */}
                    {detailProduct.sizes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Approx. RRP
                        </p>
                        <div className="space-y-1">
                          {detailProduct.sizes.map((s) => (
                            <div
                              key={s.litres}
                              className="flex justify-between text-sm text-foreground"
                            >
                              <span>{s.litres}L</span>
                              <span className="font-medium">
                                approx. £{s.approxPrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Buy buttons */}
                    <div className="space-y-2">
                      {detailProduct.affiliateLinks.amazon && (
                        <a
                          href={detailProduct.affiliateLinks.amazon}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#FF9900] text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#FFB84D] transition-colors w-full justify-center"
                        >
                          <span>🛒</span> Buy on Amazon
                        </a>
                      )}
                      {detailProduct.affiliateLinks.bq && (
                        <a
                          href={detailProduct.affiliateLinks.bq}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#006B3F] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#005530] transition-colors w-full justify-center"
                        >
                          <span>🏪</span> Buy at B&Q
                        </a>
                      )}
                      {detailProduct.affiliateLinks.wickes && (
                        <a
                          href={detailProduct.affiliateLinks.wickes}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#E40000] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#B30000] transition-colors w-full justify-center"
                        >
                          <span>🏠</span> Buy at Wickes
                        </a>
                      )}
                    </div>

                    {/* Use in calculator */}
                    <button
                      onClick={() => {
                        setSelectedColour(detailProduct);
                        setVisualColour(detailProduct);
                        setTab("calculator");
                      }}
                      className="mt-3 w-full py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Use in Calculator
                    </button>

                    <p className="mt-3 text-[10px] text-muted-foreground">
                      PaintBookCo participates in affiliate programmes. We may
                      earn a commission when you click through and make a
                      purchase. This doesn't affect our recommendations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VISUALISER TAB ───────────────────────────────────────────────── */}
        {tab === "visualiser" && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">
              Wall Colour Visualiser
            </h2>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: canvas */}
              <div className="flex-1 min-w-0">
                {!imageDataUrl ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary transition-colors">
                    <span className="text-4xl mb-3">📷</span>
                    <p className="text-foreground font-medium mb-1">
                      Upload a room photo
                    </p>
                    <p className="text-muted-foreground text-sm">
                      JPG or PNG, max 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <canvas
                        ref={canvasRef}
                        className="w-full block"
                        style={{ maxHeight: "500px", objectFit: "contain" }}
                      />
                    </div>

                    {visualColour && (
                      <div className="flex items-center gap-3 text-sm text-foreground">
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{ backgroundColor: visualColour.hex }}
                        />
                        <span>
                          {visualColour.brand} — {visualColour.name}
                        </span>
                      </div>
                    )}

                    {/* Opacity slider */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Colour intensity: {Math.round(opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min={0.2}
                        max={0.7}
                        step={0.05}
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleDownload}
                        disabled={!visualColour}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        Download Preview
                      </button>
                      <label className="flex-1 py-2.5 border border-border rounded-lg text-sm text-foreground text-center cursor-pointer hover:bg-muted transition-colors">
                        Change photo
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: colour selector (compact) */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <p className="text-sm font-medium text-foreground mb-3">
                  Select a colour to preview
                </p>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />
                <div className="grid grid-cols-4 gap-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      title={`${p.brand} — ${p.name}`}
                      onClick={() => {
                        setVisualColour(p);
                        const canvas = canvasRef.current;
                        const img = imgRef.current;
                        if (canvas && img) {
                          applyColourOverlay(canvas, img, p.hex, opacity);
                        }
                      }}
                      className={[
                        "w-12 h-12 rounded-full border-2 transition-all mx-auto block",
                        visualColour?.id === p.id
                          ? "border-primary scale-110 shadow-md"
                          : "border-border hover:border-primary/50",
                      ].join(" ")}
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MY QUOTE TAB ────────────────────────────────────────────────── */}
        {tab === "quote" && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">My Quote</h2>
              {quote.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={handleShareQuote}
                    className="text-sm px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                  >
                    Share Quote
                  </button>
                  <button
                    onClick={() => setQuote([])}
                    className="text-sm px-4 py-2 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {quote.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-foreground font-medium mb-1">
                  Your quote is empty
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  Use the calculator to estimate paint and add rooms to your
                  quote.
                </p>
                <button
                  onClick={() => setTab("calculator")}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Calculator
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quote.map((item, idx) => (
                  <div
                    key={item.timestamp}
                    className="border border-border rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-foreground">
                          {item.roomType}
                        </p>
                        {item.selectedColour && (
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{
                                backgroundColor: item.selectedColour.hex,
                              }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.selectedColour.brand} —{" "}
                              {item.selectedColour.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveQuoteItem(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-1.5 text-sm mb-3">
                      <ResultRow
                        label="Wall area"
                        value={`${item.wallArea.toFixed(2)} m²`}
                      />
                      <ResultRow
                        label="Paint needed"
                        value={`${item.litresNeeded}L`}
                      />
                      <ResultRow
                        label="Recommended cans"
                        value={
                          item.cans.map((c) => `${c.qty} × ${c.size}L`).join(" + ") ||
                          "—"
                        }
                      />
                      {item.estimatedCost > 0 && (
                        <ResultRow
                          label="Est. material cost"
                          value={`approx. £${item.estimatedCost.toFixed(2)}`}
                          highlight
                        />
                      )}
                    </div>

                    {/* Affiliate buy buttons */}
                    {item.selectedColour && (
                      <div className="flex flex-wrap gap-2">
                        {item.selectedColour.affiliateLinks.amazon && (
                          <a
                            href={item.selectedColour.affiliateLinks.amazon}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex items-center gap-1.5 bg-[#FF9900] text-black px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#FFB84D] transition-colors"
                          >
                            🛒 Amazon
                          </a>
                        )}
                        {item.selectedColour.affiliateLinks.bq && (
                          <a
                            href={item.selectedColour.affiliateLinks.bq}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex items-center gap-1.5 bg-[#006B3F] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#005530] transition-colors"
                          >
                            🏪 B&Q
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Total */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-foreground font-bold text-lg">
                    <span>Total estimated cost</span>
                    <span>
                      approx. £
                      {quote
                        .reduce((s, i) => s + i.estimatedCost, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on approximate RRP. Actual prices may vary.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer disclosure */}
      <footer className="border-t border-border mt-16 py-6 px-6 text-center">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          PaintBookCo participates in affiliate programmes including Amazon
          Associates and Awin (B&Q, Wickes). We may earn a commission when you
          click through and make a purchase at no extra cost to you. This
          doesn't affect our recommendations. Prices shown are approximate RRP
          and may differ at point of sale.
        </p>
      </footer>
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  step,
  min,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
