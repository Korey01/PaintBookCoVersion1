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

type Tab = "calculator" | "colours" | "visualiser" | "wallpaper" | "quote";

type VisTool = "ai" | "brush" | "eraser" | "lasso" | "polygon";

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

interface Wallpaper {
  id: string;
  name: string;
  brand: string;
  style: "Geometric" | "Floral" | "Stripe" | "Plain" | "Textured" | "Feature" | "Abstract" | "Nature";
  colourFamily: string;
  description: string;
  pricePerRoll: number;
  coverageSqmPerRoll: number;
  patternRepeat?: number;
  imageUrl: string;
  amazonUrl: string;
  bqUrl?: string;
  awinUrl?: string;
  isAffiliate: boolean;
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

// ── Wallpaper data ────────────────────────────────────────────────────────────

const WALLPAPERS: Wallpaper[] = [
  {
    id: "gb-superfresco-paste-white",
    name: "Superfresco Easy White Trellis",
    brand: "Graham & Brown",
    style: "Geometric",
    colourFamily: "White",
    description: "Classic trellis pattern on easy-paste backing. Ideal for living rooms and bedrooms.",
    pricePerRoll: 18,
    coverageSqmPerRoll: 5.5,
    patternRepeat: 26,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=graham+brown+superfresco+trellis+white+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=graham+brown+superfresco+trellis",
    isAffiliate: true,
  },
  {
    id: "gb-superfresco-sage",
    name: "Superfresco Easy Sage Floral",
    brand: "Graham & Brown",
    style: "Floral",
    colourFamily: "Green",
    description: "Delicate floral pattern in calming sage tones. Easy to hang and remove.",
    pricePerRoll: 22,
    coverageSqmPerRoll: 5.5,
    patternRepeat: 53,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=graham+brown+superfresco+sage+floral+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=graham+brown+superfresco+sage+floral",
    isAffiliate: true,
  },
  {
    id: "gb-paste-navy-stripe",
    name: "Navy Stripe Wallpaper",
    brand: "Graham & Brown",
    style: "Stripe",
    colourFamily: "Blue",
    description: "Bold navy and white stripe. Makes a great feature wall in any room.",
    pricePerRoll: 20,
    coverageSqmPerRoll: 5.5,
    patternRepeat: 12,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=graham+brown+navy+stripe+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=graham+brown+navy+stripe",
    isAffiliate: true,
  },
  {
    id: "arthouse-marble-grey",
    name: "Marble Effect Grey Wallpaper",
    brand: "Arthouse",
    style: "Textured",
    colourFamily: "Grey",
    description: "Luxurious marble effect in cool grey tones. Perfect for feature walls.",
    pricePerRoll: 16,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=arthouse+marble+grey+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=arthouse+marble+grey+wallpaper",
    isAffiliate: true,
  },
  {
    id: "arthouse-tropical-green",
    name: "Tropical Leaf Green Wallpaper",
    brand: "Arthouse",
    style: "Nature",
    colourFamily: "Green",
    description: "Bold tropical leaf pattern. Statement feature wall for living rooms.",
    pricePerRoll: 18,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=arthouse+tropical+leaf+green+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=arthouse+tropical+leaf",
    isAffiliate: true,
  },
  {
    id: "arthouse-geometric-gold",
    name: "Geometric Gold Wallpaper",
    brand: "Arthouse",
    style: "Geometric",
    colourFamily: "Yellow",
    description: "Modern geometric pattern with gold metallic accents.",
    pricePerRoll: 20,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=arthouse+geometric+gold+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=arthouse+geometric+gold",
    isAffiliate: true,
  },
  {
    id: "holden-botanical-pink",
    name: "Botanical Pink Wallpaper",
    brand: "Holden Decor",
    style: "Floral",
    colourFamily: "Pink",
    description: "Elegant botanical print in soft pink. Ideal for bedrooms.",
    pricePerRoll: 14,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=holden+decor+botanical+pink+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=holden+botanical+pink",
    isAffiliate: true,
  },
  {
    id: "holden-concrete-grey",
    name: "Concrete Effect Grey Wallpaper",
    brand: "Holden Decor",
    style: "Textured",
    colourFamily: "Grey",
    description: "Industrial concrete effect. Modern and versatile.",
    pricePerRoll: 14,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=holden+concrete+grey+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=holden+concrete+grey",
    isAffiliate: true,
  },
  {
    id: "bq-fine-decor-white-brick",
    name: "White Brick Effect Wallpaper",
    brand: "Fine Décor",
    style: "Textured",
    colourFamily: "White",
    description: "Realistic brick effect in white. Great for kitchen and living areas.",
    pricePerRoll: 12,
    coverageSqmPerRoll: 5.5,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=fine+decor+white+brick+effect+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=fine+decor+white+brick+wallpaper",
    isAffiliate: true,
  },
  {
    id: "bq-fine-decor-geo-teal",
    name: "Geometric Teal Wallpaper",
    brand: "Fine Décor",
    style: "Geometric",
    colourFamily: "Blue",
    description: "Contemporary geometric pattern in teal. Statement feature wall.",
    pricePerRoll: 14,
    coverageSqmPerRoll: 5.5,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=fine+decor+geometric+teal+wallpaper&tag=paintbookco-21",
    bqUrl: "https://www.diy.com/search?term=fine+decor+geometric+teal",
    isAffiliate: true,
  },
  {
    id: "amazon-floral-mural-blue",
    name: "Blue Floral Mural Wallpaper",
    brand: "Various",
    style: "Feature",
    colourFamily: "Blue",
    description: "Full wall floral mural in blue tones. Creates a dramatic focal point.",
    pricePerRoll: 28,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=blue+floral+mural+wallpaper+feature+wall&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-abstract-terracotta",
    name: "Abstract Terracotta Wallpaper",
    brand: "Various",
    style: "Abstract",
    colourFamily: "Orange",
    description: "Warm terracotta abstract pattern. On-trend earth tones.",
    pricePerRoll: 22,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=abstract+terracotta+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-grasscloth-natural",
    name: "Natural Grasscloth Effect Wallpaper",
    brand: "Various",
    style: "Textured",
    colourFamily: "Beige",
    description: "Textured grasscloth effect in natural tones. Adds warmth and texture.",
    pricePerRoll: 24,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=grasscloth+effect+natural+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-dark-floral-green",
    name: "Dark Floral Green Wallpaper",
    brand: "Various",
    style: "Floral",
    colourFamily: "Green",
    description: "Moody dark botanical print. Striking bedroom feature wall.",
    pricePerRoll: 26,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=dark+floral+green+botanical+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-herringbone-grey",
    name: "Grey Herringbone Wallpaper",
    brand: "Various",
    style: "Geometric",
    colourFamily: "Grey",
    description: "Classic herringbone pattern in mid grey. Timeless and versatile.",
    pricePerRoll: 18,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=grey+herringbone+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-blush-stripe",
    name: "Blush Pink Stripe Wallpaper",
    brand: "Various",
    style: "Stripe",
    colourFamily: "Pink",
    description: "Soft blush and cream stripe. Elegant and versatile.",
    pricePerRoll: 16,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=blush+pink+stripe+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-navy-floral",
    name: "Navy Floral Wallpaper",
    brand: "Various",
    style: "Floral",
    colourFamily: "Blue",
    description: "Classic navy floral print. Perfect for traditional and modern rooms.",
    pricePerRoll: 20,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=navy+floral+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-white-woodchip",
    name: "White Woodchip Wallpaper",
    brand: "Various",
    style: "Textured",
    colourFamily: "White",
    description: "Classic white woodchip. Easy to paint over in any colour.",
    pricePerRoll: 8,
    coverageSqmPerRoll: 6.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=white+woodchip+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-mustard-geometric",
    name: "Mustard Yellow Geometric Wallpaper",
    brand: "Various",
    style: "Geometric",
    colourFamily: "Yellow",
    description: "Bold mustard geometric. Makes a vibrant feature wall.",
    pricePerRoll: 18,
    coverageSqmPerRoll: 5.0,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=mustard+yellow+geometric+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
  {
    id: "amazon-silver-plain",
    name: "Plain Silver Wallpaper",
    brand: "Various",
    style: "Plain",
    colourFamily: "Grey",
    description: "Subtle silver sheen plain wallpaper. Elegant and understated.",
    pricePerRoll: 14,
    coverageSqmPerRoll: 5.5,
    imageUrl: "",
    amazonUrl: "https://www.amazon.co.uk/s?k=plain+silver+wallpaper&tag=paintbookco-21",
    isAffiliate: true,
  },
];

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

// ── Canvas helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Full-image colour overlay — used as fallback when no mask is available */
function applyFullOverlay(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  hex: string,
  opacity: number
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  const [r, g, b] = hexToRgb(hex);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/** Mask-guided colour blend — applies colour only to bright (wall) pixels */
function applyMaskedOverlay(
  canvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  img: HTMLImageElement,
  maskImg: HTMLImageElement,
  hex: string,
  opacity: number
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext("2d")!;
  maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

  const [r, g, b] = hexToRgb(hex);
  const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Load exclusion mask if available
  const exclusionImg = (window as any).__paintbookExclusionMask as HTMLImageElement | undefined;
  let exclusionData: ImageData | null = null;
  if (exclusionImg && exclusionImg.complete && exclusionImg.naturalWidth > 0) {
    const excCanvas = document.createElement("canvas");
    excCanvas.width = canvas.width;
    excCanvas.height = canvas.height;
    const excCtx = excCanvas.getContext("2d")!;
    excCtx.drawImage(exclusionImg, 0, 0, canvas.width, canvas.height);
    exclusionData = excCtx.getImageData(0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i < maskData.data.length; i += 4) {
    const brightness = (maskData.data[i] + maskData.data[i + 1] + maskData.data[i + 2]) / 3;
    if (brightness > 150) {
      // Check if this pixel is in the exclusion zone (detected as non-wall object)
      if (exclusionData) {
        const excBrightness = (exclusionData.data[i] + exclusionData.data[i + 1] + exclusionData.data[i + 2]) / 3;
        if (excBrightness > 100) continue; // Skip — window/door/furniture etc
      }
      // Wall pixel — blend paint colour
      imgData.data[i] = Math.round(imgData.data[i] * (1 - opacity) + r * opacity);
      imgData.data[i + 1] = Math.round(imgData.data[i + 1] * (1 - opacity) + g * opacity);
      imgData.data[i + 2] = Math.round(imgData.data[i + 2] * (1 - opacity) + b * opacity);
    }
  }

  ctx.putImageData(imgData, 0, 0);
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

  // Visualiser state — AI-powered wall segmentation
  const [visUploadedDataUrl, setVisUploadedDataUrl] = useState<string | null>(null);
  const [visImageType, setVisImageType] = useState("image/jpeg");
  const [visOriginalImg, setVisOriginalImg] = useState<HTMLImageElement | null>(null);
  const [visMaskUrl, setVisMaskUrl] = useState<string | null>(null);
  const [visMaskImg, setVisMaskImg] = useState<HTMLImageElement | null>(null);
  const [visIsSegmenting, setVisIsSegmenting] = useState(false);
  const [visSegmentError, setVisSegmentError] = useState("");
  const [visColourHex, setVisColourHex] = useState("#FFFFFF");
  const [visColourName, setVisColourName] = useState("Select a colour");
  const [visOpacity, setVisOpacity] = useState(0.8);
  const [visBrandFilter, setVisBrandFilter] = useState("All");
  const [visSearch, setVisSearch] = useState("");

  // Visualiser masking tools
  const [visTool, setVisTool] = useState<VisTool>("ai");
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Wallpaper filter state
  const [wpStyleFilter, setWpStyleFilter] = useState("all");
  const [wpColourFilter, setWpColourFilter] = useState("all");
  const [wpSearch, setWpSearch] = useState("");

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

  // ── Canvas drawing helpers ──────────────────────────────────────────────────

  function getCanvasPoint(canvas: HTMLCanvasElement, e: React.MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function syncOverlaySize() {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;
    if (overlayCanvas.width !== canvas.width || overlayCanvas.height !== canvas.height) {
      // Save existing overlay content
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = overlayCanvas.width;
      tempCanvas.height = overlayCanvas.height;
      tempCanvas.getContext("2d")!.drawImage(overlayCanvas, 0, 0);
      overlayCanvas.width = canvas.width;
      overlayCanvas.height = canvas.height;
      overlayCanvas.getContext("2d")!.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }
  }

  function redrawMainCanvas() {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !visOriginalImg) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = visOriginalImg.naturalWidth;
    canvas.height = visOriginalImg.naturalHeight;

    // Sync overlay canvas size
    if (overlayCanvas) {
      overlayCanvas.width = canvas.width;
      overlayCanvas.height = canvas.height;
    }

    ctx.drawImage(visOriginalImg, 0, 0);

    if (!visColourHex || visColourHex === "#FFFFFF") return;

    const r = parseInt(visColourHex.slice(1, 3), 16);
    const g = parseInt(visColourHex.slice(3, 5), 16);
    const b = parseInt(visColourHex.slice(5, 7), 16);

    // Get manual mask from overlay canvas
    let manualMaskData: ImageData | null = null;
    if (overlayCanvas && visTool !== "ai") {
      const overlayCtx = overlayCanvas.getContext("2d")!;
      manualMaskData = overlayCtx.getImageData(0, 0, canvas.width, canvas.height);
    }

    if (visTool === "ai" && visMaskImg) {
      // Use AI mask with exclusion
      applyMaskedOverlay(canvas, maskCanvasRef.current!, visOriginalImg, visMaskImg, visColourHex, visOpacity);
    } else if (manualMaskData) {
      // Use manual mask
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < manualMaskData.data.length; i += 4) {
        const brightness =
          (manualMaskData.data[i] + manualMaskData.data[i + 1] + manualMaskData.data[i + 2]) / 3;
        if (brightness > 50) {
          imgData.data[i] = Math.round(imgData.data[i] * (1 - visOpacity) + r * visOpacity);
          imgData.data[i + 1] = Math.round(imgData.data[i + 1] * (1 - visOpacity) + g * visOpacity);
          imgData.data[i + 2] = Math.round(imgData.data[i + 2] * (1 - visOpacity) + b * visOpacity);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      // Full overlay fallback
      applyFullOverlay(canvas, visOriginalImg, visColourHex, visOpacity);
    }
  }

  function handleOverlayMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (visTool !== "brush" && visTool !== "eraser") return;
    setIsDrawing(true);
    syncOverlaySize();
    const canvas = overlayCanvasRef.current!;
    console.log("Brush mousedown - canvas size:", canvas.width, "x", canvas.height, "visTool:", visTool);
    const ctx = canvas.getContext("2d")!;
    const pt = getCanvasPoint(canvas, e);
    console.log("Point:", pt.x, pt.y, "brushSize:", brushSize);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = visTool === "eraser" ? "black" : "white";
    ctx.fill();
    redrawMainCanvas();
  }

  function handleOverlayMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || (visTool !== "brush" && visTool !== "eraser")) return;
    const canvas = overlayCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pt = getCanvasPoint(canvas, e);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = visTool === "eraser" ? "black" : "white";
    ctx.fill();
    redrawMainCanvas();
  }

  function handleOverlayMouseUp() {
    setIsDrawing(false);
  }

  function handlePolygonClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = overlayCanvasRef.current!;
    const pt = getCanvasPoint(canvas, e);
    const newPoints = [...polygonPoints, pt];
    setPolygonPoints(newPoints);
    // Draw polygon preview
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(newPoints[0].x, newPoints[0].y);
      newPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    newPoints.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    });
  }

  function closePolygon() {
    if (polygonPoints.length < 3) return;
    const canvas = overlayCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    polygonPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
    setPolygonPoints([]);
    redrawMainCanvas();
  }

  function clearManualMask() {
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    redrawMainCanvas();
  }

  // ── Visualiser canvas redraw effect ─────────────────────────────────────────

  useEffect(() => {
    redrawMainCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visOriginalImg, visColourHex, visOpacity, visMaskImg, visTool]);

  // Sync overlay canvas dimensions when image loads
  useEffect(() => {
    if (!visOriginalImg || !overlayCanvasRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    // Set canvas dimensions first
    canvas.width = visOriginalImg.naturalWidth;
    canvas.height = visOriginalImg.naturalHeight;
    // Match overlay to canvas
    overlay.width = visOriginalImg.naturalWidth;
    overlay.height = visOriginalImg.naturalHeight;
    console.log("Overlay sized:", overlay.width, "x", overlay.height);
  }, [visOriginalImg]);

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setVisSegmentError("Image must be under 5MB");
      return;
    }

    setVisSegmentError("");
    setVisMaskUrl(null);
    setVisMaskImg(null);
    setVisImageType(file.type);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setVisUploadedDataUrl(dataUrl);

      // Load image element so canvas can draw it
      const img = new Image();
      img.onload = () => setVisOriginalImg(img);
      img.src = dataUrl;

      // Trigger AI wall segmentation
      await segmentWalls(base64, file.type);
    };
    reader.readAsDataURL(file);
  }

  async function segmentWalls(base64: string, imageType: string) {
    setVisIsSegmenting(true);
    setVisSegmentError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/segment-walls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ image_base64: base64, image_type: imageType }),
        }
      );

      const data = await res.json();
      console.log("Segment-walls response:", JSON.stringify(data).substring(0, 200));

      if (data.error === "segmentation_unavailable" || data.error) {
        setVisSegmentError(
          "Wall detection unavailable. Applying colour to the full image instead."
        );
        return;
      }

      // Handle both HuggingFace format (wall_masks array) and Replicate format (output string)
      let maskUrl: string | null = null;
      let exclusionUrl: string | null = null;

      if (data.wall_masks && data.wall_masks.length > 0) {
        // HuggingFace SegFormer format — masks are base64 PNG strings
        maskUrl = data.wall_masks[0].startsWith("data:")
          ? data.wall_masks[0]
          : `data:image/png;base64,${data.wall_masks[0]}`;

        // Combine excluded masks into one
        if (data.excluded_masks && data.excluded_masks.length > 0) {
          exclusionUrl = data.excluded_masks[0].startsWith("data:")
            ? data.excluded_masks[0]
            : `data:image/png;base64,${data.excluded_masks[0]}`;
        }
      } else if (data.output) {
        // Replicate SAM2 format
        maskUrl = Array.isArray(data.output) ? data.output[0] : data.output;
        exclusionUrl = data.exclusion_mask || null;
      }

      if (maskUrl) {
        setVisMaskUrl(maskUrl);
        const maskImg = new Image();
        maskImg.onload = () => {
          console.log("Wall mask loaded:", maskImg.width, "x", maskImg.height);
          setVisMaskImg(maskImg);
          setVisSegmentError("✓ Walls detected — colour applied to walls only");
        };
        maskImg.onerror = () =>
          setVisSegmentError("Mask loaded but could not render. Using full overlay.");
        maskImg.src = maskUrl;

        if (exclusionUrl) {
          const excImg = new Image();
          excImg.onload = () => {
            console.log("Exclusion mask loaded");
            (window as any).__paintbookExclusionMask = excImg;
          };
          excImg.src = exclusionUrl;
        }
      } else {
        setVisSegmentError(
          "Wall detection returned no mask. Applying colour to the full image."
        );
      }
    } catch {
      setVisSegmentError(
        "Wall detection unavailable. Applying colour to the full image instead."
      );
    } finally {
      setVisIsSegmenting(false);
    }
  }

  function handleVisDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "room-preview.png";
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
              { id: "wallpaper", label: "🏠 Wallpaper" },
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
                        setVisColourHex(detailProduct.hex);
                        setVisColourName(`${detailProduct.brand} — ${detailProduct.name}`);
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
            <h2 className="text-xl font-bold text-foreground mb-2">
              Wall Colour Visualiser
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a room photo — AI detects your walls and previews any colour on them.
            </p>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: canvas area */}
              <div className="flex-1 min-w-0">
                {/* Hidden mask canvas used for pixel-level blending */}
                <canvas ref={maskCanvasRef} className="hidden" />

                {!visUploadedDataUrl ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary transition-colors">
                    <span className="text-4xl mb-3">📷</span>
                    <p className="text-foreground font-medium mb-1">
                      Upload a room photo
                    </p>
                    <p className="text-muted-foreground text-sm">
                      JPG or PNG, max 5 MB
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
                    {/* Tool toolbar */}
                    <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-background flex-wrap">
                      {/* Tool selector */}
                      <div className="flex gap-1">
                        {[
                          { id: "ai", icon: "🤖", label: "AI Auto" },
                          { id: "brush", icon: "🖌️", label: "Brush" },
                          { id: "eraser", icon: "⬜", label: "Eraser" },
                          { id: "lasso", icon: "🔲", label: "Lasso" },
                          { id: "polygon", icon: "⬡", label: "Polygon" },
                        ].map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => setVisTool(tool.id as VisTool)}
                            title={tool.label}
                            className={`px-2 py-1.5 rounded text-sm transition-colors ${
                              visTool === tool.id
                                ? "bg-foreground text-background"
                                : "border border-border hover:bg-accent"
                            }`}
                          >
                            {tool.icon} {tool.label}
                          </button>
                        ))}
                      </div>

                      {/* Brush size (only show for brush/eraser) */}
                      {(visTool === "brush" || visTool === "eraser") && (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">Size:</span>
                          <input
                            type="range"
                            min="5"
                            max="80"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-xs">{brushSize}px</span>
                        </div>
                      )}

                      {/* Clear manual mask */}
                      {visTool !== "ai" && (
                        <button
                          onClick={clearManualMask}
                          className="ml-auto text-xs border border-border px-2 py-1.5 rounded hover:bg-accent"
                        >
                          Clear mask
                        </button>
                      )}

                      {/* Polygon close button */}
                      {visTool === "polygon" && polygonPoints.length > 2 && (
                        <button
                          onClick={closePolygon}
                          className="text-xs bg-foreground text-background px-2 py-1.5 rounded"
                        >
                          Close polygon
                        </button>
                      )}
                    </div>

                    {/* Canvas with overlay */}
                    <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
                      {visIsSegmenting && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3" />
                          <p className="text-white text-sm font-medium">Analysing room with AI...</p>
                          <p className="text-white/70 text-xs mt-1">
                            This may take 15–30 seconds on first use
                          </p>
                        </div>
                      )}
                      <canvas
                        ref={canvasRef}
                        className="w-full block"
                        style={{ maxHeight: "500px", objectFit: "contain" }}
                      />
                      {/* Overlay canvas for manual drawing */}
                      <canvas
                        ref={overlayCanvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{
                          cursor:
                            visTool === "eraser"
                              ? "cell"
                              : visTool === "ai"
                              ? "default"
                              : "crosshair",
                          opacity: 0.6,
                          pointerEvents: visTool === "ai" ? "none" : "auto",
                        }}
                        onMouseDown={handleOverlayMouseDown}
                        onMouseMove={handleOverlayMouseMove}
                        onMouseUp={handleOverlayMouseUp}
                        onMouseLeave={handleOverlayMouseUp}
                        onClick={visTool === "polygon" ? handlePolygonClick : undefined}
                        onDoubleClick={visTool === "polygon" ? closePolygon : undefined}
                      />
                    </div>

                    {/* Segmentation status messages */}
                    {visSegmentError && (
                      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        {visSegmentError}
                      </p>
                    )}
                    {visMaskUrl && !visSegmentError && (
                      <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        ✓ Walls detected — colour is applied to wall pixels only.
                      </p>
                    )}

                    {/* Selected colour badge */}
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <div
                        className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                        style={{
                          backgroundColor:
                            visColourHex === "#FFFFFF" ? "#e5e7eb" : visColourHex,
                        }}
                      />
                      <span className="text-muted-foreground">{visColourName}</span>
                    </div>

                    {/* Opacity slider */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Colour intensity: {Math.round(visOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={0.85}
                        step={0.05}
                        value={visOpacity}
                        onChange={(e) => setVisOpacity(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleVisDownload}
                        disabled={visColourHex === "#FFFFFF"}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
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

              {/* Right: compact colour picker */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <p className="text-sm font-medium text-foreground mb-3">
                  Select a colour to preview
                </p>

                {/* Brand filter pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setVisBrandFilter(b)}
                      className={[
                        "text-xs px-2.5 py-1 rounded-full border transition-colors",
                        visBrandFilter === b
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50",
                      ].join(" ")}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search colours…"
                  value={visSearch}
                  onChange={(e) => setVisSearch(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />

                {/* Swatch grid */}
                <div className="grid grid-cols-5 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {products
                    .filter(
                      (p) =>
                        (visBrandFilter === "All" || p.brand === visBrandFilter) &&
                        (visSearch === "" ||
                          p.name.toLowerCase().includes(visSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(visSearch.toLowerCase()))
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        title={`${p.brand} — ${p.name}`}
                        onClick={() => {
                          setVisColourHex(p.hex);
                          setVisColourName(`${p.brand} — ${p.name}`);
                        }}
                        className={[
                          "w-10 h-10 rounded-full border-2 transition-all mx-auto block",
                          visColourHex === p.hex
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

        {/* ── WALLPAPER TAB ────────────────────────────────────────────────── */}
        {tab === "wallpaper" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Wallpaper Finder</h2>
              <p className="text-sm text-muted-foreground">
                Browse wallpaper styles and buy directly from trusted retailers.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                * Affiliate links — PaintBookCo may earn a small commission at no extra cost to you.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={wpStyleFilter}
                onChange={(e) => setWpStyleFilter(e.target.value)}
                className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="all">All Styles</option>
                {["Geometric", "Floral", "Stripe", "Plain", "Textured", "Feature", "Abstract", "Nature"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
              <select
                value={wpColourFilter}
                onChange={(e) => setWpColourFilter(e.target.value)}
                className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="all">All Colours</option>
                {["White", "Grey", "Blue", "Green", "Pink", "Yellow", "Orange", "Beige", "Brown"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
              <input
                type="text"
                placeholder="Search wallpapers..."
                value={wpSearch}
                onChange={(e) => setWpSearch(e.target.value)}
                className="border border-border bg-background text-sm rounded-md px-3 py-2 flex-1 min-w-[180px] focus:outline-none"
              />
            </div>

            {/* Wallpaper grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WALLPAPERS.filter(
                (w) => wpStyleFilter === "all" || w.style === wpStyleFilter
              )
                .filter(
                  (w) => wpColourFilter === "all" || w.colourFamily === wpColourFilter
                )
                .filter(
                  (w) =>
                    !wpSearch ||
                    w.name.toLowerCase().includes(wpSearch.toLowerCase()) ||
                    w.brand.toLowerCase().includes(wpSearch.toLowerCase())
                )
                .map((wallpaper) => (
                  <div
                    key={wallpaper.id}
                    className="border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-colors"
                  >
                    {/* Pattern preview */}
                    <div
                      className="h-32 flex items-center justify-center text-4xl"
                      style={{
                        background:
                          wallpaper.style === "Stripe"
                            ? "repeating-linear-gradient(90deg, #f0f0f0 0px, #f0f0f0 20px, #e0e0e0 20px, #e0e0e0 40px)"
                            : wallpaper.style === "Geometric"
                            ? "repeating-linear-gradient(45deg, #f0f0f0 0px, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px)"
                            : wallpaper.style === "Textured"
                            ? `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23999' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
                            : "#f5f5f5",
                      }}
                    >
                      {wallpaper.style === "Floral"
                        ? "🌸"
                        : wallpaper.style === "Nature"
                        ? "🌿"
                        : wallpaper.style === "Feature"
                        ? "🎨"
                        : "🏠"}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-medium text-sm">{wallpaper.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {wallpaper.brand} · {wallpaper.style}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {wallpaper.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>~£{wallpaper.pricePerRoll}/roll</span>
                        <span>{wallpaper.coverageSqmPerRoll}m² per roll</span>
                        {wallpaper.patternRepeat && (
                          <span>{wallpaper.patternRepeat}cm repeat</span>
                        )}
                      </div>

                      {/* Buy buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={wallpaper.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-1.5 bg-[#FF9900] text-black px-3 py-2 rounded text-xs font-medium hover:bg-[#FFB84D] transition-colors flex-1 justify-center"
                        >
                          🛒 Amazon
                        </a>
                        {wallpaper.bqUrl && (
                          <a
                            href={wallpaper.bqUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex items-center gap-1.5 bg-[#006B3F] text-white px-3 py-2 rounded text-xs font-medium hover:bg-[#005530] transition-colors flex-1 justify-center"
                          >
                            🏪 B&Q
                          </a>
                        )}
                      </div>

                      {wallpaper.isAffiliate && (
                        <p className="text-xs text-muted-foreground/60">Affiliate link</p>
                      )}
                    </div>
                  </div>
                ))}
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
