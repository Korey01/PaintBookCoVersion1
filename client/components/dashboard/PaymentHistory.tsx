import { Job } from "@/lib/supabase";
import { format } from "date-fns";
import { PoundSterling, Receipt } from "lucide-react";

// ── Commission calculation helper ─────────────────────────────────────────────

function commissionRate(completedJobIndex: number): number {
  if (completedJobIndex < 5) return 0.12;
  if (completedJobIndex < 10) return 0.1;
  return 0.08;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PaymentHistoryProps {
  jobs: Job[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentHistory({ jobs }: PaymentHistoryProps) {
  // Include jobs that have a price (completed, in_progress, escrow_funded)
  const paymentJobs = jobs.filter(
    (j) =>
      (j.total_price ?? j.budget) != null &&
      j.status !== "pending_match" &&
      j.status !== "matching_in_progress" &&
      j.status !== "cancelled",
  );

  const totalSpent = paymentJobs
    .filter((j) => j.status === "completed")
    .reduce((s, j) => s + (j.total_price ?? j.budget ?? 0), 0);

  // Sort by date descending
  const sorted = [...paymentJobs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Summary card */}
      <div
        className="flex items-center gap-4 p-5 rounded-xl mb-6 text-white"
        style={{ backgroundColor: "#1B3A5C" }}
      >
        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
          <PoundSterling className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-white/70">Total Spent</p>
          <p className="text-2xl font-bold">
            £
            {totalSpent.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            Across {paymentJobs.filter((j) => j.status === "completed").length}{" "}
            completed job
            {paymentJobs.filter((j) => j.status === "completed").length !== 1
              ? "s"
              : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No payment records yet.</p>
          <p className="text-xs mt-1">
            Payments will appear here once a job is confirmed.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table
            className="w-full text-sm border-collapse"
            style={{ minWidth: "640px" }}
          >
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Job
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Painter
                </th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Amount Paid
                </th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Commission
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Transpact ID
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((job, idx) => {
                const amount = job.total_price ?? job.budget ?? 0;
                // Estimate commission based on job order (approximation without full history)
                const completedBefore = sorted
                  .slice(0, idx)
                  .filter((j) => j.status === "completed").length;
                const rate =
                  job.status === "completed"
                    ? commissionRate(completedBefore)
                    : 0;
                const commission = job.status === "completed" ? amount * rate : 0;

                return (
                  <tr
                    key={job.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <p
                        className="font-medium truncate max-w-[160px]"
                        style={{ color: "#1B3A5C" }}
                      >
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-400">{job.type}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">
                      {job.painter_name ?? (
                        <span className="text-gray-300">Not assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      £
                      {amount.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-gray-500 tabular-nums">
                      {job.status === "completed" ? (
                        <>
                          £
                          {commission.toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          <span className="text-gray-400">
                            ({Math.round(rate * 100)}%)
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(job.created_at), "d MMM yyyy")}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono">
                      {job.transpact_transaction_id ? (
                        <span className="text-teal-700">
                          {job.transpact_transaction_id}
                        </span>
                      ) : (
                        <span className="text-amber-500">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusPill status={job.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Inline status pill ────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    escrow_funded: "bg-teal-100 text-teal-700",
    in_progress: "bg-blue-100 text-blue-700",
    pending_completion: "bg-green-50 text-green-600",
    awaiting_payment: "bg-amber-100 text-amber-700",
    disputed: "bg-red-100 text-red-700",
    painter_accepted: "bg-purple-100 text-purple-700",
    milestone_review: "bg-orange-100 text-orange-700",
  };
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const cls = map[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}
