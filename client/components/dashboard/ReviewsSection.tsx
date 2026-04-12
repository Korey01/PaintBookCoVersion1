import { useState } from "react";
import { supabase, Job, Review } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

// ── Star rating component ─────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const px = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <Star
            className={`${px} ${
              n <= active
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-100"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReviewsSectionProps {
  jobs: Job[];
  reviews: Review[];
  onRefresh: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewsSection({
  jobs,
  reviews,
  onRefresh,
}: ReviewsSectionProps) {
  const reviewedJobIds = new Set(reviews.map((r) => r.job_id));

  const pendingJobs = jobs.filter(
    (j) => j.status === "completed" && !reviewedJobIds.has(j.id),
  );

  const [activeJobId, setActiveJobId] = useState<string | null>(
    pendingJobs[0]?.id ?? null,
  );
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submitReview() {
    setError(null);
    if (!activeJobId) return;
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (text.trim().length < 20) {
      setError("Review must be at least 20 characters.");
      return;
    }

    const job = jobs.find((j) => j.id === activeJobId);
    if (!job) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated.");

      const { error: insertError } = await supabase.from("reviews").insert({
        job_id: activeJobId,
        customer_id: session.user.id,
        painter_id: job.painter_id ?? null,
        rating,
        review_text: text.trim(),
      });

      if (insertError) throw new Error(insertError.message);

      setSuccess("Review submitted. Thank you!");
      setRating(0);
      setText("");
      const remaining = pendingJobs.filter((j) => j.id !== activeJobId);
      setActiveJobId(remaining[0]?.id ?? null);
      onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* ── Pending reviews ─────────────────────────────────────── */}
      {pendingJobs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4" style={{ color: "#1B3A5C" }}>
            Leave a Review
          </h3>

          {/* Job selector (if multiple pending) */}
          {pendingJobs.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {pendingJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    setActiveJobId(j.id);
                    setRating(0);
                    setText("");
                    setError(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    activeJobId === j.id
                      ? "text-white border-transparent"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  style={
                    activeJobId === j.id
                      ? { backgroundColor: "#1B3A5C" }
                      : undefined
                  }
                >
                  {j.title}
                </button>
              ))}
            </div>
          )}

          {/* Review form */}
          {activeJobId && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              {(() => {
                const job = jobs.find((j) => j.id === activeJobId);
                return (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Reviewing:</p>
                    <p className="font-semibold text-sm mb-4" style={{ color: "#1B3A5C" }}>
                      {job?.title}
                      {job?.painter_name && (
                        <span className="text-gray-400 font-normal ml-1">
                          · {job.painter_name}
                        </span>
                      )}
                    </p>
                  </>
                );
              })()}

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </p>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Your Review <span className="text-red-500">*</span>{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (min. 20 characters)
                  </span>
                </label>
                <Textarea
                  rows={4}
                  placeholder="Share your experience with this painter — quality of work, professionalism, communication…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-right text-gray-400 mt-1">
                  {text.length}/20 minimum
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-600 mb-3">{error}</p>
              )}
              {success && (
                <p className="text-xs text-green-600 mb-3 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {success}
                </p>
              )}

              <Button
                onClick={submitReview}
                disabled={submitting}
                className="text-white text-sm"
                style={{ backgroundColor: "#1B3A5C" }}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Submitted reviews ───────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#1B3A5C" }}>
          Your Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 && pendingJobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reviews yet.</p>
            <p className="text-xs mt-1">
              Reviews will appear here after your first completed job.
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews submitted yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {[...reviews]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .map((r) => {
                const job = jobs.find((j) => j.id === r.job_id);
                return (
                  <div
                    key={r.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "#1B3A5C" }}
                        >
                          {job?.title ?? "Job"}
                        </p>
                        {job?.painter_name && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {job.painter_name}
                          </p>
                        )}
                      </div>
                      <StarRating value={r.rating} readOnly size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {r.review_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      {format(new Date(r.created_at), "d MMMM yyyy")}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
