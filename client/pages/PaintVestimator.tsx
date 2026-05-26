import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { makeAwinLink, AFFILIATE_CONFIG } from "@/config/affiliates";
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

interface PaintLayer {
  id: string
  label: string
  tool: "ai" | "brush" | "lasso" | "polygon"
  type: "paint" | "wallpaper"
  colour: string
  wallpaperPattern?: string   // SVG data URL for wallpaper tiling
  wallpaperScale?: number     // tile px size (default 60)
  opacity: number
  maskDataUrl: string | null
  visible: boolean
}

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

// ── Wallpaper S3 pattern image URLs ───────────────────────────────────────────

const S3_BASE = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/wallpaper-patterns/";
const S3_FALLBACK = `${S3_BASE}textured-woodchip.png`;

const WALLPAPER_PATTERN_URLS: Record<string, string> = {
  "gb-superfresco-paste-white":  `${S3_BASE}geometric-white-trellis.png`,
  "gb-superfresco-sage":         `${S3_BASE}floral-sage.png`,
  "gb-paste-navy-stripe":        `${S3_BASE}stripe-navy.png`,
  "arthouse-marble-grey":        `${S3_BASE}textured-marble-grey.png`,
  "arthouse-tropical-green":     `${S3_BASE}nature-tropical.png`,
  "arthouse-geometric-gold":     `${S3_BASE}geometric-gold.png`,
  "holden-botanical-pink":       `${S3_BASE}floral-pink.png`,
  "holden-concrete-grey":        `${S3_BASE}textured-concrete.png`,
  "bq-fine-decor-white-brick":   `${S3_BASE}textured-white-brick.png`,
  "bq-fine-decor-geo-teal":      `${S3_BASE}geometric-teal.png`,
  "amazon-floral-mural-blue":    `${S3_BASE}feature-blue-floral.png`,
  "amazon-abstract-terracotta":  `${S3_BASE}abstract-terracotta.png`,
  "amazon-grasscloth-natural":   `${S3_BASE}textured-grasscloth.png`,
  "amazon-dark-floral-green":    `${S3_BASE}floral-dark-green.png`,
  "amazon-herringbone-grey":     `${S3_BASE}geometric-herringbone.png`,
  "amazon-blush-stripe":         `${S3_BASE}stripe-blush.png`,
  "amazon-navy-floral":          `${S3_BASE}floral-navy.png`,
  "amazon-white-woodchip":       `${S3_BASE}textured-woodchip.png`,
  "amazon-mustard-geometric":    `${S3_BASE}geometric-mustard.png`,
  "amazon-silver-plain":         `${S3_BASE}plain-silver.png`,
};

function getPatternUrl(id: string): string {
  return WALLPAPER_PATTERN_URLS[id] ?? S3_FALLBACK;
}

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

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

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

