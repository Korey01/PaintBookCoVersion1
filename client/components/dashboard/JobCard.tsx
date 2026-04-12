import { Job, JobStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, PoundSterling } from "lucide-react";
import { format } from "date-fns";

// ── Status metadata ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending_match: {
    label: "Job Posted",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
  matching_in_progress: {
    label: "Matching in Progress",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  painter_accepted: {
    label: "Painter Accepted",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  escrow_funded: {
    label: "Escrow Funded",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  milestone_review: {
    label: "Milestone Review",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  pending_completion: {
    label: "Pending Completion",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  completed: {
    label: "Completed",
    color: "text-white",
    bg: "bg-green-600",
    border: "border-green-600",
  },
  disputed: {
    label: "Disputed",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  hasReview?: boolean;
  onPayNow?: (job: Job) => void;
  onViewProgress?: (job: Job) => void;
  onConfirmComplete?: (job: Job) => void;
  onLeaveReview?: (job: Job) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function JobCard({
  job,
  hasReview = false,
  onPayNow,
  onViewProgress,
  onConfirmComplete,
  onLeaveReview,
}: JobCardProps) {
  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending_match;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
      style={{ fontFamily: "Arial, system-ui, sans-serif" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-base truncate"
            style={{ color: "#1B3A5C" }}
          >
            {job.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{job.type}</p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.bg} ${cfg.color} ${cfg.border}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Posted {format(new Date(job.created_at), "d MMM yyyy")}
        </span>
        {job.property_address && (
          <span className="flex items-center gap-1 truncate max-w-[180px]">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {job.property_address}
          </span>
        )}
        {job.painter_name && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {job.painter_name}
          </span>
        )}
        {(job.total_price ?? job.budget) != null && (
          <span className="flex items-center gap-1 font-medium text-gray-700">
            <PoundSterling className="h-3 w-3" />
            {(job.total_price ?? job.budget)!.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {job.status === "awaiting_payment" && (
          <Button
            size="sm"
            onClick={() => onPayNow?.(job)}
            className="text-white text-xs"
            style={{ backgroundColor: "#2E75B6", borderColor: "#2E75B6" }}
          >
            Pay Now
          </Button>
        )}
        {(job.status === "in_progress" || job.status === "milestone_review" || job.status === "escrow_funded") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewProgress?.(job)}
            className="text-xs border-gray-300"
          >
            View Progress
          </Button>
        )}
        {job.status === "pending_completion" && (
          <Button
            size="sm"
            onClick={() => onConfirmComplete?.(job)}
            className="text-white text-xs bg-green-600 hover:bg-green-700 border-green-600"
          >
            Confirm Complete
          </Button>
        )}
        {job.status === "completed" && !hasReview && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onLeaveReview?.(job)}
            className="text-xs"
            style={{ color: "#2E75B6", borderColor: "#2E75B6" }}
          >
            Leave Review
          </Button>
        )}
      </div>
    </div>
  );
}
