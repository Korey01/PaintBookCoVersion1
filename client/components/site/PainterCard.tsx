import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, BadgeCheck } from "lucide-react";

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

export default function PainterCard({ painter }: { painter: Painter }) {
  return (
    <Card className="group overflow-hidden border-muted/60 shadow-sm transition hover:shadow-lg">
      <CardHeader className="p-0">
        <img src={painter.photo} alt={`${painter.name} portfolio`} loading="lazy" className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{painter.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{painter.location} · {painter.priceRange}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="text-sm font-medium">{painter.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({painter.reviews})</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {painter.skills.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="bg-secondary/60">{s}</Badge>
          ))}
          <Badge variant="outline">{painter.tier}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BadgeCheck className="h-4 w-4 text-primary"/> ID verified
          <ShieldCheck className="h-4 w-4 text-primary"/> Insured
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link to={`/painter/${painter.id}`}>View Profile</Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <Link to={`/post-job?painter=${painter.id}`}>Request Quote</Link>
          </Button>
          <button
            aria-label="Save to favourites"
            onClick={(e)=>{ e.preventDefault(); const key='paintbook:favs'; const cur: string[] = JSON.parse(localStorage.getItem(key)||'[]'); const next = cur.includes(painter.id) ? cur.filter(id=>id!==painter.id) : [...cur, painter.id]; localStorage.setItem(key, JSON.stringify(next)); }}
            className="ml-auto rounded-full border px-3 py-2 text-sm hover:bg-secondary"
          >♡</button>
        </div>
      </CardContent>
    </Card>
  );
}
