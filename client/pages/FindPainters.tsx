import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PainterCard, { Painter } from "@/components/site/PainterCard";

const PAINTERS: Painter[] = [
  { id: "1", name: "Amina Ade - ColourCraft", photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1887&auto=format&fit=crop", location: "London", priceRange: "£20–£35/hr", rating: 4.9, reviews: 142, skills: ["Interior","Feature walls","Plaster repair"], tier: "Premium" },
  { id: "2", name: "Lucas Khan - PrimeCoat", photo: "https://images.unsplash.com/photo-1523419409543-8fc58a320246?q=80&w=1887&auto=format&fit=crop", location: "Manchester", priceRange: "£18–£30/hr", rating: 4.7, reviews: 98, skills: ["Exterior","Fences","Decking"], tier: "Pro" },
  { id: "3", name: "Maya Cole - StudioHue", photo: "https://images.unsplash.com/photo-1503951458645-643d53bfd28f?q=80&w=1974&auto=format&fit=crop", location: "Birmingham", priceRange: "£22–£38/hr", rating: 5.0, reviews: 63, skills: ["Kitchens","Cabinets","Wallpaper"], tier: "Premium" },
  { id: "4", name: "Ethan Lee - FreshCoat", photo: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1964&auto=format&fit=crop", location: "Leeds", priceRange: "£16–£28/hr", rating: 4.5, reviews: 54, skills: ["Interior","Exterior","Sanding"], tier: "Starter" }
];

export default function FindPainters() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const [price, setPrice] = useState<number[]>([15, 40]);
  const [minRating, setMinRating] = useState(4);
  const [available, setAvailable] = useState(true);
  const [tier, setTier] = useState<string>("");

  const filtered = useMemo(() => {
    const loc = params.get("location")?.toLowerCase() || "";
    const type = params.get("type")?.toLowerCase() || "";
    return PAINTERS.filter(p => {
      const inLoc = !loc || p.location.toLowerCase().includes(loc);
      const inType = !type || p.skills.some(s => s.toLowerCase().includes(type));
      const rateLow = parseInt(p.priceRange.replace(/[^0-9]/g, "").slice(0,2));
      const inPrice = rateLow >= price[0] && rateLow <= price[1];
      const inRating = p.rating >= minRating;
      const inTier = !tier || p.tier === tier;
      return inLoc && inType && inPrice && inRating && inTier;
    });
  }, [params, price, minRating, tier]);

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[280px_1fr]">
      <aside className="space-y-6 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="space-y-3">
          <Label className="text-sm">Price per hour (£{price[0]}–£{price[1]})</Label>
          <Slider min={10} max={60} step={1} value={price} onValueChange={setPrice} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Minimum Rating</Label>
          <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="4.5">4.5+</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Experience Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="avail" checked={available} onCheckedChange={() => setAvailable(!available)} />
          <Label htmlFor="avail" className="text-sm">Available this week</Label>
        </div>
      </aside>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painters {params.get("location") ? `in ${params.get("location")}` : "near you"}</h1>
            <p className="text-sm text-muted-foreground">Filter by price, ratings, availability and tier.</p>
          </div>
          <button onClick={() => navigate("/post-job")} className="text-sm text-primary underline">Post a job</button>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => <PainterCard key={p.id} painter={p} />)}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No painters match your filters. Try adjusting them.</p>
          )}
        </div>
      </section>
    </div>
  );
}
