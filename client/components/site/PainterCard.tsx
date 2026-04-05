import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, BadgeCheck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type Painter = {
  id: string;
  name: string;
  photo: string;
  location: string;
  priceRange: string;
  rating: number;
  reviews: number;
  skills: string[];
  tier: "Starter" | "Pro" | "Premium";
};

const TIER_STYLES = {
  Starter: "bg-muted text-muted-foreground border-border/60",
  Pro: "bg-secondary/15 text-secondary border-secondary/35",
  Premium: "bg-primary/12 text-primary border-primary/35",
};

const TIER_LABEL_STYLES = {
  Starter: "",
  Pro: "font-bold",
  Premium: "font-bold",
};

export default function PainterCard({
  painter,
  distanceKm,
}: {
  painter: Painter;
  distanceKm?: number;
}) {
  const [faved, setFaved] = useState<boolean>(() => {
    const cur: string[] = JSON.parse(
      localStorage.getItem("paintbook:favs") || "[]",
    );
    return cur.includes(painter.id);
  });

  function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    const key = "paintbook:favs";
    const cur: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    const next = cur.includes(painter.id)
      ? cur.filter((id) => id !== painter.id)
      : [...cur, painter.id];
    localStorage.setItem(key, JSON.stringify(next));
    setFaved(next.includes(painter.id));
  }

  return (
    <Card className="group overflow-hidden">
      {/* Portfolio image with gradient overlay */}
      <CardHeader className="relative p-0">
        <div className="relative overflow-hidden">
          <img
            src={painter.photo}
            alt={`${painter.name} portfolio`}
            loading="lazy"
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] md:h-52"
          />
          {/* Gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {/* Tier badge — bottom left of image */}
          <div className="absolute bottom-3 left-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide uppercase backdrop-blur-sm",
                TIER_STYLES[painter.tier],
                TIER_LABEL_STYLES[painter.tier],
              )}
            >
              {painter.tier === "Premium" && "⭐ "}
              {painter.tier === "Pro" && "✦ "}
              {painter.tier}
            </span>
          </div>

          {/* Rating — bottom right of image */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-[hsl(42_96%_52%)] text-[hsl(42_96%_52%)]" />
            <span className="text-[12px] font-bold text-white">
              {painter.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-white/70">
              ({painter.reviews})
            </span>
          </div>
        </div>

        {/* Favourite heart button */}
        <button
          aria-label={faved ? "Remove from favourites" : "Save to favourites"}
          onClick={toggleFav}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all duration-200 hover:scale-110 active:scale-95",
            faved
              ? "border-primary/50 bg-primary text-white shadow-glow-primary"
              : "border-white/40 bg-white/90 text-foreground/60 hover:bg-white hover:text-primary",
          )}
        >
          <Heart className={cn("h-4 w-4", faved && "fill-current")} />
        </button>
      </CardHeader>

      <CardContent className="space-y-3.5 p-4 sm:space-y-4">
        {/* Name + location */}
        <div>
          <p className="text-base font-bold leading-tight sm:text-lg">
            {painter.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {painter.location} · {painter.priceRange}
            {typeof distanceKm === "number" &&
              ` · ${Math.round(distanceKm)} km away`}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {painter.skills.slice(0, 3).map((s, index) => (
            <Badge
              key={s}
              variant="secondary"
              className={cn(
                "rounded-full bg-secondary/12 text-secondary border-secondary/25 text-[11px]",
                index > 1 ? "hidden sm:inline-flex" : "",
              )}
            >
              {s}
            </Badge>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            ID verified
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary sm:h-4 sm:w-4" />
            Insured
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Button
            asChild
            size="sm"
            className="h-10 w-full rounded-xl text-sm sm:flex-1"
          >
            <Link to={`/painter/${painter.id}`}>View Profile</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 w-full rounded-xl text-sm sm:flex-1"
          >
            <Link to={`/post-job?painter=${painter.id}`}>Request Quote</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
