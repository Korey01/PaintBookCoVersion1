import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, BadgeCheck, Heart, ArrowUpRight } from "lucide-react";
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

export default function PainterCard({
  painter,
  distanceKm,
}: {
  painter: Painter;
  distanceKm?: number;
}) {
  const [faved, setFaved] = useState<boolean>(() => {
    const cur: string[] = JSON.parse(localStorage.getItem("paintbook:favs") || "[]");
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
    <article className="group flex flex-col bg-card border border-border/50 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-editorial-lg hover:-translate-y-1">

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={painter.photo}
          alt={`${painter.name} portfolio`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.04]"
        />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Rating pill — bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 text-white">
          <Star className="h-3 w-3 fill-white text-white" />
          <span className="text-xs font-semibold">{painter.rating.toFixed(1)}</span>
          <span className="text-xs text-white/60">({painter.reviews})</span>
        </div>

        {/* Tier — top left */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5",
            painter.tier === "Premium" && "bg-foreground text-background",
            painter.tier === "Pro"     && "bg-primary text-white",
            painter.tier === "Starter" && "bg-white/80 text-foreground",
          )}>
            {painter.tier}
          </span>
        </div>

        {/* Heart */}
        <button
          aria-label={faved ? "Remove from favourites" : "Save to favourites"}
          onClick={toggleFav}
          className={cn(
            "absolute top-3 right-3 p-2 transition-all duration-200",
            faved
              ? "text-primary bg-white/90"
              : "text-white/70 bg-black/30 hover:bg-white/90 hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", faved && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Name + location */}
        <div>
          <h3 className="text-base font-semibold leading-snug text-foreground font-sans">
            {painter.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {painter.location} · {painter.priceRange}
            {typeof distanceKm === "number" && ` · ${Math.round(distanceKm)} km away`}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {painter.skills.slice(0, 3).map((s, i) => (
            <span
              key={s}
              className={cn(
                "text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 bg-muted text-muted-foreground",
                i > 1 && "hidden sm:inline-flex",
              )}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> ID Verified
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Insured
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex gap-2 pt-2 border-t border-border/40">
          <Button asChild variant="default" size="sm" className="flex-1 text-xs">
            <Link to={`/painter/${painter.id}`}>View Profile</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
            <Link to={`/post-job?painter=${painter.id}`}>Request Quote</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
