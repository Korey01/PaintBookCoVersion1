import { Painter } from "@/components/site/PainterCard";

export type Review = { id: string; author: string; rating: number; comment: string; date: string };
export type Service = { name: string; priceRange: string };

export type PainterFull = Painter & {
  bio: string;
  coverage: string;
  certifications: string[];
  services: Service[];
  portfolio: string[];
  reviewList: Review[];
  availability: string[];
};

export const painters: PainterFull[] = [
  {
    id: "1",
    name: "Amina Ade - ColourCraft",
    photo: "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fcb59103ceadd4ea48c06e1b1d34f5724?format=webp&width=800",
    location: "London",
    priceRange: "£20–£35/hr",
    rating: 4.9,
    reviews: 142,
    skills: ["Interior", "Feature walls", "Plaster repair"],
    tier: "Premium",
    bio: "Detail-obsessed interior specialist bringing rich colour and flawless finishes to homes and studios.",
    coverage: "Greater London, Surrey",
    certifications: ["DBS checked", "IPAF certified"],
    services: [
      { name: "Interior walls & ceilings", priceRange: "£150–£350/room" },
      { name: "Feature wall", priceRange: "£120–£220" },
      { name: "Plaster repair", priceRange: "£80–£180" },
    ],
    portfolio: [
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fb64b99f1669c4fea84908870389ce077?format=webp&width=800",
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F02ea2b8fe91044b595e115b66afbddef?format=webp&width=800",
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F913436e60029497d8742ae0816f567c7?format=webp&width=800",
    ],
    reviewList: [
      { id: "r1", author: "Ella R.", rating: 5, comment: "Faultless finish and friendly.", date: "2024-05-18" },
      { id: "r2", author: "Josh M.", rating: 5, comment: "On time and very tidy.", date: "2024-02-09" },
    ],
    availability: ["This week", "Next week"],
  },
  {
    id: "2",
    name: "Lucas Khan - PrimeCoat",
    photo: "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F2b9cbee924fd4eeabca9f0bc3d2a4fd3?format=webp&width=800",
    location: "Manchester",
    priceRange: "£18–£30/hr",
    rating: 4.7,
    reviews: 98,
    skills: ["Exterior", "Fences", "Decking"],
    tier: "Pro",
    bio: "Exterior coatings that last through British weather with clean lines and prep-first approach.",
    coverage: "Manchester & 25mi radius",
    certifications: ["CSCS card"],
    services: [
      { name: "Exterior repaint", priceRange: "£500–£1800" },
      { name: "Decking staining", priceRange: "£120–£300" },
    ],
    portfolio: [
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F6a440303ba6e42bd817b07b0544d4451?format=webp&width=800",
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fc1db86da96eb40bd97ce4e112a273df4?format=webp&width=800",
    ],
    reviewList: [
      { id: "r3", author: "Monica P.", rating: 4.5, comment: "Great prep and weatherproofing.", date: "2024-03-02" },
    ],
    availability: ["Next week"],
  },
  {
    id: "3",
    name: "Maya Cole - StudioHue",
    photo: "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F913436e60029497d8742ae0816f567c7?format=webp&width=800",
    location: "Birmingham",
    priceRange: "£22–£38/hr",
    rating: 5.0,
    reviews: 63,
    skills: ["Kitchens", "Cabinets", "Wallpaper"],
    tier: "Premium",
    bio: "Cabinet refinishing and wallpaper specialist transforming kitchens and features with durable finishes.",
    coverage: "West Midlands",
    certifications: ["DBS checked"],
    services: [
      { name: "Kitchen cabinet respray", priceRange: "£900–£2500" },
      { name: "Wallpaper install", priceRange: "£180–£420/room" },
    ],
    portfolio: [
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F02ea2b8fe91044b595e115b66afbddef?format=webp&width=800",
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fb64b99f1669c4fea84908870389ce077?format=webp&width=800",
    ],
    reviewList: [
      { id: "r4", author: "Rajan S.", rating: 5, comment: "Kitchen looks brand new!", date: "2024-01-14" },
    ],
    availability: ["This week"],
  },
];
