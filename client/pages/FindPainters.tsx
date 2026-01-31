import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import PainterCard from "@/components/site/PainterCard";
import { RoomDimensions, type Room } from "@/components/site/RoomDimensions";
import { painters } from "@/data/painters";
import { MapPin, PaintBucket, Search as SearchIcon, Info } from "lucide-react";
import { getCityCoord, haversineKm } from "@/lib/geo";

export default function FindPainters() {
  useEffect(()=>{ document.title = "Find A Painter/Decorator | PaintBook"; },[]);
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const [queryLocation, setQueryLocation] = useState<string>(params.get("location") || "");
  const [queryType, setQueryType] = useState<string>(params.get("type") || "");

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('paintbook:rooms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('paintbook:rooms', JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  const [price, setPrice] = useState<number[]>([15, 40]);
  const [minRating, setMinRating] = useState(4);
  const [available, setAvailable] = useState(true);
  const [tier, setTier] = useState<string>("any");

  const [sortBy, setSortBy] = useState<string>("rating_desc");

  const filtered = useMemo(() => {
    const loc = params.get("location")?.toLowerCase() || "";
    const rawType = params.get("type")?.toLowerCase() || "";
    const type = rawType === "any" ? "" : rawType;
    return painters.filter(p => {
      const inLoc = !loc || p.location.toLowerCase().includes(loc);
      const inType = !type || p.skills.some(s => s.toLowerCase().includes(type));
      const rateLow = parseInt(p.priceRange.replace(/[^0-9]/g, "").slice(0,2));
      const inPrice = rateLow >= price[0] && rateLow <= price[1];
      const inRating = p.rating >= minRating;
      const inTier = tier === "any" || p.tier === tier;
      const inAvail = !available || (p.availability?.includes("This week") ?? false);
      return inLoc && inType && inPrice && inRating && inTier && inAvail;
    });
  }, [params, price, minRating, tier]);

  const [page, setPage] = useState(1);
  const perPage = 6;
  const sorted = useMemo(()=> {
    const firstNum = (s:string)=> Number((s.match(/\d+/)||["0"])[0]);
    const arr = [...filtered];
    if(sortBy === 'rating_desc') arr.sort((a,b)=> b.rating - a.rating);
    else if(sortBy === 'price_asc') arr.sort((a,b)=> firstNum(a.priceRange) - firstNum(b.priceRange));
    else if(sortBy === 'price_desc') arr.sort((a,b)=> firstNum(b.priceRange) - firstNum(a.priceRange));
    else if(sortBy === 'reviews_desc') arr.sort((a,b)=> b.reviews - a.reviews);
    return arr;
  }, [filtered, sortBy]);
  // Distance fallback when no exact location match
  const { nearestSorted, distancesMap, usingFallback, nearestLabel } = useMemo(() => {
    const locRaw = params.get('location') || '';
    const loc = locRaw.trim();
    if (!loc) return { nearestSorted: sorted, distancesMap: new Map<string, number>(), usingFallback: false, nearestLabel: '' };

    if (sorted.length > 0) return { nearestSorted: sorted, distancesMap: new Map<string, number>(), usingFallback: false, nearestLabel: '' };

    const rawType = params.get("type")?.toLowerCase() || "";
    const type = rawType === "any" ? "" : rawType;
    const candidates = painters.filter(p => {
      const rateLow = parseInt(p.priceRange.replace(/[^0-9]/g, "").slice(0,2));
      const inPrice = rateLow >= price[0] && rateLow <= price[1];
      const inRating = p.rating >= minRating;
      const inTier = tier === "any" || p.tier === tier;
      const inAvail = !available || (p.availability?.includes("This week") ?? false);
      const inType = !type || p.skills.some(s => s.toLowerCase().includes(type));
      return inType && inPrice && inRating && inTier && inAvail;
    });

    const src = getCityCoord(loc);
    const map = new Map<string, number>();
    if (src) {
      candidates.forEach(p => {
        const dst = getCityCoord(p.location);
        if (dst) {
          const d = haversineKm(src, dst);
          map.set(p.id, d);
        }
      });
    }

    const withDist = [...candidates].sort((a,b)=> (map.get(a.id) ?? Number.POSITIVE_INFINITY) - (map.get(b.id) ?? Number.POSITIVE_INFINITY));

    return { nearestSorted: withDist, distancesMap: map, usingFallback: true, nearestLabel: loc };
  }, [params, sorted, price, minRating, tier, available]);

  const paged = useMemo(()=> nearestSorted.slice((page-1)*perPage, page*perPage), [nearestSorted, page]);

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="rounded-xl border bg-card/70 p-4 text-sm backdrop-blur">
        <p className="font-semibold">Trusted painters. Escrow-protected bookings.</p>
        <p className="mt-1">Hire verified painters you can trust</p>
        <p className="mt-1 text-muted-foreground">Compare painters by ratings, skills and price. Enjoy 100% escrow protection — your full payment is held securely until you approve the job (via Stripe (FCA-regulated payment partner)).</p>
      </div>
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <aside className="space-y-6 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button className="text-xs underline" onClick={()=>{ setPrice([15,40]); setMinRating(4); setTier("any"); setAvailable(true); setPage(1); }}>Clear all</button>
        </div>
        <div className="space-y-3">
          <Label className="text-sm">Price per hour (£{price[0]}��£{price[1]})</Label>
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
          <Label className="text-sm">Sort by</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating_desc">Rating (high → low)</SelectItem>
              <SelectItem value="price_asc">Price (low → high)</SelectItem>
              <SelectItem value="price_desc">Price (high → low)</SelectItem>
              <SelectItem value="reviews_desc">Reviews (many → few)</SelectItem>
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

        <div className="border-t pt-6">
          <RoomDimensions rooms={rooms} onRoomsChange={setRooms} />
        </div>
      </aside>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Painters or decorators {params.get("location") ? `in ${params.get("location")}` : "near you"}</h1>
            <p className="text-sm text-muted-foreground">Search by postcode/city and refine with filters.</p>
            {usingFallback && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-md border bg-secondary px-3 py-1 text-xs text-foreground">
                <Info className="h-3.5 w-3.5"/>
                No painters found in {nearestLabel}. Showing the closest matches by distance.
              </div>
            )}
          </div>
        </div>

        <form
          className="mt-4 grid gap-3 rounded-xl border bg-card/80 p-3 backdrop-blur md:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(e)=>{ e.preventDefault(); const q = new URLSearchParams(search); if(queryLocation){ q.set('location', queryLocation); } else { q.delete('location'); } if(queryType && queryType !== 'any'){ q.set('type', queryType); } else { q.delete('type'); } navigate(`/find-painter?${q.toString()}`); setPage(1); }}>
          <div className="flex items-center gap-2 rounded-lg bg-background p-2">
            <MapPin className="h-4 w-4 text-muted-foreground"/>
            <Input name="location" placeholder="Postcode or city" value={queryLocation} onChange={(e)=>setQueryLocation(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-background p-2">
            <PaintBucket className="h-4 w-4 text-muted-foreground"/>
            <Select value={queryType} onValueChange={setQueryType}>
              <SelectTrigger className="border-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="exterior">Exterior</SelectItem>
                <SelectItem value="kitchen">Kitchen cabinets</SelectItem>
                <SelectItem value="wallpaper">Wallpaper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-md hover:opacity-90">
            <SearchIcon className="mr-2 h-4 w-4"/> Search
          </button>
          <button type="button" onClick={() => navigate('/post-job')} className="inline-flex items-center justify-center rounded-md border px-5 py-2 text-sm font-medium shadow-md hover:bg-accent/30">
            Post a job
          </button>
        </form>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map(p => <PainterCard key={p.id} painter={p} distanceKm={distancesMap.get(p.id)} />)}
          {nearestSorted.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No painters match your filters. Try adjusting them.</p>
          )}
        </div>
        {nearestSorted.length > perPage && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="rounded-md border px-3 py-1 text-sm" onClick={()=>setPage(Math.max(1, page-1))}>Prev</button>
            <span className="text-xs text-muted-foreground">Page {page} / {Math.ceil(filtered.length/perPage)}</span>
            <button className="rounded-md border px-3 py-1 text-sm" onClick={()=>setPage(Math.min(Math.ceil(filtered.length/perPage), page+1))}>Next</button>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
