import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function PainterCard({ painter, distanceKm }: { painter: Painter; distanceKm?: number }) {
  return (
    <Card className="group overflow-hidden border-muted/60 shadow-sm transition hover:shadow-lg">
      <CardHeader className="relative p-0">
        <img src={painter.photo} alt={`${painter.name} portfolio`} loading="lazy" className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-48" />
        <button
          aria-label="Save to favourites"
          onClick={(e)=>{ e.preventDefault(); const key='paintbook:favs'; const cur: string[] = JSON.parse(localStorage.getItem(key)||'[]'); const next = cur.includes(painter.id) ? cur.filter(id=>id!==painter.id) : [...cur, painter.id]; localStorage.setItem(key, JSON.stringify(next)); }}
          className="absolute right-3 top-3 rounded-full border border-white/60 bg-white/90 px-2 py-1 text-sm shadow-sm transition hover:bg-white"
        >♡</button>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold sm:text-lg">{painter.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{painter.location} · {painter.priceRange}{typeof distanceKm === 'number' ? ` · ${Math.round(distanceKm)} km (${Math.round(distanceKm*0.621371)} miles) away` : ''}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 sm:h-4 sm:w-4" />
            <span className="text-sm font-medium">{painter.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({painter.reviews})</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {painter.skills.slice(0, 3).map((s, index) => (
            <Badge key={s} variant="secondary" className={cn("bg-secondary/60", index > 1 ? "hidden sm:inline-flex" : "")}>{s}</Badge>
          ))}
          <Badge variant="outline" className="text-xs sm:text-sm">{painter.tier}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4"/> ID verified</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4"/> Insured</span>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button asChild className="h-10 w-full rounded-lg text-sm sm:flex-1">
            <Link to={`/painter/${painter.id}`}>View Profile</Link>
          </Button>
          <Button asChild variant="secondary" className="h-10 w-full rounded-lg text-sm sm:flex-1">
            <Link to={`/post-job?painter=${painter.id}`}>Request Quote</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
