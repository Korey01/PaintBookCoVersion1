import { useState } from "react";
import { supabase, Job, JobMilestone } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PayoutCalculator from "./PayoutCalculator";
import {
  CheckCircle2, Clock, AlertTriangle, DollarSign,
  Send, ChevronLeft, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

// ── Status config ─────────────────────────────────────────────
const STATUS_DOT: Record<string, { color: string; label: string }> = {
  pending:   { color: "bg-gray-400",   label: "Not submitted" },
  submitted: { color: "bg-amber-400",  label: "Awaiting approval" },
  approved:  { color: "bg-blue-500",   label: "Approved" },
  paid:      { color: "bg-green-500",  label: "Paid" },
  disputed:  { color: "bg-red-500",    label: "Disputed" },
};

interface MilestoneSubmissionProps {
  job: Job;
  milestones: JobMilestone[];
  completedJobsBefore: number;
  onBack: () => void;
  onRefresh: () => void;
}

export default function MilestoneSubmission({
  job,
  milestones,
  completedJobsBefore,
  onBack,
  onRefresh,
}: MilestoneSubmissionProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [openFormId, setOpenFormId]   = useState<string | null>(null);
  const [notes, setNotes]             = useState<Record<string, string>>({});
  const [confirmed, setConfirmed]     = useState<Record<string, boolean>>({});
  const [toast, setToast]             = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const total      = milestones.reduce((s, m) => s + m.amount, 0);
  const paidCount  = milestones.filter((m) => m.status === "paid").length;
  const pct        = milestones.length > 0 ? Math.round((paidCount / milestones.length) * 100) : 0;
  const grossValue = job.total_price ?? job.budget ?? total;

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function submitMilestone(m: JobMilestone) {
    const note = notes[m.id]?.trim();
    if (!note) { showToast("Completion notes are required.", "err"); return; }
    if (!confirmed[m.id]) { showToast("Please confirm the milestone is complete.", "err"); return; }

    setSubmittingId(m.id);
    try {
      const res = await supabase.functions.invoke("submit-milestone", {
        body: { milestone_id: m.id, painter_notes: note },
      });
      if (res.error) throw new Error(res.error.message);
      showToast("Milestone submitted. The customer will be notified to review.");
      setOpenFormId(null);
      setNotes((p) => { const n = { ...p }; delete n[m.id]; return n; });
      setConfirmed((p) => { const n = { ...p }; delete n[m.id]; return n; });
      onRefresh();
    } catch (err) {
      showToast((err as Error).message ?? "Failed to submit milestone.", "err");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${toast.type === "ok" ? "bg-dashboard-painter-success" : "bg-dashboard-painter-danger"}`}>
          {toast.msg}
        </div>
      )}

      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-dashboard-painter-text-secondary hover:text-dashboard-painter-text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Jobs
        </button>
        <span className="text-white/30">|</span>
        <h2 className="text-lg font-semibold text-white">{job.title}</h2>
      </div>

      {/* Progress bar */}
      <div className="dashboard-painter-card border-white/10 rounded-xl p-5 mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-white">Milestone Progress</span>
          <span className="font-bold text-dashboard-painter-accent">{pct}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 bg-dashboard-painter-accent" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-dashboard-painter-text-secondary mt-2">{paidCount} of {milestones.length} milestones paid</p>
      </div>

      {/* Payout calculator */}
      <div className="mb-5">
        <PayoutCalculator
          grossJobValue={grossValue}
          completedJobs={completedJobsBefore}
          milestones={milestones}
        />
      </div>

      {/* Milestone list */}
      <h3 className="text-sm font-semibold mb-3 text-white">Milestones</h3>
      {milestones.length === 0 ? (
        <p className="text-sm text-dashboard-painter-text-secondary text-center py-8">No milestones set for this job yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {milestones.map((m) => {
            const cfg = STATUS_DOT[m.status] ?? STATUS_DOT.pending;
            return (
              <div key={m.id} className="dashboard-painter-card border-white/10 rounded-xl p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.color}`} />
                    <div>
                      <span className="text-xs text-dashboard-painter-text-secondary font-semibold uppercase tracking-wide">
                        Milestone {m.milestone_number}
                      </span>
                      <p className="font-semibold text-sm text-white">{m.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-white">
                      £{m.amount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-semibold`} style={{ color: m.status === "paid" ? "#22c55e" : m.status === "approved" ? "#3b82f6" : m.status === "disputed" ? "#ef4444" : m.status === "submitted" ? "#f59e0b" : "#9ca3af" }}>
                      {cfg.label}
                    </p>
                  </div>
                </div>

                {m.description && <p className="text-xs text-dashboard-painter-text-secondary mb-2">{m.description}</p>}

                {/* Dates */}
                <div className="flex flex-wrap gap-x-4 text-xs text-dashboard-painter-text-secondary mb-3">
                  {m.submitted_at && <span>Submitted: {format(new Date(m.submitted_at), "d MMM yyyy")}</span>}
                  {m.approved_at  && <span>Approved: {format(new Date(m.approved_at),  "d MMM yyyy")}</span>}
                  {m.paid_at      && <span>Paid: {format(new Date(m.paid_at), "d MMM yyyy")}</span>}
                </div>

                {/* State-specific content */}
                {m.status === "pending" && openFormId !== m.id && (
                  <Button size="sm" onClick={() => setOpenFormId(m.id)} className="dashboard-painter-accent text-black text-xs gap-1 hover:opacity-90">
                    <Send className="h-3 w-3" /> Submit Milestone
                  </Button>
                )}

                {m.status === "pending" && openFormId === m.id && (
                  <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-white/10">
                    <div>
                      <label className="text-xs font-medium text-dashboard-painter-text-primary mb-1.5 block">
                        Completion Notes <span className="text-dashboard-painter-danger">*</span>
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Describe what was completed, any materials used, and confirm the work meets the agreed standard…"
                        className="text-xs resize-none bg-white/5 border border-white/20 text-white placeholder:text-white/40"
                        value={notes[m.id] ?? ""}
                        onChange={(e) => setNotes((p) => ({ ...p, [m.id]: e.target.value }))}
                      />
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed[m.id] ?? false}
                        onChange={(e) => setConfirmed((p) => ({ ...p, [m.id]: e.target.checked }))}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs text-dashboard-painter-text-secondary">
                        I confirm this milestone has been completed to the agreed standard.
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => submitMilestone(m)} disabled={submittingId === m.id} className="dashboard-painter-accent text-black text-xs hover:opacity-90">
                        {submittingId === m.id ? "Submitting…" : "Submit for Approval"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setOpenFormId(null)} className="text-xs border-white/20 text-white hover:bg-white/5">Cancel</Button>
                    </div>
                  </div>
                )}

                {m.status === "submitted" && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    Awaiting customer approval
                  </div>
                )}

                {m.status === "approved" && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-dashboard-painter-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approved — payment processing
                  </div>
                )}

                {m.status === "paid" && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-dashboard-painter-success">
                    <DollarSign className="h-3.5 w-3.5" />
                    Payment released
                    {m.transpact_release_id && (
                      <span className="text-dashboard-painter-text-secondary font-mono">· {m.transpact_release_id}</span>
                    )}
                  </div>
                )}

                {m.status === "disputed" && (
                  <div className="mt-2">
                    {m.customer_notes && (
                      <div className="bg-dashboard-painter-danger/10 border border-dashboard-painter-danger/30 rounded-lg px-3 py-2 text-xs text-dashboard-painter-danger mb-2">
                        <strong>Customer concern:</strong> {m.customer_notes}
                      </div>
                    )}
                    <a href="mailto:hello@paintbookco.co.uk" className="inline-flex items-center gap-1 text-xs text-dashboard-painter-accent hover:opacity-80">
                      <ExternalLink className="h-3 w-3" /> Contact Support
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
