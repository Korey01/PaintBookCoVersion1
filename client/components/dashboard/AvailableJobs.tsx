import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, PoundSterling, Clock, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { format, differenceInSeconds, addHours, formatDistanceToNow } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface PlatformJob {
  id: string;
  title: string;
  type: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  created_at: string;
  postcode: string | null;
}

interface AvailableJobsProps {
  painterId: string;
  onJobAccepted: () => void;
}

// ── Countdown ─────────────────────────────────────────────────────────────────

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
  const urgent = secsLeft < 4 * 3600;

  return (
    <span className={`text-xs font-mono font-semibold ${urgent ? "text-red-600" : "text-gray-600"}`}>
      <Clock className={`inline h-3 w-3 mr-1 ${urgent ? "text-red-500" : "text-gray-400"}`} />
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AvailableJobs({ painterId, onJobAccepted }: AvailableJobsProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [platformJobs, setPlatformJobs] = useState<PlatformJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "warn" } | null>(null);

  useEffect(() => { fetchAll(); }, [painterId]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchMatches(), fetchPlatformJobs()]);
    setLoading(false);
  }

  async function fetchMatches() {
    const { data } = await supabase
      .from("job_matches")
      .select("*, jobs(*)")
      .eq("painter_id", painterId)
      .eq("status", "notified")
      .order("notified_at", { ascending: false });
    setMatches((data as JobMatch[]) ?? []);
  }

  async function fetchPlatformJobs() {
    // Show ALL unassigned jobs that any approved painter can see.
    // Full property address is intentionally excluded — revealed only after escrow is funded.
    const { data } = await supabase
      .from("jobs")
      .select("id, title, type, description, start_date, end_date, budget, status, created_at, postcode")
      .in("status", ["pending_match", "matching_in_progress"])
      .is("assigned_painter_id", null)
      .order("created_at", { ascending: false });
    setPlatformJobs((data as PlatformJob[]) ?? []);
  }

  function showToast(msg: string, type: "ok" | "err" | "warn" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function acceptMatch(match: JobMatch) {
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
      fetchAll();
    } catch (err) {
      showToast((err as Error).message ?? "Failed to accept job.", "err");
    } finally {
      setActing(null);
    }
  }

  async function acceptPlatformJob(jobId: string) {
    setActing(jobId);
    try {
      const res = await supabase.functions.invoke("accept-job", {
        body: { job_id: jobId },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data as { success: boolean; message?: string };
      if (!result.success) {
        showToast(result.message ?? "Job no longer available.", "warn");
      } else {
        showToast("Job accepted! Check My Jobs for details.", "ok");
        onJobAccepted();
      }
      fetchAll();
    } catch (err) {
      showToast((err as Error).message ?? "Failed to accept job.", "err");
    } finally {
      setActing(null);
    }
  }

  async function declineMatch(match: JobMatch) {
    setActing(match.id);
    await supabase
      .from("job_matches")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", match.id);
    fetchAll();
    setActing(null);
  }

  // Split matched jobs into active / expired by 48h window
  const now = new Date();
  const activeMatches = matches.filter(
    (m) => differenceInSeconds(addHours(new Date(m.notified_at), 48), now) > 0,
  );
  const expiredMatches = matches.filter(
    (m) => differenceInSeconds(addHours(new Date(m.notified_at), 48), now) <= 0,
  );

  // Filter out platform jobs that the painter already has in their matches list
  const matchedJobIds = new Set(matches.map((m) => m.job_id));
  const openJobs = platformJobs.filter((j) => !matchedJobIds.has(j.id));

  const totalBadge = activeMatches.length + openJobs.length;

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
          toast.type === "ok" ? "bg-green-600" : toast.type === "warn" ? "bg-amber-500" : "bg-red-600"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold" style={{ color: "#1B3A5C" }}>
          Available Jobs{" "}
          {totalBadge > 0 && (
            <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {totalBadge}
            </span>
          )}
        </h2>
        <button onClick={fetchAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="space-y-8">

          {/* ── Personalised matches ── */}
          {activeMatches.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Matched to you
              </p>
              <div className="flex flex-col gap-4">
                {activeMatches.map((match) => {
                  const job = match.jobs;
                  const areaOnly = job.property_address
                    ? job.property_address.split(",").slice(-2).join(",").trim()
                    : "Location not specified";
                  return (
                    <div key={match.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{job.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{job.type}</p>
                        </div>
                        <Countdown notifiedAt={match.notified_at} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{areaOnly}</span>
                        {(job.start_date || job.end_date) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {job.start_date ? format(new Date(job.start_date), "d MMM") : "TBC"}
                            {job.end_date ? ` – ${format(new Date(job.end_date), "d MMM yyyy")}` : ""}
                          </span>
                        )}
                        {job.budget != null && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <PoundSterling className="h-3 w-3" />
                            {job.budget.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                            <span className="text-gray-400 font-normal">(est.)</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => acceptMatch(match)} disabled={acting === match.id}
                          className="text-xs text-white" style={{ backgroundColor: "#1B3A5C" }}>
                          {acting === match.id ? "Processing…" : "Accept Job"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => declineMatch(match)} disabled={acting === match.id}
                          className="text-xs border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-300">
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Platform job board ── */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Open on the platform
            </p>
            {openJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No open jobs at the moment.</p>
                <p className="text-xs mt-1">Keep your availability up to date — new jobs appear here as soon as they're posted.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {openJobs.map((job) => {
                  // Show outward postcode only — full address revealed after escrow is funded
                  const areaCode = job.postcode ? job.postcode.split(" ")[0] : "UK";
                  return (
                    <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: "#1B3A5C" }}>{job.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{job.type}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{areaCode} area</span>
                        {(job.start_date || job.end_date) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {job.start_date ? format(new Date(job.start_date), "d MMM") : "TBC"}
                            {job.end_date ? ` – ${format(new Date(job.end_date), "d MMM yyyy")}` : ""}
                          </span>
                        )}
                        {job.budget != null && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <PoundSterling className="h-3 w-3" />
                            {job.budget.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                            <span className="text-gray-400 font-normal">(est.)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-600 mb-3">
                        Full address revealed after escrow is funded.
                      </p>
                      <Button size="sm" onClick={() => acceptPlatformJob(job.id)} disabled={acting === job.id}
                        className="text-xs text-white" style={{ backgroundColor: "#1B3A5C" }}>
                        {acting === job.id ? "Processing…" : "Accept Job"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Expired matches (collapsed) ── */}
          {expiredMatches.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Expired</p>
              <div className="flex flex-col gap-3">
                {expiredMatches.map((match) => (
                  <div key={match.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-500">{match.jobs.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{match.jobs.type}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />Opportunity expired
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ── */}
          {activeMatches.length === 0 && openJobs.length === 0 && expiredMatches.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No jobs available right now.</p>
              <p className="text-xs mt-1">Keep your availability and service area up to date to receive matches.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
