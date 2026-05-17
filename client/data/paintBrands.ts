export interface PaintProduct {
  id: string;
  brand: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  finish: "Matt" | "Silk" | "Satin" | "Gloss" | "Eggshell";
  coverage: number; // m² per litre
  coatRecommended: number;
  sizes: { litres: number; approxPrice: number }[];
  affiliateLinks: {
    amazon?: string;
    bq?: string;
    wickes?: string;
  };
  colourFamily:
    | "White"
    | "Grey"
    | "Beige"
    | "Yellow"
    | "Green"
    | "Blue"
    | "Red"
    | "Purple"
    | "Brown"
    | "Black"
    | "Pink"
    | "Orange";
}

export const PAINT_PRODUCTS: PaintProduct[] = [
  // ── DULUX (10 colours) ──────────────────────────────────────────────────────

  {
    id: "dulux-pure-brilliant-white",
    brand: "Dulux",
    name: "Pure Brilliant White",
    hex: "#F5F5F0",
    rgb: { r: 245, g: 245, b: 240 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 16 },
      { litres: 5, approxPrice: 26 },
      { litres: 10, approxPrice: 42 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+pure+brilliant+white+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+pure+brilliant+white",
    },
    colourFamily: "White",
  },
  {
    id: "dulux-chic-shadow",
    brand: "Dulux",
    name: "Chic Shadow",
    hex: "#9E9E9C",
    rgb: { r: 158, g: 158, b: 156 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+chic+shadow+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+chic+shadow",
    },
    colourFamily: "Grey",
  },
  {
    id: "dulux-gentle-fawn",
    brand: "Dulux",
    name: "Gentle Fawn",
    hex: "#C4B5A2",
    rgb: { r: 196, g: 181, b: 162 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+gentle+fawn+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+gentle+fawn",
    },
    colourFamily: "Beige",
  },
  {
    id: "dulux-warm-pewter",
    brand: "Dulux",
    name: "Warm Pewter",
    hex: "#8B8680",
    rgb: { r: 139, g: 134, b: 128 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+warm+pewter+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+warm+pewter",
    },
    colourFamily: "Grey",
  },
  {
    id: "dulux-mineral-mist",
    brand: "Dulux",
    name: "Mineral Mist",
    hex: "#B2C4C8",
    rgb: { r: 178, g: 196, b: 200 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+mineral+mist+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+mineral+mist",
    },
    colourFamily: "Blue",
  },
  {
    id: "dulux-cornfield",
    brand: "Dulux",
    name: "Cornfield",
    hex: "#E8D5A3",
    rgb: { r: 232, g: 213, b: 163 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+cornfield+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+cornfield",
    },
    colourFamily: "Yellow",
  },
  {
    id: "dulux-teal-tension",
    brand: "Dulux",
    name: "Teal Tension",
    hex: "#3D7A7A",
    rgb: { r: 61, g: 122, b: 122 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+teal+tension+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+teal+tension",
    },
    colourFamily: "Green",
  },
  {
    id: "dulux-sapphire-salute",
    brand: "Dulux",
    name: "Sapphire Salute",
    hex: "#3A5F8A",
    rgb: { r: 58, g: 95, b: 138 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+sapphire+salute+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+sapphire+salute",
    },
    colourFamily: "Blue",
  },
  {
    id: "dulux-overtly-olive",
    brand: "Dulux",
    name: "Overtly Olive",
    hex: "#7A7A50",
    rgb: { r: 122, g: 122, b: 80 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+overtly+olive+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+overtly+olive",
    },
    colourFamily: "Green",
  },
  {
    id: "dulux-blush-pink",
    brand: "Dulux",
    name: "Blush Pink",
    hex: "#E8C4B8",
    rgb: { r: 232, g: 196, b: 184 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+blush+pink+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+blush+pink",
    },
    colourFamily: "Pink",
  },

  // ── CROWN (8 colours) ───────────────────────────────────────────────────────

  {
    id: "crown-period-grey",
    brand: "Crown",
    name: "Period Grey",
    hex: "#8A8C8E",
    rgb: { r: 138, g: 140, b: 142 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+period+grey+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+period+grey",
    },
    colourFamily: "Grey",
  },
  {
    id: "crown-antique-white",
    brand: "Crown",
    name: "Antique White",
    hex: "#F0EBE0",
    rgb: { r: 240, g: 235, b: 224 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+antique+white+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+antique+white",
    },
    colourFamily: "White",
  },
  {
    id: "crown-sage-green",
    brand: "Crown",
    name: "Sage Green",
    hex: "#9CAF88",
    rgb: { r: 156, g: 175, b: 136 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+sage+green+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+sage+green",
    },
    colourFamily: "Green",
  },
  {
    id: "crown-midnight-blue",
    brand: "Crown",
    name: "Midnight Blue",
    hex: "#1C2B4A",
    rgb: { r: 28, g: 43, b: 74 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+midnight+blue+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+midnight+blue",
    },
    colourFamily: "Blue",
  },
  {
    id: "crown-warm-stone",
    brand: "Crown",
    name: "Warm Stone",
    hex: "#C8B99A",
    rgb: { r: 200, g: 185, b: 154 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+warm+stone+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+warm+stone",
    },
    colourFamily: "Beige",
  },
  {
    id: "crown-dusky-rose",
    brand: "Crown",
    name: "Dusky Rose",
    hex: "#C48080",
    rgb: { r: 196, g: 128, b: 128 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+dusky+rose+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+dusky+rose",
    },
    colourFamily: "Pink",
  },
  {
    id: "crown-charcoal",
    brand: "Crown",
    name: "Charcoal",
    hex: "#404040",
    rgb: { r: 64, g: 64, b: 64 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+charcoal+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+charcoal",
    },
    colourFamily: "Black",
  },
  {
    id: "crown-terracotta",
    brand: "Crown",
    name: "Terracotta",
    hex: "#C2714F",
    rgb: { r: 194, g: 113, b: 79 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+terracotta+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+terracotta",
    },
    colourFamily: "Orange",
  },

  // ── FARROW & BALL (8 colours) ───────────────────────────────────────────────

  {
    id: "fb-elephants-breath",
    brand: "Farrow & Ball",
    name: "Elephant's Breath",
    hex: "#C5BDB2",
    rgb: { r: 197, g: 189, b: 178 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+elephants+breath&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+elephants+breath",
    },
    colourFamily: "Beige",
  },
  {
    id: "fb-borrowed-light",
    brand: "Farrow & Ball",
    name: "Borrowed Light",
    hex: "#C8D8E0",
    rgb: { r: 200, g: 216, b: 224 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+borrowed+light&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+borrowed+light",
    },
    colourFamily: "Blue",
  },
  {
    id: "fb-purbeck-stone",
    brand: "Farrow & Ball",
    name: "Purbeck Stone",
    hex: "#BAB4A6",
    rgb: { r: 186, g: 180, b: 166 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+purbeck+stone&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+purbeck+stone",
    },
    colourFamily: "Grey",
  },
  {
    id: "fb-off-black",
    brand: "Farrow & Ball",
    name: "Off-Black",
    hex: "#3A3A35",
    rgb: { r: 58, g: 58, b: 53 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+off+black&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+off+black",
    },
    colourFamily: "Black",
  },
  {
    id: "fb-hague-blue",
    brand: "Farrow & Ball",
    name: "Hague Blue",
    hex: "#2A3E4C",
    rgb: { r: 42, g: 62, b: 76 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+hague+blue&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+hague+blue",
    },
    colourFamily: "Blue",
  },
  {
    id: "fb-moles-breath",
    brand: "Farrow & Ball",
    name: "Mole's Breath",
    hex: "#898989",
    rgb: { r: 137, g: 137, b: 137 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+moles+breath&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+moles+breath",
    },
    colourFamily: "Grey",
  },
  {
    id: "fb-dimity",
    brand: "Farrow & Ball",
    name: "Dimity",
    hex: "#E8E0D5",
    rgb: { r: 232, g: 224, b: 213 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+dimity&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+dimity",
    },
    colourFamily: "White",
  },
  {
    id: "fb-pigeon",
    brand: "Farrow & Ball",
    name: "Pigeon",
    hex: "#8C9E96",
    rgb: { r: 140, g: 158, b: 150 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+pigeon&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=farrow+ball+pigeon",
    },
    colourFamily: "Green",
  },

  // ── B&Q VALSPAR (4 colours) ─────────────────────────────────────────────────

  {
    id: "valspar-blanc-de-blanc",
    brand: "Valspar",
    name: "Blanc de Blanc",
    hex: "#F2EFE8",
    rgb: { r: 242, g: 239, b: 232 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      bq: "https://www.diy.com/search?term=valspar+blanc+de+blanc+matt",
    },
    colourFamily: "White",
  },
  {
    id: "valspar-steel-symphony",
    brand: "Valspar",
    name: "Steel Symphony",
    hex: "#7A8A8E",
    rgb: { r: 122, g: 138, b: 142 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      bq: "https://www.diy.com/search?term=valspar+steel+symphony+matt",
    },
    colourFamily: "Grey",
  },
  {
    id: "valspar-forest-floor",
    brand: "Valspar",
    name: "Forest Floor",
    hex: "#5A7060",
    rgb: { r: 90, g: 112, b: 96 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      bq: "https://www.diy.com/search?term=valspar+forest+floor+matt",
    },
    colourFamily: "Green",
  },
  {
    id: "valspar-dusty-miller",
    brand: "Valspar",
    name: "Dusty Miller",
    hex: "#9AABBA",
    rgb: { r: 154, g: 171, b: 186 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      bq: "https://www.diy.com/search?term=valspar+dusty+miller+matt",
    },
    colourFamily: "Blue",
  },

  // ── LITTLE GREENE (4 colours) ───────────────────────────────────────────────

  {
    id: "lg-french-grey",
    brand: "Little Greene",
    name: "French Grey",
    hex: "#B0B0A0",
    rgb: { r: 176, g: 176, b: 160 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.25, approxPrice: 8 },
      { litres: 1, approxPrice: 22 },
      { litres: 2.5, approxPrice: 42 },
      { litres: 5, approxPrice: 75 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=little+greene+french+grey&tag=paintbookco-21",
    },
    colourFamily: "Grey",
  },
  {
    id: "lg-gauze",
    brand: "Little Greene",
    name: "Gauze",
    hex: "#E0D8CC",
    rgb: { r: 224, g: 216, b: 204 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.25, approxPrice: 8 },
      { litres: 1, approxPrice: 22 },
      { litres: 2.5, approxPrice: 42 },
      { litres: 5, approxPrice: 75 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=little+greene+gauze&tag=paintbookco-21",
    },
    colourFamily: "Beige",
  },
  {
    id: "lg-livid",
    brand: "Little Greene",
    name: "Livid",
    hex: "#6F8EA0",
    rgb: { r: 111, g: 142, b: 160 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.25, approxPrice: 8 },
      { litres: 1, approxPrice: 22 },
      { litres: 2.5, approxPrice: 42 },
      { litres: 5, approxPrice: 75 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=little+greene+livid&tag=paintbookco-21",
    },
    colourFamily: "Blue",
  },
  {
    id: "lg-lamp-black",
    brand: "Little Greene",
    name: "Lamp Black",
    hex: "#2A2A26",
    rgb: { r: 42, g: 42, b: 38 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.25, approxPrice: 8 },
      { litres: 1, approxPrice: 22 },
      { litres: 2.5, approxPrice: 42 },
      { litres: 5, approxPrice: 75 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=little+greene+lamp+black&tag=paintbookco-21",
    },
    colourFamily: "Black",
  },

  // ── ADDITIONAL PRODUCTS (to ensure 30+ total) ───────────────────────────────

  {
    id: "dulux-trade-white",
    brand: "Dulux Trade",
    name: "Brilliant White",
    hex: "#FAFAF8",
    rgb: { r: 250, g: 250, b: 248 },
    finish: "Matt",
    coverage: 16,
    coatRecommended: 2,
    sizes: [
      { litres: 5, approxPrice: 32 },
      { litres: 10, approxPrice: 55 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+trade+brilliant+white+matt&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+trade+brilliant+white",
    },
    colourFamily: "White",
  },
  {
    id: "crown-trade-white",
    brand: "Crown Trade",
    name: "Brilliant White Emulsion",
    hex: "#F8F8F6",
    rgb: { r: 248, g: 248, b: 246 },
    finish: "Matt",
    coverage: 14,
    coatRecommended: 2,
    sizes: [
      { litres: 5, approxPrice: 28 },
      { litres: 10, approxPrice: 48 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+trade+brilliant+white+matt&tag=paintbookco-21",
    },
    colourFamily: "White",
  },
  {
    id: "fb-skimming-stone",
    brand: "Farrow & Ball",
    name: "Skimming Stone",
    hex: "#C8BEA8",
    rgb: { r: 200, g: 190, b: 168 },
    finish: "Matt",
    coverage: 13,
    coatRecommended: 2,
    sizes: [
      { litres: 0.75, approxPrice: 14 },
      { litres: 2.5, approxPrice: 35 },
      { litres: 5, approxPrice: 65 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=farrow+ball+skimming+stone&tag=paintbookco-21",
    },
    colourFamily: "Beige",
  },
  {
    id: "dulux-natural-hessian",
    brand: "Dulux",
    name: "Natural Hessian",
    hex: "#D4C4A8",
    rgb: { r: 212, g: 196, b: 168 },
    finish: "Matt",
    coverage: 12,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 18 },
      { litres: 5, approxPrice: 30 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=dulux+natural+hessian+matt&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=dulux+natural+hessian",
    },
    colourFamily: "Beige",
  },
  {
    id: "crown-eden",
    brand: "Crown",
    name: "Eden",
    hex: "#4A6741",
    rgb: { r: 74, g: 103, b: 65 },
    finish: "Matt",
    coverage: 11,
    coatRecommended: 2,
    sizes: [
      { litres: 2.5, approxPrice: 15 },
      { litres: 5, approxPrice: 24 },
    ],
    affiliateLinks: {
      amazon:
        "https://www.amazon.co.uk/s?k=crown+eden+green+matt+emulsion&tag=paintbookco-21",
      bq: "https://www.diy.com/search?term=crown+eden+green",
    },
    colourFamily: "Green",
  },
];

// Colour family filter options
export const COLOUR_FAMILIES = [
  "All",
  "White",
  "Grey",
  "Beige",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Red",
  "Pink",
  "Purple",
  "Brown",
  "Black",
] as const;

// Brand filter options derived from products
export const BRANDS = [
  "All",
  ...Array.from(new Set(PAINT_PRODUCTS.map((p) => p.brand))).sort(),
] as const;

// Finish filter options
export const FINISHES = [
  "All",
  "Matt",
  "Silk",
  "Satin",
  "Gloss",
  "Eggshell",
] as const;

// Coverage rates for the calculator (by paint type label)
export const COVERAGE_RATES: Record<string, number> = {
  "Matt Emulsion": 12,
  "Silk Emulsion": 11,
  Satin: 10,
  Gloss: 12,
  "Masonry Paint": 8,
  Primer: 10,
  Undercoat: 11,
};
