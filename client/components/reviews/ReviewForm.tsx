/**
 * ReviewForm — 5-star rating + written review submission
 *
 * Calls the submit-review Edge Function. Enforces a 20-character
 * minimum on the review text and disables submit until both rating
 * and minimum text length are satisfied.
 */

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReviewFormProps {
  jobId: string;
  painterId: string;
  painterName: string;
  onSuccess: () => void;
}

// ── Star icon ─────────────────────────────────────────────────────────────────

function StarIcon({ filled, size = 32 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#1B3A5C" : "none"}
      stroke={filled ? "#1B3A5C" : "#CBD5E1"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const MIN_CHARS = 20;

export function ReviewForm({
  jobId,
  painterId,
  painterName,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const charCount = reviewText.trim().length;
  const remaining = Math.max(0, MIN_CHARS - charCount);
  const isValid = rating >= 1 && charCount >= MIN_CHARS;
  const displayRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    const { data, error: fnError } = await supabase.functions.invoke(
      "submit-review",
      {
        body: {
          job_id: jobId,
          painter_id: painterId,
          rating,
          review_text: reviewText.trim(),
        },
      },
    );

    setIsSubmitting(false);

    if (fnError || !data?.success) {
      setError(
        data?.error ??
          "Failed to submit review. Please try again.",
      );
      return;
    }

    setSubmitted(true);
    setTimeout(() => onSuccess(), 2000);
  };

  // ── Success state ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} filled={s <= rating} size={28} />
          ))}
        </div>
        <p className="text-lg font-semibold text-[#1B3A5C]">
          Thank you for your review!
        </p>
        <p className="text-sm text-gray-500">
          Your feedback helps other customers choose the right painter.
        </p>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          How would you rate {painterName}?
        </p>

        {/* Star selector */}
        <div
          className="flex gap-1"
          role="group"
          aria-label="Star rating"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
              aria-pressed={rating === star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A5C] rounded"
            >
              <StarIcon filled={displayRating >= star} />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Review textarea */}
      <div>
        <label
          htmlFor="review-text"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your review
        </label>
        <textarea
          id="review-text"
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={`Share details about your experience with ${painterName}…`}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] transition"
        />

        {/* Character counter */}
        <p
          className={`mt-1 text-xs ${
            remaining > 0 ? "text-amber-600" : "text-green-600"
          }`}
        >
          {remaining > 0
            ? `${MIN_CHARS} characters minimum — ${remaining} remaining`
            : `${MIN_CHARS} characters minimum ✓`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full py-3 px-6 rounded-xl text-sm font-semibold bg-[#1B3A5C] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2E75B6] transition-colors"
      >
        {isSubmitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  const { Builder } = await import("@builder.io/react");
  Builder.registerComponent(ReviewForm, {
    name: "ReviewForm",
    inputs: [
      { name: "jobId", type: "string" },
      { name: "painterId", type: "string" },
      { name: "painterName", type: "string" },
    ],
  });
})();
