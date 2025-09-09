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
    photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1887&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1523419409543-8fc58a320246?q=80&w=1887&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503951458645-643d53bfd28f?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=1974&auto=format&fit=crop",
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
    photo: "https://images.unsplash.com/photo-1523419409543-8fc58a320246?q=80&w=1887&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1541976076758-347942db1970?q=80&w=1887&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=1974&auto=format&fit=crop",
    ],
    reviewList: [
      { id: "r3", author: "Monica P.", rating: 4.5, comment: "Great prep and weatherproofing.", date: "2024-03-02" },
    ],
    availability: ["Next week"],
  },
  {
    id: "3",
    name: "Maya Cole - StudioHue",
    photo: "https://images.unsplash.com/photo-1503951458645-643d53bfd28f?q=80&w=1974&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1556911073-52527ac437f5?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523419409543-8fc58a320246?q=80&w=1887&auto=format&fit=crop",
    ],
    reviewList: [
      { id: "r4", author: "Rajan S.", rating: 5, comment: "Kitchen looks brand new!", date: "2024-01-14" },
    ],
    availability: ["This week"],
  },
];
