// Required migration: ALTER TABLE painters ADD COLUMN IF NOT EXISTS profile_picture_url text;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShieldCheck, BadgeCheck, ArrowRight, Loader2 } from "lucide-react";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function InitialsAvatar({ name, size = 96 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colours = ["bg-orange-500","bg-blue-500","bg-green-500","bg-purple-500","bg-rose-500"];
  const colour = colours[name.charCodeAt(0) % colours.length];
  return (
    <div
      className={`${colour} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function PainterProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [painter, setPainter] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);
    const [{ data: p }, { data: r }, { data: g }] = await Promise.all([
      supabase
        .from("painters")
        .select("id, first_name, last_name, postcode, city, specialisms, bio, avg_rating, completed_jobs, profile_picture_url, kyc_status, is_active, insurance_verified")
        .eq("id", id!)
        .eq("kyc_status", "approved")
        .eq("is_active", true)
        .single(),
      supabase
        .from("reviews")
        .select("id, rating, review_text, created_at")
        .eq("painter_id", id!)
        .order("created_at", { ascending: false }),
      supabase
        .from("painter_gallery")
        .select("id, image_url, caption")
        .eq("painter_id", id!)
        .order("uploaded_at", { ascending: false }),
    ]);
    setPainter(p);
    setReviews(r || []);
    setGallery(g || []);
    setLoading(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (!painter) return (
    <div className="container mx-auto px-4 py-16">
      <p className="text-sm text-muted-foreground">Painter not found or profile not active.</p>
    </div>
  );

  const displayName = `${painter.first_name} ${painter.last_name}`;
  const avgRating = painter.avg_rating || 0;
  const totalReviews = reviews.length;

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Gallery" className="max-h-[90vh] max-w-[90vw] rounded object-contain" />
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div>
          {/* Header: profile picture + name */}
          <div className="flex items-start gap-4 mb-4">
            {painter.profile_picture_url ? (
              <img
                src={painter.profile_picture_url}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <InitialsAvatar name={displayName} size={96} />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">
                {painter.city || painter.postcode?.split(" ")[0]}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {totalReviews > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarDisplay rating={avgRating} />
                    <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
                  </div>
                )}
                {painter.insurance_verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Insured
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 text-primary" /> ID Verified
                </span>
              </div>
            </div>
          </div>

          {painter.bio && <p className="mt-2 max-w-prose text-sm">{painter.bio}</p>}

          {/* Specialisms */}
          {painter.specialisms?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {painter.specialisms.map((s: string) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{painter.completed_jobs || 0}</strong> jobs completed</span>
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Portfolio</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setLightbox(img.image_url)}
                    className="focus:outline-none"
                    aria-label="View image"
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || "Portfolio"}
                      className="h-40 w-full rounded object-cover hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                    {img.caption && <p className="text-xs text-muted-foreground mt-1 text-left">{img.caption}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">
              Reviews
              {totalReviews > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  — {avgRating.toFixed(1)} avg from {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="grid gap-3">
                {reviews.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay rating={r.rating} />
                        <span className="text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <p>{r.review_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4 text-sm space-y-4">
              <Button className="w-full" onClick={() => navigate(`/post-job?painter=${painter.id}`)}>
                Request Quote
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate(`/post-job?painter=${painter.id}`)}>
                Contact Painter
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/vestimator")}>
                Attach Estimation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">Deposits are escrow-protected and released on completion.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
