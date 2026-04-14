/**
 * CustomerDashboard — Supabase-backed customer dashboard for PaintBookCo.
 *
 * Tabs:
 *  1. Overview    — stats + quick actions
 *  2. My Jobs     — job cards with status badges + action buttons
 *  3. Payments    — payment history table
 *  4. Reviews     — leave / view reviews
 *
 * Theme: Customer dashboard (orange/amber accent)
 * Auth: Protected by ProtectedRoute + uses AuthContext
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Job, JobMilestone, Review } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import JobCard from "./JobCard";
import MilestoneTracker from "./MilestoneTracker";
import PostJobForm from "./PostJobForm";
import PaymentHistory from "./PaymentHistory";
import ReviewsSection from "./ReviewsSection";
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Star,
  PlusCircle,
  Loader2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Tab definition ────────────────────────────────────────────────────────────

type Tab = "overview" | "jobs" | "post-job" | "payments" | "reviews";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: "jobs",
    label: "My Jobs",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: "payments",
    label: "Payments",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: <Star className="h-4 w-4" />,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [milestones, setMilestones] = useState<JobMilestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // ── Data fetching (uses current user from AuthContext) ───────────────────

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    }
  }, [user]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [jobsRes, reviewsRes] = await Promise.all([
        supabase
          .from("jobs")
          .select("*")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      setJobs((jobsRes.data as Job[]) ?? []);
      setReviews((reviewsRes.data as Review[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) fetchData(session.user.id);
  }, [fetchData]);

  // ── Milestone fetch ───────────────────────────────────────────────────────

  async function openMilestoneTracker(job: Job) {
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

  // ── Confirm complete ──────────────────────────────────────────────────────

  async function confirmComplete(job: Job) {
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed" })
      .eq("id", job.id);
    if (!error) refresh();
  }

  // ── Derived stats ─────────────────────────────────────────────────────────

  const activeCount = jobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled",
  ).length;

  const totalSpent = jobs
    .filter((j) => j.status === "completed")
    .reduce((s, j) => s + (j.total_price ?? j.budget ?? 0), 0);

  const inProgressCount = jobs.filter(
    (j) => j.status === "in_progress" || j.status === "escrow_funded",
  ).length;

  const reviewedIds = new Set(reviews.map((r) => r.job_id));
  const pendingReviewsCount = jobs.filter(
    (j) => j.status === "completed" && !reviewedIds.has(j.id),
  ).length;

  // ── Sign out ──────────────────────────────────────────────────────────────

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ fontFamily: "Arial, system-ui, sans-serif" }}
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "#2E75B6" }}
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="dashboard-customer min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              PaintBookCo
            </h1>
            <p className="text-xs text-dashboard-customer-text-secondary mt-0.5">
              Customer Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-xs text-dashboard-customer-text-secondary hidden sm:block">
                {user.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-dashboard-customer-text-secondary hover:text-dashboard-customer-text-primary transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Tab navigation */}
        <nav className="flex items-center gap-1 mb-6 dashboard-customer-card border-white/10 rounded-xl p-1 shadow-sm overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setActiveJob(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "dashboard-customer-accent-bg text-white shadow-sm"
                  : "text-dashboard-customer-text-secondary hover:text-dashboard-customer-text-primary"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "reviews" && pendingReviewsCount > 0 && (
                <span className="ml-1 bg-dashboard-customer-danger text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingReviewsCount}
                </span>
              )}
            </button>
          ))}
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => setTab("post-job")}
            className="dashboard-customer-accent text-black gap-1 hover:opacity-90 flex-shrink-0 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Post Job
          </Button>
        </nav>

        {/* ── Overview tab ────────────────────────────────────────── */}
        {tab === "overview" && (
          <div>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Active Jobs"
                value={activeCount}
                sub="not completed or cancelled"
              />
              <StatCard
                label="Total Spent"
                value={`£${totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
                sub="completed jobs only"
              />
              <StatCard
                label="Jobs In Progress"
                value={inProgressCount}
                sub="escrow funded or active"
              />
              <StatCard
                label="Pending Reviews"
                value={pendingReviewsCount}
                sub="completed, not yet reviewed"
                highlight={pendingReviewsCount > 0}
              />
            </div>

            {/* Quick actions */}
            <div className="dashboard-customer-card border-white/10 rounded-xl p-6">
              <h2 className="text-base font-semibold mb-4 text-white">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setTab("post-job")}
                  className="dashboard-customer-accent text-black gap-2 hover:opacity-90"
                >
                  <PlusCircle className="h-4 w-4" />
                  Post New Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTab("jobs")}
                  className="gap-2 border-white/20 text-white hover:bg-white/5"
                >
                  <Briefcase className="h-4 w-4" />
                  View My Jobs
                </Button>
                {pendingReviewsCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setTab("reviews")}
                    className="gap-2 border-dashboard-customer-warning text-dashboard-customer-warning hover:bg-dashboard-customer-warning/10"
                  >
                    <Star className="h-4 w-4" />
                    Leave a Review ({pendingReviewsCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Recent jobs preview */}
            {jobs.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-semibold mb-4 text-white">
                  Recent Jobs
                </h2>
                <div className="flex flex-col gap-3">
                  {jobs.slice(0, 3).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      hasReview={reviewedIds.has(job.id)}
                      onPayNow={() => {
                        /* Transpact stub — wired in later sprint */
                        alert(
                          "Payment via Transpact will be enabled in the next sprint.",
                        );
                      }}
                      onViewProgress={openMilestoneTracker}
                      onConfirmComplete={confirmComplete}
                      onLeaveReview={() => setTab("reviews")}
                    />
                  ))}
                </div>
                {jobs.length > 3 && (
                  <button
                    className="mt-3 text-sm font-medium flex items-center gap-1 text-dashboard-customer-accent hover:opacity-80"
                    onClick={() => setTab("jobs")}
                  >
                    View all {jobs.length} jobs{" "}
                    <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── My Jobs tab ──────────────────────────────────────────── */}
        {tab === "jobs" && (
          <div>
            {activeJob ? (
              milestonesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    className="h-6 w-6 animate-spin"
                    style={{ color: "#2E75B6" }}
                  />
                </div>
              ) : (
                <MilestoneTracker
                  job={activeJob}
                  milestones={milestones}
                  onBack={() => setActiveJob(null)}
                  onRefresh={refreshMilestones}
                />
              )
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">
                    My Jobs ({jobs.length})
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setTab("post-job")}
                    className="dashboard-customer-accent text-black text-xs gap-1 hover:opacity-90"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Post New Job
                  </Button>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-20 text-dashboard-customer-text-secondary">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No jobs yet.</p>
                    <p className="text-xs mt-1">
                      Post your first job to get matched with verified painters.
                    </p>
                    <Button
                      className="mt-4 dashboard-customer-accent text-black text-sm hover:opacity-90"
                      onClick={() => setTab("post-job")}
                    >
                      Post a Job
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        hasReview={reviewedIds.has(job.id)}
                        onPayNow={() => {
                          alert(
                            "Payment via Transpact will be enabled in the next sprint.",
                          );
                        }}
                        onViewProgress={openMilestoneTracker}
                        onConfirmComplete={confirmComplete}
                        onLeaveReview={() => setTab("reviews")}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Post Job tab ─────────────────────────────────────────── */}
        {tab === "post-job" && (
          <div className="dashboard-customer-card border-white/10 rounded-xl p-6">
            <PostJobForm
              onSuccess={() => {
                refresh();
                setTab("jobs");
              }}
            />
          </div>
        )}

        {/* ── Payments tab ─────────────────────────────────────────── */}
        {tab === "payments" && (
          <div className="dashboard-customer-card border-white/10 rounded-xl p-6">
            <h2 className="text-base font-semibold mb-5 text-white">
              Payment History
            </h2>
            <PaymentHistory jobs={jobs} />
          </div>
        )}

        {/* ── Reviews tab ──────────────────────────────────────────── */}
        {tab === "reviews" && (
          <div className="dashboard-customer-card border-white/10 rounded-xl p-6">
            <ReviewsSection jobs={jobs} reviews={reviews} onRefresh={refresh} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`dashboard-customer-card rounded-xl p-5 border ${
        highlight ? "border-dashboard-customer-warning" : "border-white/10"
      }`}
    >
      <p className="text-xs text-dashboard-customer-text-secondary mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          highlight
            ? "text-dashboard-customer-warning"
            : "text-dashboard-customer-accent"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-dashboard-customer-text-secondary mt-1">
        {sub}
      </p>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  try {
    const { Builder } = await import("@builder.io/react");
    Builder.registerComponent(CustomerDashboard, {
      name: "CustomerDashboard",
      inputs: [],
    });
  } catch {
    // @builder.io/react not installed — skip registration silently
  }
})();
