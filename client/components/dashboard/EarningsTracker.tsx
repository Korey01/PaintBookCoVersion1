import { Job } from "@/lib/supabase";
import { format, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { TrendingUp, PoundSterling, Award } from "lucide-react";

interface EarningsTrackerProps {
  jobs: Job[];
  completedJobs: number; // painter's total from painters table
}

function commissionRate(jobIndex: number): number {
  if (jobIndex < 5) return 0.12;
  if (jobIndex < 10) return 0.10;
  return 0.08;
}

export default function EarningsTracker({ jobs, completedJobs }: EarningsTrackerProps) {
  const completed = jobs
    .filter((j) => j.status === "completed")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const now      = new Date();
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  let totalEarned   = 0;
  let thisMonth     = 0;
  let thisWeek      = 0;
  let totalSaved    = 0; // vs always paying 12%

  const rows = completed.map((job, idx) => {
    const gross  = job.total_price ?? job.budget ?? 0;
    const rate   = commissionRate(idx);
    const commission = gross * rate;
    const net    = gross - commission;
    const saved  = gross * 0.12 - commission; // savings vs 12%

    totalEarned += net;
    totalSaved  += saved;
    if (isAfter(new Date(job.created_at), monthStart)) thisMonth += net;
    if (isAfter(new Date(job.created_at), weekStart))  thisWeek  += net;

    return { job, gross, rate, commission, net };
  });

  const fmt = (n: number) =>
    `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Total Earned" value={fmt(totalEarned)} icon={<PoundSterling className="h-5 w-5" />} />
        <SummaryCard label="This Month"   value={fmt(thisMonth)}   icon={<TrendingUp className="h-5 w-5" />} />
        <SummaryCard label="This Week"    value={fmt(thisWeek)}    icon={<Award className="h-5 w-5" />} />
      </div>

      {/* Commission savings */}
      {totalSaved > 0 && (
        <div className="mb-6 bg-dashboard-painter-success/10 border border-dashboard-painter-success/30 rounded-xl px-5 py-4 flex items-start gap-3">
          <Award className="h-5 w-5 text-dashboard-painter-success mt-0.5 flex-shrink-0" />
          <p className="text-sm text-dashboard-painter-success">
            By completing{" "}
            <strong>{completedJobs} job{completedJobs !== 1 ? "s" : ""}</strong> you have
            saved{" "}
            <strong>{fmt(totalSaved)}</strong> in commission compared to the 12% starting rate.
          </p>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="text-center py-16 text-dashboard-painter-text-secondary">
          <PoundSterling className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No earnings yet.</p>
          <p className="text-xs mt-1">Completed jobs will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm border-collapse" style={{ minWidth: "680px" }}>
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {["Job", "Date", "Gross", "Commission", "Net Payout", "Transpact ID"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-dashboard-painter-text-secondary uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map(({ job, gross, rate, commission, net }) => (
                <tr key={job.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-medium text-sm truncate max-w-[160px] text-white">
                      {job.title}
                    </p>
                    <p className="text-xs text-dashboard-painter-text-secondary">{job.type}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-dashboard-painter-text-secondary whitespace-nowrap">
                    {format(new Date(job.created_at), "d MMM yyyy")}
                  </td>
                  <td className="py-3 px-3 text-sm font-semibold tabular-nums">
                    {fmt(gross)}
                  </td>
                  <td className="py-3 px-3 text-xs text-dashboard-painter-danger tabular-nums">
                    −{fmt(commission)}{" "}
                    <span className="text-dashboard-painter-text-secondary">({Math.round(rate * 100)}%)</span>
                  </td>
                  <td className="py-3 px-3 text-sm font-bold tabular-nums text-dashboard-painter-success">
                    {fmt(net)}
                  </td>
                  <td className="py-3 px-3 text-xs font-mono">
                    {job.transpact_transaction_id ? (
                      <span className="text-dashboard-painter-accent">{job.transpact_transaction_id}</span>
                    ) : (
                      <span className="text-dashboard-painter-warning">Processing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="dashboard-painter-card border-white/10 rounded-xl p-5 flex items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-black bg-dashboard-painter-accent">
        {icon}
      </div>
      <div>
        <p className="text-xs text-dashboard-painter-text-secondary">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
