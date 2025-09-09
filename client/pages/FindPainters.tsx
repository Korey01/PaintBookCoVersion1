import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PainterCard from "@/components/site/PainterCard";
import { painters } from "@/data/painters";

export default function FindPainters() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const [price, setPrice] = useState<number[]>([15, 40]);
  const [minRating, setMinRating] = useState(4);
  const [available, setAvailable] = useState(true);
  const [tier, setTier] = useState<string>("any");

  const filtered = useMemo(() => {
    const loc = params.get("location")?.toLowerCase() || "";
    const type = params.get("type")?.toLowerCase() || "";
    return painters.filter(p => {
      const inLoc = !loc || p.location.toLowerCase().includes(loc);
      const inType = !type || p.skills.some(s => s.toLowerCase().includes(type));
      const rateLow = parseInt(p.priceRange.replace(/[^0-9]/g, "").slice(0,2));
      const inPrice = rateLow >= price[0] && rateLow <= price[1];
      const inRating = p.rating >= minRating;
      const inTier = tier === "any" || p.tier === tier;
      return inLoc && inType && inPrice && inRating && inTier;
    });
  }, [params, price, minRating, tier]);

  const [page, setPage] = useState(1);
  const perPage = 6;
  const paged = useMemo(()=> filtered.slice((page-1)*perPage, page*perPage), [filtered, page]);

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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
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
          {paged.map(p => <PainterCard key={p.id} painter={p} />)}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No painters match your filters. Try adjusting them.</p>
          )}
        </div>
        {filtered.length > perPage && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="rounded-full border px-3 py-1 text-sm" onClick={()=>setPage(Math.max(1, page-1))}>Prev</button>
            <span className="text-xs text-muted-foreground">Page {page} / {Math.ceil(filtered.length/perPage)}</span>
            <button className="rounded-full border px-3 py-1 text-sm" onClick={()=>setPage(Math.min(Math.ceil(filtered.length/perPage), page+1))}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
}
