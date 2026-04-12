import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, PoundSterling, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format, differenceInSeconds, addHours } from "date-fns";

interface JobMatch {
  id: string;
  job_id: string;
  painter_id: string;
  status: string;
  notified_at: string;
  responded_at: string | null;
  jobs: {
    id: string;
    title: string;
    type: string;
    property_address: string | null;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    status: string;
  };
}

interface AvailableJobsProps {
  painterId: string;
  onJobAccepted: () => void;
}

// ── Countdown component ───────────────────────────────────────────────────────

function Countdown({ notifiedAt }: { notifiedAt: string }) {
  const deadline = addHours(new Date(notifiedAt), 48);
  const [secsLeft, setSecsLeft] = useState(() =>
    Math.max(0, differenceInSeconds(deadline, new Date())),
  );

  useEffect(() => {
    if (secsLeft <= 0) return;
    const id = setInterval(() => {
      setSecsLeft(Math.max(0, differenceInSeconds(deadline, new Date())));
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, secsLeft]);

  if (secsLeft <= 0) return <span className="text-xs text-gray-400">Expired</span>;

  const h = Math.floor(secsLeft / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;
  const urgent = secsLeft < 4 * 3600; // under 4 hours

  return (
    <span
      className={`text-xs font-mono font-semibold ${
        urgent ? "text-red-600" : "text-gray-600"
      }`}
    >
      <Clock className={`inline h-3 w-3 mr-1 ${urgent ? "text-red-500" : "text-gray-400"}`} />
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
      {String(s).padStart(2, "0")}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AvailableJobs({ painterId, onJobAccepted }: AvailableJobsProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "warn" } | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [painterId]);

  async function fetchMatches() {
    setLoading(true);
    const { data } = await supabase
      .from("job_matches")
      .select("*, jobs(*)")
      .eq("painter_id", painterId)
      .eq("status", "notified")
      .order("notified_at", { ascending: false });
    setMatches((data as JobMatch[]) ?? []);
    setLoading(false);
  }

  function showToast(msg: string, type: "ok" | "err" | "warn" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function acceptJob(match: JobMatch) {
    setActing(match.id);
    try {
      const res = await supabase.functions.invoke("accept-job", {
        body: { job_id: match.job_id },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data as { success: boolean; message?: string };
      if (!result.success) {
        showToast(result.message ?? "Job no longer available.", "warn");
      } else {
        showToast("Job accepted! Check My Jobs for details.", "ok");
        onJobAccepted();
      }
      fetchMatches();
    } catch (err) {
      showToast((err as Error).message ?? "Failed to accept job.", "err");
    } finally {
      setActing(null);
    }
  }

  async function declineJob(match: JobMatch) {
    setActing(match.id);
    await supabase
      .from("job_matches")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", match.id);
    fetchMatches();
    setActing(null);
  }

  // Filter out expired matches (over 48h old)
  const now = new Date();
  const active = matches.filter(
    (m) => differenceInSeconds(addHours(new Date(m.notified_at), 48), now) > 0,
  );
  const expired = matches.filter(
    (m) => differenceInSeconds(addHours(new Date(m.notified_at), 48), now) <= 0,
  );

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
            toast.type === "ok"
              ? "bg-green-600"
              : toast.type === "warn"
              ? "bg-amber-500"
              : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "#1B3A5C" }}>
          Available Jobs{" "}
          {active.length > 0 && (
            <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {active.length}
            </span>
          )}
        </h2>
        <button
          onClick={fetchMatches}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : active.length === 0 && expired.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No jobs waiting for you right now.</p>
          <p className="text-xs mt-1">
            Keep your availability and service radius up to date to receive more matches.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {active.map((match) => {
            const job = match.jobs;
            // Show general area only — strip house number / full address
            const areaOnly = job.property_address
              ? job.property_address.split(",").slice(-2).join(",").trim()
              : "Location not specified";

            return (
              <div
                key={match.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{job.type}</p>
                  </div>
                  <Countdown notifiedAt={match.notified_at} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {areaOnly}
                  </span>
                  {(job.start_date || job.end_date) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.start_date
                        ? format(new Date(job.start_date), "d MMM")
                        : "TBC"}
                      {job.end_date
                        ? ` – ${format(new Date(job.end_date), "d MMM yyyy")}`
                        : ""}
                    </span>
                  )}
                  {job.budget != null && (
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <PoundSterling className="h-3 w-3" />
                      {job.budget.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}
                      <span className="text-gray-400 font-normal">(est.)</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptJob(match)}
                    disabled={acting === match.id}
                    className="text-xs text-white"
                    style={{ backgroundColor: "#1B3A5C" }}
                  >
                    {acting === match.id ? "Processing…" : "Accept Job"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineJob(match)}
                    disabled={acting === match.id}
                    className="text-xs border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-300"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Expired */}
          {expired.map((match) => (
            <div
              key={match.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">
                    {match.jobs.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{match.jobs.type}</p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Opportunity expired
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
