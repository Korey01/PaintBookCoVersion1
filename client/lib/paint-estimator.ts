import { useMemo } from "react";

type PaintType = "interior_matt" | "satinwood" | "exterior_masonry";

export const PAINT_TYPES: { value: PaintType; label: string }[] = [
  { value: "interior_matt", label: "Interior Matt (Emulsion)" },
  { value: "satinwood", label: "Satinwood (Trim/Woodwork)" },
  { value: "exterior_masonry", label: "Exterior Masonry" },
];

export const BRAND_INFO: Record<string, Record<PaintType, { coverage: number; pricePerLitre: number }>> = {
  Dulux: {
    interior_matt: { coverage: 13, pricePerLitre: 20 },
    satinwood: { coverage: 12, pricePerLitre: 22 },
    exterior_masonry: { coverage: 11, pricePerLitre: 21 },
  },
  "JOHNSTONE'S": {
    interior_matt: { coverage: 12, pricePerLitre: 18 },
    satinwood: { coverage: 11, pricePerLitre: 19 },
    exterior_masonry: { coverage: 10, pricePerLitre: 19 },
  },
  wilko: {
    interior_matt: { coverage: 10, pricePerLitre: 12 },
    satinwood: { coverage: 9, pricePerLitre: 13 },
    exterior_masonry: { coverage: 8, pricePerLitre: 12 },
  },
  Leyland: {
    interior_matt: { coverage: 12, pricePerLitre: 16 },
    satinwood: { coverage: 11, pricePerLitre: 17 },
    exterior_masonry: { coverage: 10, pricePerLitre: 17 },
  },
};

export type EstimatorInput = {
  length: number;
  width: number;
  height: number;
  coats: number;
  openings: number;
  openingArea: number;
  coverage: number;
  pricePerLitre: number;
  paintType: PaintType;
};

export type EstimateResult = {
  wallArea: number;
  litres: number;
  materialCost: number;
  brandEstimates: {
    name: string;
    coverage: number;
    pricePerLitre: number;
    litres: number;
    cost: number;
  }[];
};

export const DEFAULT_ESTIMATOR_INPUT: EstimatorInput = {
  length: 4,
  width: 3,
  height: 2.6,
  coats: 2,
  openings: 2,
  openingArea: 1.9,
  coverage: 10,
  pricePerLitre: 18,
  paintType: "interior_matt",
};

const roundDecimals = (value: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export function computeEstimate(input: EstimatorInput): EstimateResult {
  const perimeter = 2 * (input.length + input.width);
  const grossArea = perimeter * input.height;
  const subtract = input.openings * input.openingArea;
  const wallArea = Math.max(0, grossArea - subtract);
  const perCoat = wallArea / Math.max(0.1, input.coverage);
  const litres = roundDecimals(perCoat * input.coats, 1);
  const materialCost = Math.round(litres * input.pricePerLitre);

  const brandEstimates = Object.entries(BRAND_INFO).map(([name, info]) => {
    const { coverage, pricePerLitre } = info[input.paintType];
    const perCoatBrand = wallArea / coverage;
    const litresBrand = roundDecimals(perCoatBrand * input.coats, 1);
    const costBrand = Math.round(litresBrand * pricePerLitre);
    return { name, coverage, pricePerLitre, litres: litresBrand, cost: costBrand };
  });

  return { wallArea, litres, materialCost, brandEstimates };
}

export function useEstimate(input: EstimatorInput) {
  return useMemo(() => computeEstimate(input), [
    input.length,
    input.width,
    input.height,
    input.coats,
    input.openings,
    input.openingArea,
    input.coverage,
    input.pricePerLitre,
    input.paintType,
  ]);
}
