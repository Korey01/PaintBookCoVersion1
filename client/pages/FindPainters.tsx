// Required migration: ALTER TABLE painters ADD COLUMN IF NOT EXISTS profile_picture_url text;

import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, PaintBucket, Search as SearchIcon, Star, BadgeCheck, ShieldCheck } from "lucide-react";

type Painter = {
  id: string;
  first_name: string;
  last_name: string;
  postcode: string | null;
  city: string | null;
  specialisms: string[] | null;
  bio: string | null;
  avg_rating: number | null;
  completed_jobs: number | null;
  profile_picture_url: string | null;
  kyc_status: string;
  is_active: boolean;
  insurance_verified: boolean;
  gallery?: { id: string; image_url: string }[];
};

function InitialsAvatar({ name, id }: { name: string; id: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colours = ["bg-orange-500","bg-blue-500","bg-green-500","bg-purple-500","bg-rose-500"];
  const colour = colours[id.charCodeAt(0) % colours.length];
  return (
    <div className={`${colour} w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

function PainterCard({ painter, navigate }: { painter: Painter; navigate: (to: string) => void }) {
  const displayName = `${painter.first_name} ${painter.last_name[0]}.`;
  const area = painter.city || painter.postcode?.split(" ")[0] || "UK";
  const rating = painter.avg_rating || 0;
  const jobs = painter.completed_jobs || 0;
  const gallery = painter.gallery || [];

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header: avatar + name */}
      <div className="flex items-center gap-3">
        {painter.profile_picture_url ? (
          <img src={painter.profile_picture_url} alt={displayName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <InitialsAvatar name={`${painter.first_name} ${painter.last_name}`} id={painter.id} />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {area}
          </p>
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">· {jobs} job{jobs !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery thumbnails */}
      {gallery.length > 0 && (
        <div className="flex gap-1.5">
          {gallery.slice(0, 3).map(img => (
            <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer" className="flex-shrink-0">
              <img
                src={img.image_url}
                alt="Gallery"
                className="w-16 h-16 rounded object-cover hover:opacity-90 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}

      {/* Specialisms */}
      {painter.specialisms && painter.specialisms.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {painter.specialisms.slice(0, 4).map(s => (
            <span key={s} className="text-xs bg-accent/60 text-foreground px-2 py-0.5 rounded-full">{s}</span>
          ))}
          {painter.specialisms.length > 4 && (
            <span className="text-xs text-muted-foreground px-1">+{painter.specialisms.length - 4}</span>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-primary" /> ID Verified</span>
        {painter.insurance_verified && (
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Insured</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => navigate(`/painter/${painter.id}`)}
          className="flex-1 rounded-md border border-border text-sm font-medium py-2 hover:bg-accent/40 transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={() => navigate("/post-job")}
          className="flex-1 rounded-md bg-foreground text-background text-sm font-medium py-2 hover:bg-foreground/90 transition-colors"
        >
          Post a Job
        </button>
      </div>
    </div>
  );
}

export default function FindPainters() {
  useEffect(() => { document.title = "Find A Painter/Decorator | PaintBook"; }, []);

  const { search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [allPainters, setAllPainters] = useState<Painter[]>([]);
  const [loadingPainters, setLoadingPainters] = useState(true);

  const [queryLocation, setQueryLocation] = useState(params.get("location") || "");
  const [queryType, setQueryType] = useState(params.get("type") || "");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("jobs_desc");
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => { loadPainters(); }, []);

  async function loadPainters() {
    setLoadingPainters(true);
    const { data: painters } = await supabase
      .from("painters")
      .select("id, first_name, last_name, postcode, city, specialisms, bio, avg_rating, completed_jobs, profile_picture_url, kyc_status, is_active, insurance_verified")
      .eq("kyc_status", "approved")
      .eq("is_active", true)
      .order("completed_jobs", { ascending: false });

    if (!painters) { setLoadingPainters(false); return; }

    // Fetch up to 3 gallery images per painter
    const ids = painters.map(p => p.id);
    const { data: gallery } = ids.length
      ? await supabase
          .from("painter_gallery")
          .select("id, painter_id, image_url")
          .in("painter_id", ids)
          .order("uploaded_at", { ascending: false })
      : { data: [] };

    const galleryMap = new Map<string, { id: string; image_url: string }[]>();
    (gallery || []).forEach((g: any) => {
      if (!galleryMap.has(g.painter_id)) galleryMap.set(g.painter_id, []);
      const arr = galleryMap.get(g.painter_id)!;
      if (arr.length < 3) arr.push({ id: g.id, image_url: g.image_url });
    });

    setAllPainters(painters.map(p => ({ ...p, gallery: galleryMap.get(p.id) || [] })));
    setLoadingPainters(false);
  }

  const filtered = useMemo(() => {
    const loc = (params.get("location") || queryLocation).toLowerCase().trim();
    const rawType = (params.get("type") || queryType).toLowerCase();
    const type = rawType === "any" ? "" : rawType;

    return allPainters.filter(p => {
      const inLoc = !loc ||
        (p.city || "").toLowerCase().includes(loc) ||
        (p.postcode || "").toLowerCase().startsWith(loc.toUpperCase());
      const inType = !type ||
        (p.specialisms || []).some(s => s.toLowerCase().includes(type));
      const inRating = !minRating || (p.avg_rating || 0) >= minRating;
      return inLoc && inType && inRating;
    });
  }, [allPainters, params, queryLocation, queryType, minRating]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "jobs_desc") arr.sort((a, b) => (b.completed_jobs || 0) - (a.completed_jobs || 0));
    else if (sortBy === "rating_desc") arr.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    return arr;
  }, [filtered, sortBy]);

  const paged = useMemo(() => sorted.slice((page - 1) * perPage, page * perPage), [sorted, page]);
  const totalPages = Math.ceil(sorted.length / perPage);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (queryLocation) q.set("location", queryLocation);
    if (queryType && queryType !== "any") q.set("type", queryType);
    navigate(`/find-painters?${q.toString()}`);
    setPage(1);
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="rounded-xl border bg-card/70 p-4 text-sm backdrop-blur">
        <p className="font-semibold">Trusted painters. Escrow-protected bookings.</p>
        <p className="mt-1 text-muted-foreground">
          Compare verified painters by ratings, skills and completed jobs. 100% escrow protection via Transpact.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="space-y-6 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              className="text-xs underline"
              onClick={() => { setMinRating(0); setSortBy("jobs_desc"); setPage(1); }}
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Minimum Rating</Label>
            <Select value={String(minRating)} onValueChange={v => { setMinRating(Number(v)); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Sort by</Label>
            <Select value={sortBy} onValueChange={v => { setSortBy(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jobs_desc">Most completed jobs</SelectItem>
                <SelectItem value="rating_desc">Highest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        <section>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              Painters &amp; decorators{params.get("location") ? ` in ${params.get("location")}` : " near you"}
            </h1>
            <p className="text-sm text-muted-foreground">Search by postcode or city and refine with filters.</p>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="grid gap-3 rounded-xl border bg-card/80 p-3 backdrop-blur md:grid-cols-[1fr_1fr_auto_auto]"
          >
            <div className="flex items-center gap-2 rounded-lg bg-background p-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Postcode or city"
                value={queryLocation}
                onChange={e => setQueryLocation(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background p-2">
              <PaintBucket className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={queryType} onValueChange={setQueryType}>
                <SelectTrigger className="border-0 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="wallpaper">Wallpaper</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-md hover:opacity-90">
              <SearchIcon className="mr-2 h-4 w-4" /> Search
            </button>
            <button type="button" onClick={() => navigate("/post-job")} className="inline-flex items-center justify-center rounded-md border px-5 py-2 text-sm font-medium shadow-md hover:bg-accent/30">
              Post a job
            </button>
          </form>

          {/* Results */}
          {loadingPainters ? (
            <div className="mt-8 flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paged.map(p => (
                  <PainterCard key={p.id} painter={p} navigate={navigate} />
                ))}
                {sorted.length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground py-8 text-center">
                    No verified painters match your search. Try a different location or job type.
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>
                  <button
                    className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