/** Tile a wallpaper pattern onto masked wall pixels (sync — patternImg already loaded). */
function applyWallpaperLayerSync(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  maskImg: HTMLImageElement,
  patternImg: HTMLImageElement,
  scale: number,
  opacity: number,
  mode: "ai" | "manual"
) {
  // Render mask
  const maskOff = document.createElement("canvas");
  maskOff.width = canvas.width;
  maskOff.height = canvas.height;
  const maskCtx = maskOff.getContext("2d")!;
  maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
  const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

  // Exclusion mask for AI mode
  let exclusionData: ImageData | null = null;
  if (mode === "ai") {
    const excImg = (window as any).__paintbookExclusionMask as HTMLImageElement | undefined;
    if (excImg && excImg.complete && excImg.naturalWidth > 0) {
      const excOff = document.createElement("canvas");
      excOff.width = canvas.width;
      excOff.height = canvas.height;
      const excCtx = excOff.getContext("2d")!;
      excCtx.drawImage(excImg, 0, 0, canvas.width, canvas.height);
      exclusionData = excCtx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  // Tile pattern across full canvas
  const tileOff = document.createElement("canvas");
  tileOff.width = canvas.width;
  tileOff.height = canvas.height;
  const tileCtx = tileOff.getContext("2d")!;
  const tileCell = document.createElement("canvas");
  tileCell.width = scale;
  tileCell.height = scale;
  tileCell.getContext("2d")!.drawImage(patternImg, 0, 0, scale, scale);
  const pattern = tileCtx.createPattern(tileCell, "repeat")!;
  tileCtx.fillStyle = pattern;
  tileCtx.fillRect(0, 0, canvas.width, canvas.height);
  const patternData = tileCtx.getImageData(0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < maskData.data.length; i += 4) {
    let paint = false;
    if (mode === "ai") {
      const bri = (maskData.data[i] + maskData.data[i + 1] + maskData.data[i + 2]) / 3;
      paint = bri > 150;
      if (paint && exclusionData) {
        const excBri = (exclusionData.data[i] + exclusionData.data[i + 1] + exclusionData.data[i + 2]) / 3;
        if (excBri > 100) paint = false;
      }
    } else {
      paint = maskData.data[i + 3] > 10;
    }
    if (paint) {
      imgData.data[i]     = Math.round(imgData.data[i]     * (1 - opacity) + patternData.data[i]     * opacity);
      imgData.data[i + 1] = Math.round(imgData.data[i + 1] * (1 - opacity) + patternData.data[i + 1] * opacity);
      imgData.data[i + 2] = Math.round(imgData.data[i + 2] * (1 - opacity) + patternData.data[i + 2] * opacity);
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/** Apply a committed PaintLayer onto the canvas ctx (already shows base image) */
function applyLayerToCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  maskImg: HTMLImageElement,
  colour: string,
  opacity: number,
  mode: "ai" | "manual"
) {
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height;
  const offCtx = off.getContext("2d")!;
  offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
  const maskData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const [r, g, b] = hexToRgb(colour);

  let exclusionData: ImageData | null = null;
  if (mode === "ai") {
    const excImg = (window as any).__paintbookExclusionMask as HTMLImageElement | undefined;
    if (excImg && excImg.complete && excImg.naturalWidth > 0) {
      const excOff = document.createElement("canvas");
      excOff.width = canvas.width;
      excOff.height = canvas.height;
      const excCtx = excOff.getContext("2d")!;
      excCtx.drawImage(excImg, 0, 0, canvas.width, canvas.height);
      exclusionData = excCtx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  for (let i = 0; i < maskData.data.length; i += 4) {
    let paint = false;
    if (mode === "ai") {
      const brightness = (maskData.data[i] + maskData.data[i + 1] + maskData.data[i + 2]) / 3;
      paint = brightness > 150;
      if (paint && exclusionData) {
        const excBri = (exclusionData.data[i] + exclusionData.data[i + 1] + exclusionData.data[i + 2]) / 3;
        if (excBri > 100) paint = false;
      }
    } else {
      paint = maskData.data[i + 3] > 10;
    }
    if (paint) {
      imgData.data[i]     = Math.round(imgData.data[i]     * (1 - opacity) + r * opacity);
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
  const [paintLayers, setPaintLayers] = useState<PaintLayer[]>([]);
  const [activeLayerColour, setActiveLayerColour] = useState("#4A90E2");
  const [activeLayerOpacity, setActiveLayerOpacity] = useState(0.8);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [visColourName, setVisColourName] = useState("Select a colour");
  const [visBrandFilter, setVisBrandFilter] = useState("All");
  const [visSearch, setVisSearch] = useState("");
  const [visMode, setVisMode] = useState<"paint" | "wallpaper">("paint");
  const [selectedWallpaper, setSelectedWallpaper] = useState<typeof WALLPAPERS[0] | null>(null);
  const [wallpaperScale, setWallpaperScale] = useState(60);

  // Visualiser masking tools
  const [visTool, setVisTool] = useState<VisTool>("ai");
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushCountRef = useRef(0);
  const lassoCountRef = useRef(0);
  const polygonCountRef = useRef(0);
  const layerMaskImgsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const paintLayersRef = useRef<PaintLayer[]>([]);
  const activeLayerIdRef = useRef<string | null>(null);
  const activeLayerColourRef = useRef("#4A90E2");
  const activeLayerOpacityRef = useRef(0.8);
  const visModeRef = useRef<"paint" | "wallpaper">("paint");
  const selectedWallpaperRef = useRef<typeof WALLPAPERS[0] | null>(null);
  const wallpaperScaleRef = useRef(60);
  const wallpaperPatternImgsRef = useRef<Map<string, HTMLImageElement>>(new Map());

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

    // Preserve overlay content across canvas resize
    let savedOverlayData: ImageData | null = null;
    if (overlayCanvas && overlayCanvas.width > 0 && overlayCanvas.height > 0) {
      savedOverlayData = overlayCanvas.getContext("2d")!.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    canvas.width = visOriginalImg.naturalWidth;
    canvas.height = visOriginalImg.naturalHeight;

    if (overlayCanvas) {
      overlayCanvas.width = canvas.width;
      overlayCanvas.height = canvas.height;
      if (savedOverlayData) {
        overlayCanvas.getContext("2d")!.putImageData(savedOverlayData, 0, 0);
      }
    }

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(visOriginalImg, 0, 0);

    // Composite all committed layers in order
    const layers = paintLayersRef.current;
    let pendingLoad = false;
    for (const layer of layers) {
      if (!layer.visible || !layer.maskDataUrl) continue;

      // Ensure mask image is loaded
      let maskImg = layerMaskImgsRef.current.get(layer.id);
      if (!maskImg) {
        maskImg = new Image();
        const capturedId = layer.id;
        const capturedUrl = layer.maskDataUrl;
        maskImg.onload = () => {
          layerMaskImgsRef.current.set(capturedId, maskImg!);
          redrawMainCanvas();
        };
        maskImg.src = capturedUrl;
        pendingLoad = true;
        continue;
      }

      const maskMode = layer.tool === "ai" ? "ai" : "manual";

      if (layer.type === "wallpaper" && layer.wallpaperPattern) {
        // Ensure pattern image is loaded
        const patternKey = layer.id + "_pattern";
        let patternImg = wallpaperPatternImgsRef.current.get(patternKey);
        if (!patternImg) {
          patternImg = new Image();
          patternImg.crossOrigin = "anonymous";
          const captured = { key: patternKey, url: layer.wallpaperPattern };
          patternImg.onload = () => {
            wallpaperPatternImgsRef.current.set(captured.key, patternImg!);
            redrawMainCanvas();
          };
          patternImg.src = layer.wallpaperPattern;
          pendingLoad = true;
          continue;
        }
        applyWallpaperLayerSync(ctx, canvas, maskImg, patternImg, layer.wallpaperScale ?? 60, layer.opacity, maskMode);
      } else {
        applyLayerToCanvas(ctx, canvas, maskImg, layer.colour, layer.opacity, maskMode);
      }
    }
    if (pendingLoad) return;

    // Live preview: apply current in-progress overlay stroke
    if (overlayCanvas && overlayCanvas.width > 0) {
      const overlayCtx = overlayCanvas.getContext("2d")!;
      const overlayData = overlayCtx.getImageData(0, 0, canvas.width, canvas.height);
      const hasStrokes = overlayData.data.some((v, i) => i % 4 === 3 && v > 10);
      if (hasStrokes) {
        const opacity = activeLayerOpacityRef.current;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const mode = visModeRef.current;
        const wp = selectedWallpaperRef.current;
        const scale = wallpaperScaleRef.current;

        if (mode === "wallpaper" && wp) {
          // Tile wallpaper pattern for live preview
          const patternKey = `preview_${wp.id}`;
          const patternImg = wallpaperPatternImgsRef.current.get(patternKey);
          if (patternImg) {
            const tileOff = document.createElement("canvas");
            tileOff.width = canvas.width;
            tileOff.height = canvas.height;
            const tileCtx = tileOff.getContext("2d")!;
            const tileCell = document.createElement("canvas");
            tileCell.width = scale;
            tileCell.height = scale;
            tileCell.getContext("2d")!.drawImage(patternImg, 0, 0, scale, scale);
            const pat = tileCtx.createPattern(tileCell, "repeat")!;
            tileCtx.fillStyle = pat;
            tileCtx.fillRect(0, 0, canvas.width, canvas.height);
            const patData = tileCtx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < overlayData.data.length; i += 4) {
              if (overlayData.data[i + 3] > 10) {
                imgData.data[i]     = Math.round(imgData.data[i]     * (1 - opacity) + patData.data[i]     * opacity);
                imgData.data[i + 1] = Math.round(imgData.data[i + 1] * (1 - opacity) + patData.data[i + 1] * opacity);
                imgData.data[i + 2] = Math.round(imgData.data[i + 2] * (1 - opacity) + patData.data[i + 2] * opacity);
              }
            }
          } else {
            // Pattern not yet loaded — trigger load then redraw
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => { wallpaperPatternImgsRef.current.set(patternKey, img); redrawMainCanvas(); };
            img.src = getPatternUrl(wp.id);
          }
        } else {
          const colour = activeLayerColourRef.current;
          const [r, g, b] = hexToRgb(colour);
          for (let i = 0; i < overlayData.data.length; i += 4) {
            if (overlayData.data[i + 3] > 10) {
              imgData.data[i]     = Math.round(imgData.data[i]     * (1 - opacity) + r * opacity);
              imgData.data[i + 1] = Math.round(imgData.data[i + 1] * (1 - opacity) + g * opacity);
              imgData.data[i + 2] = Math.round(imgData.data[i + 2] * (1 - opacity) + b * opacity);
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }
  }

  function handleOverlayMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    syncOverlaySize();
    const canvas = overlayCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pt = getCanvasPoint(canvas, e);

    if (visTool === "lasso") {
      setIsDrawing(true);
      setLassoPoints([pt]);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (visTool === "eraser") {
      setIsDrawing(true);
      // Load the active layer's mask into the overlay so we can erase from it
      const activeId = activeLayerIdRef.current;
      const activeLayer = paintLayersRef.current.find(l => l.id === activeId);
      if (activeLayer?.maskDataUrl) {
        const draw = (img: HTMLImageElement) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,1)";
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
          redrawMainCanvas();
        };
        const cached = layerMaskImgsRef.current.get(activeLayer.id);
        if (cached) {
          draw(cached);
        } else {
          const img = new Image();
          img.onload = () => { layerMaskImgsRef.current.set(activeLayer.id, img); draw(img); };
          img.src = activeLayer.maskDataUrl;
        }
      }
      return;
    }

    if (visTool !== "brush") return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    redrawMainCanvas();
  }

  function handleOverlayMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = overlayCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pt = getCanvasPoint(canvas, e);

    if (visTool === "lasso") {
      const newPoints = [...lassoPoints, pt];
      setLassoPoints(newPoints);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(newPoints[0].x, newPoints[0].y);
      newPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    if (visTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "white";
    }
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    redrawMainCanvas();
  }

  function commitOverlayAsLayer(tool: "brush" | "lasso" | "polygon") {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    const dataUrl = overlayCanvas.toDataURL("image/png");
    const mode = visModeRef.current;
    const wp = selectedWallpaperRef.current;

    let label: string;
    if (mode === "wallpaper" && wp) {
      polygonCountRef.current += 1; // reuse counter for ordering
      label = `Wallpaper — ${wp.name.split(" ").slice(0, 2).join(" ")} ${paintLayersRef.current.filter(l => l.type === "wallpaper").length + 1}`;
    } else if (tool === "brush") { brushCountRef.current += 1; label = `Brush ${brushCountRef.current}`; }
    else if (tool === "lasso") { lassoCountRef.current += 1; label = `Lasso ${lassoCountRef.current}`; }
    else { polygonCountRef.current += 1; label = `Polygon ${polygonCountRef.current}`; }

    const newLayer: PaintLayer = {
      id: generateId(),
      label,
      tool,
      type: mode,
      colour: activeLayerColourRef.current,
      ...(mode === "wallpaper" && wp
        ? {
            wallpaperPattern: getPatternUrl(wp.id),
            wallpaperScale: wallpaperScaleRef.current,
          }
        : {}),
      opacity: activeLayerOpacityRef.current,
      maskDataUrl: dataUrl,
      visible: true,
    };
    setPaintLayers(prev => { const next = [...prev, newLayer]; paintLayersRef.current = next; return next; });
    setActiveLayerId(newLayer.id);
    activeLayerIdRef.current = newLayer.id;
    overlayCanvas.getContext("2d")!.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }

  function handleOverlayMouseUp() {
    if (!isDrawing) return;
    const canvas = overlayCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    if (visTool === "lasso" && lassoPoints.length > 2) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      lassoPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = "white";
      ctx.fill();
      setLassoPoints([]);
      commitOverlayAsLayer("lasso");
      setIsDrawing(false);
      redrawMainCanvas();
      return;
    }

    if (visTool === "eraser") {
      // Save erased mask back to the active layer
      const activeId = activeLayerIdRef.current;
      if (activeId) {
        const dataUrl = canvas.toDataURL("image/png");
        layerMaskImgsRef.current.delete(activeId);
        setPaintLayers(prev => {
          const next = prev.map(l => l.id === activeId ? { ...l, maskDataUrl: dataUrl } : l);
          paintLayersRef.current = next;
          return next;
        });
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsDrawing(false);
      redrawMainCanvas();
      return;
    }

    if (visTool === "brush") {
      commitOverlayAsLayer("brush");
      setIsDrawing(false);
      redrawMainCanvas();
      return;
    }

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
    commitOverlayAsLayer("polygon");
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

  // ── Keep refs in sync with state ───────────────────────────────────────────

  useEffect(() => { paintLayersRef.current = paintLayers; }, [paintLayers]);
  useEffect(() => { activeLayerIdRef.current = activeLayerId; }, [activeLayerId]);
  useEffect(() => { activeLayerColourRef.current = activeLayerColour; }, [activeLayerColour]);
  useEffect(() => { activeLayerOpacityRef.current = activeLayerOpacity; }, [activeLayerOpacity]);
  useEffect(() => { visModeRef.current = visMode; }, [visMode]);
  useEffect(() => { selectedWallpaperRef.current = selectedWallpaper; }, [selectedWallpaper]);
  useEffect(() => { wallpaperScaleRef.current = wallpaperScale; }, [wallpaperScale]);

  // ── Visualiser canvas redraw effect ─────────────────────────────────────────

  useEffect(() => {
    redrawMainCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visOriginalImg, paintLayers]);

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
    setPaintLayers([]);
    paintLayersRef.current = [];
    setActiveLayerId(null);
    activeLayerIdRef.current = null;
    layerMaskImgsRef.current.clear();
    brushCountRef.current = 0;
    lassoCountRef.current = 0;
    polygonCountRef.current = 0;

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
          // Create or update the AI layer
          layerMaskImgsRef.current.set("ai", maskImg);
          const aiLayer: PaintLayer = {
            id: "ai",
            label: "AI Walls",
            tool: "ai",
            type: "paint",
            colour: activeLayerColourRef.current,
            opacity: activeLayerOpacityRef.current,
            maskDataUrl: maskUrl,
            visible: true,
          };
          setPaintLayers(prev => {
            const without = prev.filter(l => l.id !== "ai");
            const next = [aiLayer, ...without];
            paintLayersRef.current = next;
            return next;
          });
          setActiveLayerId("ai");
          activeLayerIdRef.current = "ai";
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

                      {/* Farrow & Ball — Awin direct link (pending approval) */}
                      {detailProduct.brand === "Farrow & Ball" && (
                        <a
                          href={makeAwinLink(
                            AFFILIATE_CONFIG.awin.merchants.farrowAndBall.id,
                            `https://www.farrow-ball.com/paint-colours/${detailProduct.name.toLowerCase().replace(/ /g, "-")}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#2C2C2C] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#1a1a1a] transition-colors w-full justify-center"
                        >
                          <span>🎨</span> Buy from Farrow &amp; Ball
                        </a>
                      )}

                      {/* Dulux Decorator Centre — Awin link (pending approval) */}
                      {detailProduct.brand === "Dulux" && (
                        <a
                          href={makeAwinLink(
                            AFFILIATE_CONFIG.awin.merchants.duluxDecoratorCentre.id,
                            `https://www.duluxdecoratorcentre.co.uk/search?q=${encodeURIComponent(detailProduct.name)}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#007DC3] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#005a8e] transition-colors w-full justify-center"
                        >
                          <span>🎨</span> Buy from Dulux Decorator Centre
                        </a>
                      )}

                      {/* Wickes via Awin — Crown, Valspar, Little Greene (pending approval) */}
                      {["Crown", "Valspar", "Little Greene"].includes(detailProduct.brand) && (
                        <a
                          href={makeAwinLink(
                            AFFILIATE_CONFIG.awin.merchants.wickes.id,
                            `https://www.wickes.co.uk/search?term=${encodeURIComponent(detailProduct.name + " paint")}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#E31837] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#B01229] transition-colors w-full justify-center"
                        >
                          <span>🏠</span> Buy at Wickes
                        </a>
                      )}

                      {/* Wilko — Awin link (pending approval; merchant ID TBD) */}
                      {AFFILIATE_CONFIG.awin.merchants.wilko.id && (
                        <a
                          href={makeAwinLink(
                            AFFILIATE_CONFIG.awin.merchants.wilko.id,
                            `https://www.wilko.com/search?q=${encodeURIComponent(detailProduct.name + " paint")}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 bg-[#E31837] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#B01229] transition-colors w-full justify-center"
                        >
                          <span>🛒</span> Wilko
                        </a>
                      )}
                    </div>

                    {/* Use in calculator */}
                    <button
                      onClick={() => {
                        setSelectedColour(detailProduct);
                        setActiveLayerColour(detailProduct.hex);
                        activeLayerColourRef.current = detailProduct.hex;
                        setVisColourName(`${detailProduct.brand} — ${detailProduct.name}`);
                        setTab("calculator");
                      }}
                      className="mt-3 w-full py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Use in Calculator
                    </button>

                    <p className="mt-3 text-[10px] text-muted-foreground">
                      Affiliate links — we may earn commission at no extra cost to you
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
                    <div className="relative rounded-xl overflow-hidden border border-border bg-muted" style={{ lineHeight: 0 }}>
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
                        className="absolute top-0 left-0 w-full"
                        style={{
                          height: "100%",
                          display: "block",
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

                    {/* Current colour indicator */}
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <div
                        className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: activeLayerColour }}
                      />
                      <span className="text-muted-foreground">
                        Next stroke: {visColourName !== "Select a colour" ? visColourName : activeLayerColour}
                      </span>
                    </div>

                    {/* Opacity slider */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Colour intensity: {Math.round(activeLayerOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={0.85}
                        step={0.05}
                        value={activeLayerOpacity}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setActiveLayerOpacity(v);
                          activeLayerOpacityRef.current = v;
                          // Update active layer opacity in real time
                          if (activeLayerId) {
                            setPaintLayers(prev => {
                              const next = prev.map(l => l.id === activeLayerId ? { ...l, opacity: v } : l);
                              paintLayersRef.current = next;
                              return next;
                            });
                          }
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Layers panel */}
                    {paintLayers.length > 0 && (
                      <div className="border border-border rounded-lg p-3 space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Layers</p>
                        {[...paintLayers].reverse().map(layer => (
                          <div
                            key={layer.id}
                            onClick={() => {
                              setActiveLayerId(layer.id);
                              activeLayerIdRef.current = layer.id;
                              setActiveLayerColour(layer.colour);
                              activeLayerColourRef.current = layer.colour;
                              setActiveLayerOpacity(layer.opacity);
                              activeLayerOpacityRef.current = layer.opacity;
                            }}
                            className={[
                              "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                              activeLayerId === layer.id
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted border border-transparent",
                            ].join(" ")}
                          >
                            {/* Colour swatch — click to change colour */}
                            <input
                              type="color"
                              value={layer.colour}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const colour = e.target.value;
                                setPaintLayers(prev => {
                                  const next = prev.map(l => l.id === layer.id ? { ...l, colour } : l);
                                  paintLayersRef.current = next;
                                  return next;
                                });
                                if (activeLayerId === layer.id) {
                                  setActiveLayerColour(colour);
                                  activeLayerColourRef.current = colour;
                                }
                              }}
                              className="w-5 h-5 rounded border border-border cursor-pointer flex-shrink-0 p-0"
                              style={{ backgroundColor: layer.colour }}
                              title="Change layer colour"
                            />
                            <span className="text-sm text-foreground flex-1 truncate">{layer.label}</span>
                            {/* Visibility toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaintLayers(prev => {
                                  const next = prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l);
                                  paintLayersRef.current = next;
                                  return next;
                                });
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors w-5 text-center flex-shrink-0"
                              title={layer.visible ? "Hide" : "Show"}
                            >
                              {layer.visible ? "●" : "○"}
                            </button>
                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                layerMaskImgsRef.current.delete(layer.id);
                                setPaintLayers(prev => {
                                  const next = prev.filter(l => l.id !== layer.id);
                                  paintLayersRef.current = next;
                                  return next;
                                });
                                if (activeLayerId === layer.id) {
                                  setActiveLayerId(null);
                                  activeLayerIdRef.current = null;
                                }
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors w-5 text-center flex-shrink-0 text-xs"
                              title="Delete layer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleVisDownload}
                        disabled={paintLayers.length === 0}
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

              {/* Right: colour / wallpaper picker */}
              <div className="w-full lg:w-72 flex-shrink-0">
                {/* Mode toggle */}
                <div className="flex gap-2 border-b border-border pb-3 mb-3">
                  <button
                    onClick={() => { setVisMode("paint"); visModeRef.current = "paint"; }}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${visMode === "paint" ? "bg-foreground text-background" : "border border-border hover:bg-accent"}`}
                  >
                    Paint
                  </button>
                  <button
                    onClick={() => { setVisMode("wallpaper"); visModeRef.current = "wallpaper"; }}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors ${visMode === "wallpaper" ? "bg-foreground text-background" : "border border-border hover:bg-accent"}`}
                  >
                    Wallpaper
                  </button>
                </div>

                {visMode === "paint" && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      {activeLayerId
                        ? "Updates selected layer. New strokes use this colour."
                        : "Will be used for the next stroke."}
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

                    {/* Colour swatch grid */}
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
                              setActiveLayerColour(p.hex);
                              activeLayerColourRef.current = p.hex;
                              setVisColourName(`${p.brand} — ${p.name}`);
                              if (activeLayerIdRef.current) {
                                setPaintLayers(prev => {
                                  const next = prev.map(l =>
                                    l.id === activeLayerIdRef.current ? { ...l, colour: p.hex } : l
                                  );
                                  paintLayersRef.current = next;
                                  return next;
                                });
                              }
                            }}
                            className={[
                              "w-10 h-10 rounded-full border-2 transition-all mx-auto block",
                              activeLayerColour === p.hex
                                ? "border-primary scale-110 shadow-md"
                                : "border-border hover:border-primary/50",
                            ].join(" ")}
                            style={{ backgroundColor: p.hex }}
                          />
                        ))}
                    </div>
                  </>
                )}

                {visMode === "wallpaper" && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Choose a wallpaper, then brush/lasso/polygon the wall area.
                    </p>

                    {/* Pattern size slider — show thumbnail when wallpaper selected */}
                    {selectedWallpaper ? (
                      <div className="flex items-center gap-3 p-2 border border-border rounded-lg mb-3">
                        <img
                          src={getPatternUrl(selectedWallpaper.id)}
                          alt={selectedWallpaper.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium truncate mb-1">{selectedWallpaper.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Scale:</span>
                            <input
                              type="range"
                              min="40"
                              max="200"
                              value={wallpaperScale}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setWallpaperScale(v);
                                wallpaperScaleRef.current = v;
                              }}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">{wallpaperScale}px</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Pattern size:</span>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          value={wallpaperScale}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setWallpaperScale(v);
                            wallpaperScaleRef.current = v;
                          }}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{wallpaperScale}px</span>
                      </div>
                    )}

                    {/* Wallpaper swatch grid */}
                    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {WALLPAPERS.map(wallpaper => (
                        <button
                          key={wallpaper.id}
                          onClick={() => {
                            setSelectedWallpaper(wallpaper);
                            selectedWallpaperRef.current = wallpaper;
                            // Preload S3 pattern image for canvas tiling
                            const key = `preview_${wallpaper.id}`;
                            if (!wallpaperPatternImgsRef.current.has(key)) {
                              const img = new Image();
                              img.crossOrigin = "anonymous";
                              img.onload = () => { wallpaperPatternImgsRef.current.set(key, img); };
                              img.src = getPatternUrl(wallpaper.id);
                            }
                          }}
                          title={wallpaper.name}
                          className={[
                            "aspect-square rounded-lg border-2 overflow-hidden transition-all",
                            selectedWallpaper?.id === wallpaper.id
                              ? "border-foreground scale-105 shadow-lg"
                              : "border-transparent hover:border-border",
                          ].join(" ")}
                        >
                          <img
                            src={getPatternUrl(wallpaper.id)}
                            alt={wallpaper.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Selected wallpaper buy card */}
                    {selectedWallpaper && (
                      <div className="mt-3 border border-border rounded-lg p-3 flex items-center gap-3">
                        <img
                          src={getPatternUrl(selectedWallpaper.id)}
                          alt={selectedWallpaper.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0 border border-border"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{selectedWallpaper.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedWallpaper.brand} · ~£{selectedWallpaper.pricePerRoll}/roll</p>
                        </div>
                        <a
                          href={selectedWallpaper.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="text-xs bg-[#FF9900] text-black px-3 py-1.5 rounded font-medium hover:bg-[#FFB84D] flex-shrink-0 whitespace-nowrap"
                        >
                          🛒 Buy
                        </a>
                      </div>
                    )}

                    {/* Pattern disclaimer */}
                    <div className="mt-3 p-2 border border-border/50 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium">Pattern Preview Notice:</span> Wallpaper
                        patterns shown are AI-generated representations designed to reflect each
                        style. They may differ from the actual product. Always check the
                        seller&apos;s listing before purchasing.
                      </p>
                    </div>
                  </>
                )}
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
                    <div className="h-32 w-full relative overflow-hidden rounded-t-xl">
                      <img
                        src={getPatternUrl(wallpaper.id)}
                        alt={`${wallpaper.name} pattern preview`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                      <span className="absolute top-2 right-2 text-xs bg-white/80 text-black px-2 py-0.5 rounded-full font-medium">
                        {wallpaper.style}
                      </span>
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
                        <a
                          href={makeAwinLink(
                            AFFILIATE_CONFIG.awin.merchants.wickes.id,
                            `https://www.wickes.co.uk/search?term=${encodeURIComponent(wallpaper.name + " wallpaper")}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-1.5 bg-[#E31837] text-white px-3 py-2 rounded text-xs font-medium hover:bg-[#B01229] transition-colors flex-1 justify-center"
                        >
                          🏠 Wickes
                        </a>
                      </div>

                      {wallpaper.isAffiliate && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Affiliate links — we may earn commission at no extra cost to you
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Pattern disclaimer */}
            <div className="mt-2 p-3 border border-border/50 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium">Pattern Preview Notice:</span> Wallpaper patterns shown
                are AI-generated representations designed to reflect each style. They may differ from
                the actual product. We are constantly refining our visualisation technology to improve
                accuracy. Always check the seller&apos;s listing for the original pattern before purchasing.
              </p>
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
          Associates (tag: paintbookco-21) and Awin (publisher: 2909131) — programmes
          include Dulux Decorator Centre, Farrow &amp; Ball, and Wickes. We may earn a
          commission when you click through and make a purchase at no extra cost to you.
          This doesn't affect our recommendations. Prices shown are approximate RRP
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
