/**
 * ReviewsList — Displays a painter's reviews with aggregate rating
 *
 * Fetches reviews directly from Supabase (public read policy required).
 * Shows the last 5 by default; a "Show all" toggle reveals the rest.
 */

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface ReviewsListProps {
  painterId: string;
  showAll?: boolean;
}

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={rating >= s ? "#1B3A5C" : "none"}
          stroke={rating >= s ? "#1B3A5C" : "#CBD5E1"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="animate-pulse space-y-2 p-4 border border-gray-100 rounded-xl">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded-sm" />
        ))}
      </div>
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMonth(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const INITIAL_LIMIT = 5;

export function ReviewsList({
  painterId,
  showAll: showAllProp = false,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(showAllProp);

  useEffect(() => {
    if (!painterId) return;

    async function fetchReviews() {
      setIsLoading(true);

      // Fetch total count and average in parallel with review rows
      const [countRes, reviewsRes] = await Promise.all([
        supabase
          .from("reviews")
          .select("rating", { count: "exact" })
          .eq("painter_id", painterId),
        supabase
          .from("reviews")
          .select("id, rating, review_text, created_at")
          .eq("painter_id", painterId)
          .order("created_at", { ascending: false }),
      ]);

      const allReviews = (reviewsRes.data ?? []) as Review[];
      const count = countRes.count ?? 0;

      // Compute average client-side from fetched rows
      const avg =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      setReviews(allReviews);
      setTotalCount(count);
      setAvgRating(Math.round(avg * 10) / 10);
      setIsLoading(false);
    }

    fetchReviews();
  }, [painterId]);

  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_LIMIT);
  const hasMore = reviews.length > INITIAL_LIMIT && !showAll;

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-1" />
          <div className="h-4 bg-gray-100 rounded w-24" />
        </div>
        {[...Array(3)].map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No reviews yet
      </div>
    );
  }

  // ── Review list ──────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Aggregate header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <span className="text-3xl font-bold text-[#1B3A5C]">
          {avgRating.toFixed(1)}
        </span>
        <div>
          <Stars rating={Math.round(avgRating)} size={20} />
          <p className="text-xs text-gray-500 mt-0.5">
            {totalCount} review{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3">
        {visibleReviews.map((review) => (
          <div
            key={review.id}
            className="p-4 border border-gray-100 rounded-xl bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <Stars rating={review.rating} size={15} />
              <span className="text-xs text-gray-400">
                {formatMonth(review.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {review.review_text}
            </p>
            <p className="text-xs text-gray-400 mt-2">Verified customer</p>
          </div>
        ))}
      </div>

      {/* Show all toggle */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2.5 text-sm font-medium text-[#1B3A5C] border border-[#1B3A5C] rounded-xl hover:bg-[#1B3A5C] hover:text-white transition-colors"
        >
          Show all {totalCount} reviews
        </button>
      )}
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  const { Builder } = await import("@builder.io/react");
  Builder.registerComponent(ReviewsList, {
    name: "ReviewsList",
    inputs: [
      { name: "painterId", type: "string" },
      { name: "showAll", type: "boolean" },
    ],
  });
})();
