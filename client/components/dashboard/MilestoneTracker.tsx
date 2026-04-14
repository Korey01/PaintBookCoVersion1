import { useState } from "react";
import { supabase, Job, JobMilestone, MilestoneStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  ChevronLeft,
  Send,
  MessageSquare,
} from "lucide-react";

// ── Status config ─────────────────────────────────────────────────────────────

const MILESTONE_STATUS: Record<
  MilestoneStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-4 w-4" />,
    color: "text-gray-500",
  },
  submitted: {
    label: "Submitted",
    icon: <Send className="h-4 w-4" />,
    color: "text-blue-600",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-600",
  },
  paid: {
    label: "Paid",
    icon: <DollarSign className="h-4 w-4" />,
    color: "text-teal-600",
  },
  disputed: {
    label: "Disputed",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-red-600",
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface MilestoneTrackerProps {
  job: Job;
  milestones: JobMilestone[];
  onBack: () => void;
  onRefresh: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MilestoneTracker({
  job,
  milestones,
  onBack,
  onRefresh,
}: MilestoneTrackerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [changesNotes, setChangesNotes] = useState<Record<string, string>>({});
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const totalAmount = milestones.reduce((s, m) => s + m.amount, 0);
  const approvedAmount = milestones
    .filter((m) => m.status === "approved" || m.status === "paid")
    .reduce((s, m) => s + m.amount, 0);
  const completionPct =
    totalAmount > 0 ? Math.round((approvedAmount / totalAmount) * 100) : 0;

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function approveMilestone(milestone: JobMilestone) {
    setLoading(milestone.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("approve-milestone", {
        body: {
          milestone_id: milestone.id,
          customer_notes: changesNotes[milestone.id] ?? null,
        },
      });

      if (res.error) throw new Error(res.error.message);
      showToast("Milestone approved. Payment release will be processed.");
      setChangesNotes((prev) => {
        const n = { ...prev };
        delete n[milestone.id];
        return n;
      });
      onRefresh();
    } catch (err) {
      showToast((err as Error).message ?? "Failed to approve milestone", "err");
    } finally {
      setLoading(null);
    }
  }

  async function requestChanges(milestone: JobMilestone) {
    const notes = changesNotes[milestone.id]?.trim();
    if (!notes) {
      showToast("Please describe the changes needed.", "err");
      return;
    }
    setLoading(milestone.id);
    try {
      const res = await supabase.functions.invoke("request-milestone-changes", {
        body: {
          milestone_id: milestone.id,
          customer_notes: notes,
        },
      });
      if (res.error) throw new Error(res.error.message);
      showToast("Changes requested. The painter has been notified.");
      setChangesNotes((prev) => {
        const n = { ...prev };
        delete n[milestone.id];
        return n;
      });
      setShowNotesFor(null);
      onRefresh();
    } catch (err) {
      showToast((err as Error).message ?? "Failed to send request", "err");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
            toast.type === "ok" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Jobs
        </button>
        <span className="text-gray-300">|</span>
        <h2
          className="text-lg font-semibold"
          style={{ color: "#1B3A5C" }}
        >
          {job.title}
        </h2>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Overall Completion
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: "#2E75B6" }}
          >
            {completionPct}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completionPct}%`,
              backgroundColor: "#2E75B6",
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>
            £{approvedAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })} approved
          </span>
          <span>
            £{totalAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })} total
          </span>
        </div>
      </div>

      {/* Milestone list */}
      {milestones.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No milestones have been set for this job yet.
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-200 z-0" />

          <div className="flex flex-col gap-5">
            {milestones.map((m, idx) => {
              const cfg = MILESTONE_STATUS[m.status];
              const isLast = idx === milestones.length - 1;
              const isSubmitted = m.status === "submitted";
              const isApproved =
                m.status === "approved" || m.status === "paid";

              return (
                <div key={m.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isApproved
                        ? "bg-green-50 border-green-500"
                        : isSubmitted
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <span className={`${cfg.color}`}>{cfg.icon}</span>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Milestone {m.milestone_number}
                        </span>
                        <h4
                          className="font-semibold text-sm mt-0.5"
                          style={{ color: "#1B3A5C" }}
                        >
                          {m.name}
                        </h4>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold" style={{ color: "#1B3A5C" }}>
                          £{m.amount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                        </div>
                        <span
                          className={`text-xs font-semibold ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-xs text-gray-500 mt-1 mb-2">
                        {m.description}
                      </p>
                    )}

                    {/* Dates */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-3">
                      {m.submitted_at && (
                        <span>
                          Submitted:{" "}
                          {format(new Date(m.submitted_at), "d MMM yyyy")}
                        </span>
                      )}
                      {m.approved_at && (
                        <span>
                          Approved:{" "}
                          {format(new Date(m.approved_at), "d MMM yyyy")}
                        </span>
                      )}
                    </div>

                    {/* Painter notes */}
                    {m.painter_notes && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800 mb-3">
                        <strong>Painter note:</strong> {m.painter_notes}
                      </div>
                    )}

                    {/* Customer previous notes */}
                    {m.customer_notes && m.status !== "submitted" && (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600 mb-3">
                        <strong>Your note:</strong> {m.customer_notes}
                      </div>
                    )}

                    {/* Actions for submitted milestones */}
                    {isSubmitted && (
                      <div className="flex flex-col gap-2 mt-2">
                        {showNotesFor !== m.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveMilestone(m)}
                              disabled={loading === m.id}
                              className="text-xs text-white"
                              style={{
                                backgroundColor: "#2E75B6",
                                borderColor: "#2E75B6",
                              }}
                            >
                              {loading === m.id
                                ? "Processing…"
                                : "Approve Milestone"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowNotesFor(m.id)}
                              className="text-xs border-gray-300 gap-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              Request Changes
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Textarea
                              placeholder="Describe the changes needed…"
                              rows={2}
                              className="text-xs resize-none"
                              value={changesNotes[m.id] ?? ""}
                              onChange={(e) =>
                                setChangesNotes((prev) => ({
                                  ...prev,
                                  [m.id]: e.target.value,
                                }))
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => requestChanges(m)}
                                disabled={loading === m.id}
                                className="text-xs text-white"
                                style={{
                                  backgroundColor: "#1B3A5C",
                                }}
                              >
                                {loading === m.id ? "Sending…" : "Send Request"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowNotesFor(null)}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
