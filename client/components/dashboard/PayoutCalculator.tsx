import { JobMilestone } from "@/lib/supabase";
import { TrendingDown, PoundSterling } from "lucide-react";

interface PayoutCalculatorProps {
  grossJobValue: number;
  completedJobs: number; // painter's total completed job count before this job
  milestones: JobMilestone[];
}

function commissionRate(completedJobsBefore: number): number {
  if (completedJobsBefore < 5) return 0.12;
  if (completedJobsBefore < 10) return 0.10;
  return 0.08;
}

export default function PayoutCalculator({
  grossJobValue,
  completedJobs,
  milestones,
}: PayoutCalculatorProps) {
  const rate = commissionRate(completedJobs);
  const commissionAmount = grossJobValue * rate;
  const netPayout = grossJobValue - commissionAmount;

  const paidSoFar = milestones
    .filter((m) => m.status === "paid")
    .reduce((s, m) => s + m.amount, 0);

  // Net paid: milestones paid minus commission share
  const netPaidSoFar = paidSoFar * (1 - rate);
  const remaining = netPayout - netPaidSoFar;

  const rows = [
    { label: "Gross job value", value: grossJobValue, variant: "normal" as const },
    {
      label: `Commission (${Math.round(rate * 100)}% — tier ${
        completedJobs < 5 ? "1–5" : completedJobs < 10 ? "6–10" : "11+"
      })`,
      value: -commissionAmount,
      variant: "deduct" as const,
    },
    { label: "Net payout", value: netPayout, variant: "total" as const },
    { label: "Paid so far (net)", value: netPaidSoFar, variant: "paid" as const },
    { label: "Remaining", value: remaining, variant: "remain" as const },
  ];

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
      style={{ fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <PoundSterling className="h-4 w-4" style={{ color: "#2E75B6" }} />
        <h3 className="text-sm font-semibold" style={{ color: "#1B3A5C" }}>
          Payout Calculator
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-1.5 ${
              row.variant === "total"
                ? "border-t border-gray-200 mt-1 pt-2.5"
                : ""
            }`}
          >
            <span
              className={`text-xs ${
                row.variant === "total"
                  ? "font-semibold text-gray-700"
                  : "text-gray-500"
              }`}
            >
              {row.label}
            </span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                row.variant === "deduct"
                  ? "text-red-500"
                  : row.variant === "total"
                  ? ""
                  : row.variant === "paid"
                  ? "text-teal-600"
                  : row.variant === "remain"
                  ? "text-blue-600"
                  : "text-gray-700"
              }`}
              style={row.variant === "total" ? { color: "#1B3A5C" } : undefined}
            >
              {row.value < 0 ? "−" : ""}£
              {Math.abs(row.value).toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-1.5 bg-blue-50 rounded-lg p-2.5">
        <TrendingDown className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          Commission drops to{" "}
          <strong>
            {completedJobs < 5 ? "10%" : completedJobs < 10 ? "8%" : "8% (lowest)"}
          </strong>{" "}
          {completedJobs < 5
            ? `after ${5 - completedJobs} more completed job${5 - completedJobs !== 1 ? "s" : ""}`
            : completedJobs < 10
            ? `after ${10 - completedJobs} more completed job${10 - completedJobs !== 1 ? "s" : ""}`
            : "— you're at the lowest tier!"}
        </p>
      </div>
    </div>
  );
}
