import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Briefcase,
  Image,
  Calendar,
  Settings,
  Bell,
  LogOut,
  MessageCircle,
  Lock,
  Download,
  Trash2,
} from "lucide-react";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "registration", label: "Registration", icon: CheckCircle2 },
  { id: "available-jobs", label: "Available Jobs", icon: Briefcase },
  { id: "my-jobs", label: "My Jobs", icon: FileText },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "availability", label: "Availability", icon: Calendar },
  { id: "profile", label: "Profile", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const REGISTRATION_STEPS = [
  { number: 1, label: "Account Created", key: "account_created" },
  { number: 2, label: "Email Confirmed", key: "email_confirmed" },
  { number: 3, label: "Insurance Submitted", key: "insurance_submitted" },
  { number: 4, label: "Insurance Verified", key: "insurance_verified" },
  { number: 5, label: "KYC Verification", key: "kyc_status" },
  { number: 6, label: "Account Activated", key: "is_active" },
];

export function PainterDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab")
    // Map convenience aliases to real tab IDs
    if (tabParam === "insurance") return "profile"
    if (tabParam === "progress") return "registration"
    const validTabs = ["overview","registration","available-jobs","my-jobs","gallery","availability","profile","notifications"]
    if (tabParam && validTabs.includes(tabParam)) return tabParam
    return "overview"
  });
  const [user, setUser] = useState<any>(null);
  const [painter, setPainter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      const { data: painterData } = await supabase
        .from("painters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (painterData) {
        setPainter(painterData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !painter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-destructive font-medium mb-4">{error || "Failed to load painter profile"}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-foreground hover:text-muted-foreground"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/">
            <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
          </a>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {}}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border hidden lg:flex flex-col bg-card/30">
          <nav className="space-y-1 p-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                  activeTab === id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 lg:p-12">
            {/* TAB 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
                  <p className="text-muted-foreground">Welcome back, {painter.first_name}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border border-border rounded-lg p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Earnings</p>
                    <p className="text-2xl font-bold">£{painter.total_earnings || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Completed Jobs</p>
                    <p className="text-2xl font-bold">{painter.completed_jobs || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Active Jobs</p>
                    <p className="text-2xl font-bold">{painter.active_jobs || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Average Rating</p>
                    <p className="text-2xl font-bold">{painter.avg_rating || 0}/5</p>
                  </div>
                </div>

                {/* Commission tier */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Commission Tier</h3>
                  <div className="flex gap-4 items-center mb-4">
                    <div
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        (painter.completed_jobs || 0) < 5
                          ? "bg-amber-500/20 text-amber-400"
                          : (painter.completed_jobs || 0) < 10
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {(painter.completed_jobs || 0) < 5
                        ? "0-5 jobs: 12%"
                        : (painter.completed_jobs || 0) < 10
                          ? "6-10 jobs: 10%"
                          : "11+ jobs: 8%"}
                    </div>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-foreground h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((painter.completed_jobs || 0) / 11) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Registration Progress */}
            {activeTab === "registration" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Registration Progress</h1>
                  <p className="text-muted-foreground">Complete your profile to start receiving jobs</p>
                </div>

                <div className="space-y-4">
                  {REGISTRATION_STEPS.map((step, index) => {
                    let isComplete = false;
                    if (step.key === "account_created") isComplete = true;
                    else if (step.key === "email_confirmed") isComplete = user?.email_confirmed_at !== null;
                    else if (step.key === "insurance_submitted") isComplete = painter?.insurance_submitted_at !== null;
                    else if (step.key === "insurance_verified") isComplete = painter?.insurance_verified === true;
                    else if (step.key === "kyc_status") isComplete = painter?.kyc_status === "approved";
                    else if (step.key === "is_active") isComplete = painter?.is_active === true;

                    return (
                      <div key={step.number} className="flex gap-4 items-start">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isComplete
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isComplete ? "✓" : step.number}
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="font-medium">{step.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {isComplete ? "Completed ✓" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Progress: {REGISTRATION_STEPS.filter((s) => {
                      if (s.key === "account_created") return true;
                      else if (s.key === "email_confirmed") return user?.email_confirmed_at !== null;
                      else if (s.key === "insurance_submitted") return painter?.insurance_submitted_at !== null;
                      else if (s.key === "insurance_verified") return painter?.insurance_verified === true;
                      else if (s.key === "kyc_status") return painter?.kyc_status === "approved";
                      else if (s.key === "is_active") return painter?.is_active === true;
                      return false;
                    }).length}/6 steps
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Available Jobs */}
            {activeTab === "available-jobs" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Available Jobs</h1>
                  <p className="text-muted-foreground">Jobs near you looking for painters</p>
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">
                    {!painter.is_active
                      ? "⏳ Complete your profile to see available jobs"
                      : "No available jobs matching your criteria right now"}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: My Jobs */}
            {activeTab === "my-jobs" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">My Jobs</h1>
                  <p className="text-muted-foreground">Track your current and past jobs</p>
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">No jobs yet</p>
                </div>
              </div>
            )}

            {/* TAB 5: Gallery */}
            {activeTab === "gallery" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Gallery</h1>
                  <p className="text-muted-foreground">Showcase your best work</p>
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">Gallery feature coming soon</p>
                </div>
              </div>
            )}

            {/* TAB 6: Availability */}
            {activeTab === "availability" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Availability</h1>
                  <p className="text-muted-foreground">Set when you're available for jobs</p>
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">Availability calendar coming soon</p>
                </div>
              </div>
            )}

            {/* TAB 7: Profile & Settings */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Profile & Settings</h1>
                  <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>

                <div className="space-y-6">
                  {/* Personal Details */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Personal Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                          First Name
                        </label>
                        <p className="text-sm">{painter.first_name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                          Last Name
                        </label>
                        <p className="text-sm">{painter.last_name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                          Email
                        </label>
                        <p className="text-sm">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Account Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground p-3 rounded border border-border hover:bg-accent transition-colors">
                        <Download className="h-4 w-4" />
                        Download My Data
                      </button>
                      <button className="w-full flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 p-3 rounded border border-destructive/20 transition-colors">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
                  <p className="text-muted-foreground">Manage your notification preferences</p>
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">No notifications yet</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PainterDashboard;
