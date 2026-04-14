/**
 * PainterDashboard — Supabase-backed painter dashboard for PaintBookCo.
 *
 * Auth flow:
 *  - No Supabase session           → redirect /login
 *  - No painters record            → redirect /register/painter
 *  - kyc_status pending/submitted  → KYC pending screen
 *  - kyc_status rejected           → rejection screen
 *  - kyc_status approved           → full dashboard
 *
 * Tabs: Overview · Available Jobs · My Jobs · Earnings · Availability · Profile
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Job, JobMilestone } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import AvailableJobs from "./AvailableJobs";
import MilestoneSubmission from "./MilestoneSubmission";
import EarningsTracker from "./EarningsTracker";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PainterProfile from "./PainterProfile";
import JobCard from "./JobCard";
import {
  LayoutDashboard, Briefcase, Bell, CreditCard,
  Calendar, Settings, LogOut, Loader2, Star,
  TrendingDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PainterRecord {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  kyc_status: "pending" | "submitted" | "approved" | "rejected";
  kyc_rejection_reason: string | null;
  avg_rating: number;
  completed_jobs: number;
  specialisms: string[];
  service_radius_km: number;
  available_from: string | null;
  available_to: string | null;
  transpact_seller_id: string | null;
  insurance_expiry: string | null;
  insurance_insurer: string | null;
  insurance_policy_no: string | null;
  bank_account_holder: string | null;
  bank_sort_code: string | null;
  bank_account_number: string | null;
  is_active: boolean;
}

type Tab = "overview" | "available" | "jobs" | "earnings" | "availability" | "profile";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",     label: "Overview",        icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "available",    label: "Available Jobs",   icon: <Bell className="h-4 w-4" /> },
  { id: "jobs",         label: "My Jobs",          icon: <Briefcase className="h-4 w-4" /> },
  { id: "earnings",     label: "Earnings",         icon: <CreditCard className="h-4 w-4" /> },
  { id: "availability", label: "Availability",     icon: <Calendar className="h-4 w-4" /> },
  { id: "profile",      label: "Profile & Settings", icon: <Settings className="h-4 w-4" /> },
];

function commissionRate(n: number) {
  if (n < 5) return 0.12;
  if (n < 10) return 0.10;
  return 0.08;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PainterDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [loading,  setLoading]  = useState(true);
  const [painter,  setPainter]  = useState<PainterRecord | null>(null);
  const [jobs,     setJobs]     = useState<Job[]>([]);
  const [notifiedCount, setNotifiedCount] = useState(0);

  // Milestone viewer
  const [activeJob,        setActiveJob]        = useState<Job | null>(null);
  const [milestones,       setMilestones]       = useState<JobMilestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");

  // ── Data load (uses auth from AuthContext) ─────────────────────────────────

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    }
  }, [user]);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Fetch painter record
      const { data: painterData, error: pErr } = await supabase
        .from("painters")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (pErr || !painterData) {
        navigate("/register/painter");
        return;
      }

      setPainter(painterData as PainterRecord);

      if (painterData.kyc_status !== "approved") {
        setLoading(false);
        return;
      }

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("assigned_painter_id", painterData.id)
        .order("created_at", { ascending: false });

      setJobs((jobsData as Job[]) ?? []);

      // Fetch notified match count
      const { count } = await supabase
        .from("job_matches")
        .select("id", { count: "exact" })
        .eq("painter_id", painterData.id)
        .eq("status", "notified");

      setNotifiedCount(count ?? 0);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchData(session.user.id);
  }, [fetchData]);

  // ── Milestone panel ────────────────────────────────────────────────────────

  async function openMilestones(job: Job) {
    setActiveJob(job);
    setMilestonesLoading(true);
    const { data } = await supabase
      .from("job_milestones")
      .select("*")
      .eq("job_id", job.id)
      .order("milestone_number");
    setMilestones((data as JobMilestone[]) ?? []);
    setMilestonesLoading(false);
    setTab("jobs");
  }

  async function refreshMilestones() {
    if (!activeJob) return;
    const { data } = await supabase
      .from("job_milestones")
      .select("*")
      .eq("job_id", activeJob.id)
      .order("milestone_number");
    setMilestones((data as JobMilestone[]) ?? []);
    refresh();
  }

  // ── Mark job started ───────────────────────────────────────────────────────

  async function markStarted(job: Job) {
    await supabase.from("jobs").update({ status: "in_progress" }).eq("id", job.id);
    refresh();
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#2E75B6" }} />
      </div>
    );
  }

  // ── KYC gates ─────────────────────────────────────────────────────────────

  if (painter && (painter.kyc_status === "pending" || painter.kyc_status === "submitted")) {
    return <KycGate status={painter.kyc_status} reason={null} onSignOut={signOut} />;
  }

  if (painter && painter.kyc_status === "rejected") {
    return <KycGate status="rejected" reason={painter.kyc_rejection_reason} onSignOut={signOut} />;
  }

  if (!painter) return null;

  // ── Derived stats ──────────────────────────────────────────────────────────

  const activeJobsCount    = jobs.filter((j) => j.status !== "completed" && j.status !== "cancelled").length;
  const completedJobsCount = jobs.filter((j) => j.status === "completed").length;
  const totalEarned        = jobs
    .filter((j) => j.status === "completed")
    .reduce((s, j) => s + (j.total_price ?? j.budget ?? 0) * (1 - commissionRate(painter.completed_jobs - completedJobsCount)), 0);

  const rate = commissionRate(painter.completed_jobs);
  const nextTierAt = painter.completed_jobs < 5 ? 5 : painter.completed_jobs < 10 ? 10 : null;
  const tierPct = nextTierAt
    ? Math.round((painter.completed_jobs / nextTierAt) * 100)
    : 100;

  const tierLabel   = painter.completed_jobs < 5 ? "12% — Jobs 1–5" : painter.completed_jobs < 10 ? "10% — Jobs 6–10" : "8% — Jobs 11+";
  const tierColor   = painter.completed_jobs < 5 ? "text-amber-600 bg-amber-50 border-amber-200" : painter.completed_jobs < 10 ? "text-blue-600 bg-blue-50 border-blue-200" : "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="dashboard-painter min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">PaintBookCo</h1>
            <p className="text-xs text-dashboard-painter-text-secondary mt-0.5">
              {painter.first_name ? `${painter.first_name}'s Dashboard` : "Painter Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-dashboard-painter-text-secondary hidden sm:block">
              {painter.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-dashboard-painter-text-secondary hover:text-dashboard-painter-text-primary transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Tab navigation */}
        <nav className="flex items-center gap-1 mb-6 dashboard-painter-card border-white/10 rounded-xl p-1 shadow-sm overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setActiveJob(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors relative ${
                tab === t.id
                  ? "dashboard-painter-accent-bg text-white shadow-sm"
                  : "text-dashboard-painter-text-secondary hover:text-dashboard-painter-text-primary"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.id === "available" && notifiedCount > 0 && (
                <span className="ml-0.5 bg-dashboard-painter-danger text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {notifiedCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* ── OVERVIEW ───────────────────────────────────────────── */}
        {tab === "overview" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Earnings" value={`£${totalEarned.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} sub="net, all time" />
              <StatCard label="Active Jobs" value={activeJobsCount} sub="not completed/cancelled" />
              <StatCard label="Completed Jobs" value={painter.completed_jobs} sub="all time" />
              <StatCard label="Avg Rating" value={painter.avg_rating > 0 ? painter.avg_rating.toFixed(1) : "—"} sub="from verified reviews" icon={<Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />} />
            </div>

            {/* Commission tier */}
            <div className="dashboard-painter-card border-white/10 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Commission Tier</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tierColor}`}>
                  {tierLabel}
                </span>
              </div>
              {nextTierAt ? (
                <>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all bg-dashboard-painter-accent"
                      style={{ width: `${tierPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-dashboard-painter-text-secondary flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-dashboard-painter-accent" />
                    {nextTierAt - painter.completed_jobs} more job{nextTierAt - painter.completed_jobs !== 1 ? "s" : ""} until your commission drops to{" "}
                    <strong>{painter.completed_jobs < 5 ? "10%" : "8%"}</strong>
                  </p>
                </>
              ) : (
                <p className="text-xs text-dashboard-painter-success font-medium">You're at the lowest commission tier — 8%!</p>
              )}
            </div>

            {/* Available jobs nudge */}
            {notifiedCount > 0 && (
              <button
                onClick={() => setTab("available")}
                className="w-full flex items-center justify-between dashboard-painter-card border-dashboard-painter-accent/30 rounded-xl p-4 mb-6 hover:border-dashboard-painter-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-dashboard-painter-danger text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {notifiedCount}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      Job{notifiedCount !== 1 ? "s" : ""} awaiting your response
                    </p>
                    <p className="text-xs text-dashboard-painter-text-secondary">
                      Accept before the 48-hour window closes
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-dashboard-painter-text-secondary" />
              </button>
            )}

            {/* Recent jobs */}
            {jobs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-white">Recent Jobs</h3>
                <div className="flex flex-col gap-3">
                  {jobs.slice(0, 3).map((job) => (
                    <PainterJobCard key={job.id} job={job} onViewMilestones={openMilestones} onMarkStarted={markStarted} />
                  ))}
                </div>
                {jobs.length > 3 && (
                  <button
                    className="mt-3 text-sm font-medium flex items-center gap-1 text-dashboard-painter-accent hover:opacity-80"
                    onClick={() => setTab("jobs")}
                  >
                    View all {jobs.length} jobs <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── AVAILABLE JOBS ─────────────────────────────────────── */}
        {tab === "available" && (
          <div className="dashboard-painter-card border-white/10 rounded-xl p-6">
            <AvailableJobs
              painterId={painter.id}
              onJobAccepted={() => { refresh(); setTab("jobs"); }}
            />
          </div>
        )}

        {/* ── MY JOBS ────────────────────────────────────────────── */}
        {tab === "jobs" && (
          <div>
            {activeJob ? (
              milestonesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-dashboard-painter-accent" />
                </div>
              ) : (
                <MilestoneSubmission
                  job={activeJob}
                  milestones={milestones}
                  completedJobsBefore={Math.max(0, painter.completed_jobs - jobs.filter((j) => j.status === "completed").length)}
                  onBack={() => setActiveJob(null)}
                  onRefresh={refreshMilestones}
                />
              )
            ) : (
              <>
                <h2 className="text-base font-semibold mb-4 text-white">My Jobs ({jobs.length})</h2>
                {jobs.length === 0 ? (
                  <div className="text-center py-20 text-dashboard-painter-text-secondary">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No jobs yet.</p>
                    <p className="text-xs mt-1">Accept an available job to get started.</p>
                    <Button
                      className="mt-4 dashboard-painter-accent text-black text-sm hover:opacity-90"
                      onClick={() => setTab("available")}
                    >
                      View Available Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {jobs.map((job) => (
                      <PainterJobCard key={job.id} job={job} onViewMilestones={openMilestones} onMarkStarted={markStarted} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── EARNINGS ───────────────────────────────────────────── */}
        {tab === "earnings" && (
          <div className="dashboard-painter-card border-white/10 rounded-xl p-6">
            <h2 className="text-base font-semibold mb-5 text-white">Earnings</h2>
            <EarningsTracker jobs={jobs} completedJobs={painter.completed_jobs} />
          </div>
        )}

        {/* ── AVAILABILITY ───────────────────────────────────────── */}
        {tab === "availability" && (
          <div className="dashboard-painter-card border-white/10 rounded-xl p-6">
            <AvailabilityCalendar
              painter={painter}
              jobs={jobs}
              onSaved={(from, to) => setPainter((p) => p ? { ...p, available_from: from, available_to: to } : p)}
            />
          </div>
        )}

        {/* ── PROFILE ────────────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="dashboard-painter-card border-white/10 rounded-xl p-6">
            <h2 className="text-base font-semibold mb-5 text-white">Profile &amp; Settings</h2>
            <PainterProfile
              painter={painter}
              onSaved={(updates) => setPainter((p) => p ? { ...p, ...updates } : p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── KYC Gate Screen ───────────────────────────────────────────────────────────

function KycGate({ status, reason, onSignOut }: { status: string; reason: string | null; onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: status === "rejected" ? "#fee2e2" : "#dbeafe" }}>
          {status === "rejected"
            ? <span className="text-2xl">✗</span>
            : <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#2E75B6" }} />
          }
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#1B3A5C" }}>
          {status === "rejected" ? "Application Not Approved" : "Application Under Review"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {status === "rejected"
            ? reason ?? "Your application was not approved at this time."
            : "Your application is under review. We will notify you by email when approved."}
        </p>
        {status === "rejected" && (
          <Button className="text-white mb-4" style={{ backgroundColor: "#1B3A5C" }} onClick={() => window.location.href = "/register/painter"}>
            Resubmit Application
          </Button>
        )}
        <br />
        <button onClick={onSignOut} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub: string; icon?: React.ReactNode }) {
  return (
    <div className="dashboard-painter-card border-white/10 rounded-xl p-5">
      <p className="text-xs text-dashboard-painter-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold flex items-center gap-1.5 text-dashboard-painter-accent">
        {value} {icon}
      </p>
      <p className="text-xs text-dashboard-painter-text-secondary mt-1">{sub}</p>
    </div>
  );
}

// ── Painter Job Card (with painter-specific actions) ──────────────────────────

function PainterJobCard({ job, onViewMilestones, onMarkStarted }: {
  job: Job;
  onViewMilestones: (job: Job) => void;
  onMarkStarted: (job: Job) => void;
}) {
  const STATUS_LABELS: Record<string, string> = {
    pending_match: "Job Posted", matching_in_progress: "Matching",
    painter_accepted: "Accepted", awaiting_payment: "Awaiting Payment",
    escrow_funded: "Escrow Funded", in_progress: "In Progress",
    milestone_review: "Milestone Review", pending_completion: "Pending Completion",
    completed: "Completed", disputed: "Disputed", cancelled: "Cancelled",
  };

  const STATUS_COLORS: Record<string, string> = {
    escrow_funded: "bg-teal-100 text-teal-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-600 text-white",
    disputed: "bg-red-100 text-red-700",
    awaiting_payment: "bg-amber-100 text-amber-700",
    painter_accepted: "bg-purple-100 text-purple-700",
    milestone_review: "bg-orange-100 text-orange-700",
    pending_completion: "bg-green-100 text-green-700",
  };

  const colorCls = STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="dashboard-painter-card border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-sm text-white">{job.title}</h3>
          <p className="text-xs text-dashboard-painter-text-secondary mt-0.5">{job.type}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${colorCls}`}>
          {STATUS_LABELS[job.status] ?? job.status}
        </span>
      </div>

      {(job.total_price ?? job.budget) != null && (
        <p className="text-xs text-dashboard-painter-text-secondary mb-3">
          Value:{" "}
          <strong className="text-white">
            £{(job.total_price ?? job.budget)!.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </strong>
        </p>
      )}

      {/* Escrow funded → show contact + Mark Started */}
      {job.status === "escrow_funded" && (
        <div className="mb-3 bg-dashboard-painter-accent/10 border border-dashboard-painter-accent/30 rounded-lg px-3 py-2 text-xs text-dashboard-painter-accent">
          <p className="font-semibold mb-0.5">Customer contact details (escrow funded)</p>
          <p>Contact has been sent to your registered email address.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {job.status === "escrow_funded" && (
          <Button
            size="sm"
            onClick={() => onMarkStarted(job)}
            className="dashboard-painter-accent text-black text-xs hover:opacity-90"
          >
            Mark Job Started
          </Button>
        )}
        {(job.status === "in_progress" || job.status === "milestone_review") && (
          <Button
            size="sm"
            onClick={() => onViewMilestones(job)}
            className="dashboard-painter-accent text-black text-xs gap-1 hover:opacity-90"
          >
            Submit Milestone
          </Button>
        )}
        {(job.status === "escrow_funded" || job.status === "in_progress" || job.status === "milestone_review") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewMilestones(job)}
            className="text-xs border-white/20 text-white hover:bg-white/5"
          >
            View Milestones
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  try {
    const { Builder } = await import("@builder.io/react");
    Builder.registerComponent(PainterDashboard, {
      name: "PainterDashboard",
      inputs: [],
    });
  } catch {
    // @builder.io/react not installed — skip silently
  }
})();
