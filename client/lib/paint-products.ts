/**
 * UK Paint Products Database
 * 30 most popular UK paint products with coverage rates and pricing
 */

export interface PaintProduct {
  id: string;
  brand: string;
  name: string;
  finish: "Matt" | "Eggshell" | "Gloss" | "Flat Matt" | "Ultra Matt";
  coveragePerLitre: number; // m² per litre
  pricePerLitre: number; // £ per litre
  availableSizes: number[]; // in litres
  productUrl: string;
  infoUrl: string;
  tier: "budget" | "mid" | "trade" | "premium" | "eco" | "specialist";
}

export const PAINT_PRODUCTS: PaintProduct[] = [
  // DULUX
  {
    id: "dulux-vinyl-matt",
    brand: "Dulux",
    name: "Vinyl Matt Emulsion",
    finish: "Matt",
    coveragePerLitre: 15,
    pricePerLitre: 8.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.dulux.co.uk/en/products/dulux-matt-emulsion",
    infoUrl: "https://www.dulux.co.uk/en/articles/paint-calculator",
    tier: "mid",
  },
  {
    id: "dulux-trade-diamond-matt",
    brand: "Dulux Trade",
    name: "Diamond Matt",
    finish: "Matt",
    coveragePerLitre: 16,
    pricePerLitre: 11.0,
    availableSizes: [2.5, 5, 10],
    productUrl: "https://www.duluxtrade.co.uk/products/diamond-matt",
    infoUrl: "https://www.duluxtrade.co.uk/",
    tier: "trade",
  },
  {
    id: "dulux-trade-diamond-eggshell",
    brand: "Dulux Trade",
    name: "Diamond Eggshell",
    finish: "Eggshell",
    coveragePerLitre: 16,
    pricePerLitre: 12.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.duluxtrade.co.uk/products/diamond-eggshell",
    infoUrl: "https://www.duluxtrade.co.uk/",
    tier: "trade",
  },
  {
    id: "dulux-easycare-washable",
    brand: "Dulux",
    name: "EasyCare Washable Matt",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 9.5,
    availableSizes: [2.5, 5],
    productUrl: "https://www.dulux.co.uk/en/products/dulux-easycare",
    infoUrl: "https://www.dulux.co.uk/en/articles/paint-calculator",
    tier: "mid",
  },

  // FARROW & BALL
  {
    id: "farrow-ball-modern-emulsion",
    brand: "Farrow & Ball",
    name: "Modern Emulsion",
    finish: "Matt",
    coveragePerLitre: 13,
    pricePerLitre: 26.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.farrow-ball.com/paint/modern-emulsion",
    infoUrl: "https://www.farrow-ball.com/how-much-paint",
    tier: "premium",
  },
  {
    id: "farrow-ball-estate-emulsion",
    brand: "Farrow & Ball",
    name: "Estate Emulsion",
    finish: "Flat Matt",
    coveragePerLitre: 12,
    pricePerLitre: 26.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.farrow-ball.com/paint/estate-emulsion",
    infoUrl: "https://www.farrow-ball.com/how-much-paint",
    tier: "premium",
  },
  {
    id: "farrow-ball-full-gloss",
    brand: "Farrow & Ball",
    name: "Full Gloss",
    finish: "Gloss",
    coveragePerLitre: 13,
    pricePerLitre: 26.0,
    availableSizes: [0.75, 2.5],
    productUrl: "https://www.farrow-ball.com/paint/full-gloss",
    infoUrl: "https://www.farrow-ball.com/how-much-paint",
    tier: "premium",
  },

  // CROWN
  {
    id: "crown-easyclean-matt",
    brand: "Crown",
    name: "EasyClean Matt",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 7.5,
    availableSizes: [2.5, 5],
    productUrl: "https://www.crownpaints.co.uk/products/easyclean",
    infoUrl: "https://www.crownpaints.co.uk/advice/how-much-paint",
    tier: "budget",
  },
  {
    id: "crown-trade-fastflow-eggshell",
    brand: "Crown Trade",
    name: "Fastflow Eggshell",
    finish: "Eggshell",
    coveragePerLitre: 15,
    pricePerLitre: 10.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.crowntrade.co.uk/",
    infoUrl: "https://www.crowntrade.co.uk/",
    tier: "trade",
  },

  // JOHNSTONE'S
  {
    id: "johnstons-trade-durable-matt",
    brand: "Johnstone's Trade",
    name: "Durable Matt",
    finish: "Matt",
    coveragePerLitre: 15,
    pricePerLitre: 9.0,
    availableSizes: [2.5, 5, 10, 15],
    productUrl: "https://www.johnstonestrade.com/products/durable-matt",
    infoUrl: "https://www.johnstonestrade.com/",
    tier: "trade",
  },
  {
    id: "johnstons-trade-acrylic-eggshell",
    brand: "Johnstone's Trade",
    name: "Acrylic Eggshell",
    finish: "Eggshell",
    coveragePerLitre: 14,
    pricePerLitre: 10.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.johnstonestrade.com/",
    infoUrl: "https://www.johnstonestrade.com/",
    tier: "trade",
  },

  // LITTLE GREENE
  {
    id: "little-greene-intelligent-matt",
    brand: "Little Greene",
    name: "Intelligent Matt Emulsion",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 18.0,
    availableSizes: [1, 2.5, 5],
    productUrl: "https://www.littlegreene.com/paint/intelligent-matt-emulsion",
    infoUrl: "https://www.littlegreene.com/how-much-paint-do-i-need",
    tier: "premium",
  },
  {
    id: "little-greene-intelligent-eggshell",
    brand: "Little Greene",
    name: "Intelligent Eggshell",
    finish: "Eggshell",
    coveragePerLitre: 13,
    pricePerLitre: 19.0,
    availableSizes: [1, 2.5],
    productUrl: "https://www.littlegreene.com/paint/intelligent-eggshell",
    infoUrl: "https://www.littlegreene.com/how-much-paint-do-i-need",
    tier: "premium",
  },

  // LEYLAND TRADE
  {
    id: "leyland-trade-vinyl-matt",
    brand: "Leyland Trade",
    name: "Vinyl Matt",
    finish: "Matt",
    coveragePerLitre: 15,
    pricePerLitre: 6.5,
    availableSizes: [5, 10],
    productUrl: "https://www.leylandtrade.co.uk/",
    infoUrl: "https://www.leylandtrade.co.uk/",
    tier: "trade",
  },
  {
    id: "leyland-trade-acrylic-eggshell",
    brand: "Leyland Trade",
    name: "Acrylic Eggshell",
    finish: "Eggshell",
    coveragePerLitre: 14,
    pricePerLitre: 7.5,
    availableSizes: [5, 10],
    productUrl: "https://www.leylandtrade.co.uk/",
    infoUrl: "https://www.leylandtrade.co.uk/",
    tier: "trade",
  },

  // EARTHBORN
  {
    id: "earthborn-claypaint",
    brand: "Earthborn",
    name: "Claypaint",
    finish: "Matt",
    coveragePerLitre: 12,
    pricePerLitre: 9.5,
    availableSizes: [2.5, 5],
    productUrl: "https://www.earthbornpaints.co.uk/claypaint",
    infoUrl: "https://www.earthbornpaints.co.uk/how-much-paint",
    tier: "eco",
  },
  {
    id: "earthborn-lifestyle-emulsion",
    brand: "Earthborn",
    name: "Lifestyle Emulsion",
    finish: "Matt",
    coveragePerLitre: 13,
    pricePerLitre: 8.5,
    availableSizes: [2.5, 5],
    productUrl: "https://www.earthbornpaints.co.uk/",
    infoUrl: "https://www.earthbornpaints.co.uk/",
    tier: "eco",
  },

  // BENJAMIN MOORE
  {
    id: "benjamin-moore-aura-interior",
    brand: "Benjamin Moore",
    name: "Aura Interior",
    finish: "Matt",
    coveragePerLitre: 15,
    pricePerLitre: 20.0,
    availableSizes: [1, 3.79],
    productUrl: "https://www.benjaminmoore.com/en-gb/paint/aura-interior-paint",
    infoUrl: "https://www.benjaminmoore.com/en-gb/tools/paint-calculator",
    tier: "premium",
  },

  // VALSPAR
  {
    id: "valspar-trade-contract-matt",
    brand: "Valspar",
    name: "Trade Contract Matt",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 7.0,
    availableSizes: [2.5, 5, 10],
    productUrl: "https://www.valspar.com/en/uk/",
    infoUrl: "https://www.valspar.com/en/uk/paint-calculator",
    tier: "mid",
  },

  // RUST-OLEUM
  {
    id: "rustoleum-chalked-ultra-matt",
    brand: "Rust-Oleum",
    name: "Chalked Ultra Matt",
    finish: "Ultra Matt",
    coveragePerLitre: 10,
    pricePerLitre: 14.0,
    availableSizes: [0.887, 1],
    productUrl: "https://www.rustoleum.co.uk/product-catalog/consumer-brands/chalked-paint/",
    infoUrl: "https://www.rustoleum.co.uk/",
    tier: "specialist",
  },

  // COAT PAINTS
  {
    id: "coat-paints-interior-emulsion",
    brand: "Coat Paints",
    name: "Interior Emulsion",
    finish: "Matt",
    coveragePerLitre: 13,
    pricePerLitre: 16.0,
    availableSizes: [2.5],
    productUrl: "https://www.coatpaints.com/",
    infoUrl: "https://www.coatpaints.com/",
    tier: "mid",
  },

  // LICK
  {
    id: "lick-interior-paint",
    brand: "Lick",
    name: "Interior Paint",
    finish: "Matt",
    coveragePerLitre: 12,
    pricePerLitre: 17.0,
    availableSizes: [2.5],
    productUrl: "https://lick.com/",
    infoUrl: "https://lick.com/pages/paint-calculator",
    tier: "mid",
  },

  // FIRED EARTH
  {
    id: "fired-earth-interior-emulsion",
    brand: "Fired Earth",
    name: "Interior Emulsion",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 22.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.firedearth.com/paint",
    infoUrl: "https://www.firedearth.com/",
    tier: "premium",
  },

  // DESIGNERS GUILD
  {
    id: "designers-guild-matt-emulsion",
    brand: "Designers Guild",
    name: "Matt Emulsion",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 20.0,
    availableSizes: [2.5],
    productUrl: "https://www.designersguild.com/paint",
    infoUrl: "https://www.designersguild.com/paint",
    tier: "premium",
  },

  // B&Q OWN BRAND
  {
    id: "bq-colours-matt",
    brand: "B&Q Colours",
    name: "Matt Emulsion",
    finish: "Matt",
    coveragePerLitre: 12,
    pricePerLitre: 4.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.diy.com/departments/paint/DIY836827.cat",
    infoUrl: "https://www.diy.com/",
    tier: "budget",
  },

  // WICKES
  {
    id: "wickes-contract-matt",
    brand: "Wickes",
    name: "Contract Matt Emulsion",
    finish: "Matt",
    coveragePerLitre: 12,
    pricePerLitre: 3.5,
    availableSizes: [5, 10],
    productUrl: "https://www.wickes.co.uk/paint",
    infoUrl: "https://www.wickes.co.uk/",
    tier: "budget",
  },

  // MYLANDS
  {
    id: "mylands-emulsion",
    brand: "Mylands",
    name: "Matt Emulsion",
    finish: "Matt",
    coveragePerLitre: 14,
    pricePerLitre: 18.0,
    availableSizes: [2.5, 5],
    productUrl: "https://www.mylands.com/paints",
    infoUrl: "https://www.mylands.com/",
    tier: "premium",
  },

  // GRAPHENSTONE
  {
    id: "graphenstone-gcs-interior",
    brand: "Graphenstone",
    name: "GCS Interior",
    finish: "Matt",
    coveragePerLitre: 16,
    pricePerLitre: 12.0,
    availableSizes: [4, 15],
    productUrl: "https://www.graphenstone.co.uk/",
    infoUrl: "https://www.graphenstone.co.uk/",
    tier: "eco",
  },

  // EDWARD BULMER
  {
    id: "edward-bulmer-emulsion",
    brand: "Edward Bulmer Natural Paint",
    name: "Intelligent Matt",
    finish: "Matt",
    coveragePerLitre: 11,
    pricePerLitre: 19.0,
    availableSizes: [2.5],
    productUrl: "https://edwardbulmer.com/",
    infoUrl: "https://edwardbulmer.com/",
    tier: "eco",
  },
];

// Filter options
export const TIER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "budget", label: "Budget", color: "bg-green-900 text-green-300" },
  { value: "mid", label: "Mid", color: "bg-blue-900 text-blue-300" },
  { value: "trade", label: "Trade", color: "bg-orange-900 text-orange-300" },
  { value: "premium", label: "Premium", color: "bg-purple-900 text-purple-300" },
  { value: "eco", label: "Eco", color: "bg-teal-900 text-teal-300" },
];

export const FINISH_OPTIONS = [
  { value: "all", label: "All" },
  { value: "Matt", label: "Matt" },
  { value: "Eggshell", label: "Eggshell" },
  { value: "Gloss", label: "Gloss" },
  { value: "Specialist", label: "Specialist" },
];

// Get color for tier badge
export function getTierColor(tier: string): string {
  const option = TIER_OPTIONS.find((o) => o.value === tier);
  return option?.color || "bg-gray-900 text-gray-300";
}
