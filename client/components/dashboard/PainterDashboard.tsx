import React, { useState, useEffect } from "react";
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
  Download,
  Trash2,
  Upload,
  Shield,
} from "lucide-react";

function InsuranceUploadForm({ painter, onSuccess }: { painter: any, onSuccess: () => void }) {
  const [form, setForm] = useState({
    insurance_company: "",
    insurance_policy_number: "",
    insurance_policy_details: "",
    insurance_expiry_date: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState("")
  const [certificateSize, setCertificateSize] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // text-base (16px) prevents iOS Safari from auto-zooming on focus
  const fieldClass = "w-full border-b border-border bg-transparent text-base text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200"
  const labelClass = "block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(selected.type)) { setError("Only PDF, JPG and PNG files are accepted."); return }
    if (selected.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return }
    setError("")
    setFile(selected)
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError("Session expired. Please log in again."); setFile(null); setUploading(false); return }
      const fileExt = selected.name.split(".").pop()
      const path = `${painter.id}/${Date.now()}_insurance.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("painter-insurance")
        .upload(path, selected, { upsert: true })
      if (uploadError) { setError(`Upload failed: ${uploadError.message}`); setFile(null); setUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from("painter-insurance").getPublicUrl(path)
      setCertificateUrl(publicUrl)
      setCertificateSize(selected.size)
    } catch (err) { console.error("Insurance file upload error:", err); setError("Upload failed. Please try again."); setFile(null) }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!form.insurance_company) { setError("Insurance company is required."); return }
    if (!form.insurance_policy_number) { setError("Policy number is required."); return }
    if (!form.insurance_expiry_date) { setError("Expiry date is required."); return }
    if (!certificateUrl) { setError("Please upload your insurance certificate."); return }
    const expiry = new Date(form.insurance_expiry_date)
    if (expiry <= new Date()) { setError("Your insurance has expired. Please renew before applying."); return }
    setSubmitting(true)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError("Session expired. Please log in again."); setSubmitting(false); return }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-insurance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            insurance_company: form.insurance_company,
            insurance_policy_number: form.insurance_policy_number,
            insurance_policy_details: form.insurance_policy_details || "Not provided",
            insurance_expiry_date: form.insurance_expiry_date,
            insurance_certificate_url: certificateUrl,
            certificate_size_bytes: certificateSize,
          })
        }
      )
      const result = await res.json()
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || "Submission failed. Please try again.")
      }
    } catch (err) { console.error("Insurance submit error:", err); setError("An unexpected error occurred.") }
    setSubmitting(false)
  }

  return (
    <div className="space-y-5">
      <div className="border-l-2 border-amber-500/50 pl-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          You must hold valid public liability insurance of at least £2,000,000.
          Your certificate will be verified by our team before your account is activated.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <label className={labelClass}>Insurance Company *</label>
        <input type="text" value={form.insurance_company}
          onChange={e => setForm(f => ({ ...f, insurance_company: e.target.value }))}
          placeholder="e.g. Aviva, AXA" className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Policy Number *</label>
        <input type="text" value={form.insurance_policy_number}
          onChange={e => setForm(f => ({ ...f, insurance_policy_number: e.target.value }))}
          placeholder="e.g. PLI-123456" className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Policy Details</label>
        <textarea value={form.insurance_policy_details}
          onChange={e => setForm(f => ({ ...f, insurance_policy_details: e.target.value }))}
          placeholder="Coverage description (optional)" rows={2}
          className="w-full border-b border-border bg-transparent text-base text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none" />
      </div>
      <div>
        <label className={labelClass}>Expiry Date *</label>
        <input type="date" value={form.insurance_expiry_date}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => setForm(f => ({ ...f, insurance_expiry_date: e.target.value }))}
          className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Certificate (PDF/JPG/PNG — max 5MB) *</label>
        {!file ? (
          <label className="block cursor-pointer mt-2">
            <div className="border border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/40 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload certificate</p>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
          </label>
        ) : (
          <div className="border border-border rounded-lg p-3 mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className={`text-xs mt-0.5 ${file.size > 5242880 ? "text-destructive" : "text-muted-foreground"}`}>
                {(file.size / 1048576).toFixed(2)} MB / 5 MB max
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {uploading ? (
                <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : certificateUrl ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : null}
              <button onClick={() => { setFile(null); setCertificateUrl("") }}
                className="text-muted-foreground hover:text-foreground text-xs min-h-[44px] px-2">Remove</button>
            </div>
          </div>
        )}
        {certificateUrl && !uploading && (
          <p className="text-xs text-green-400 mt-1">✓ Certificate uploaded successfully</p>
        )}
      </div>
      <button onClick={handleSubmit} disabled={submitting || uploading || !certificateUrl}
        className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
        {submitting ? (
          <><div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Submitting...</>
        ) : (
          <><Shield className="h-4 w-4" /> Submit Insurance</>
        )}
      </button>
    </div>
  )
}

class InsuranceBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-destructive/40 rounded-lg p-4">
          <p className="text-destructive text-sm">
            Insurance form failed to load. Please refresh the page and try again.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

function AvailableJobsTab({ painter, supabase }: { painter: any, supabase: any }) {
  const [jobs, setJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [passedJobs, setPassedJobs] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("pbc_passed_jobs") || "[]") } catch { return [] }
  })
  const [chatting, setChatting] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (painter?.is_active) loadJobs()
    else setLoading(false)
  }, [painter?.id])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("sessions")
        .select("id, job_type, postcode, rooms, job_description, has_structural_defects, created_at, status")
        .eq("status", "job_posted")
        .eq("converted_to_transaction", false)
        .order("created_at", { ascending: false })
        .limit(20)
      setJobs((data || []).filter((j: any) => !passedJobs.includes(j.id)))
    } catch (err) {
      console.error("Failed to load jobs:", err)
    }
    setLoading(false)
  }

  const handlePass = (jobId: string) => {
    const updated = [...passedJobs, jobId]
    setPassedJobs(updated)
    localStorage.setItem("pbc_passed_jobs", JSON.stringify(updated))
    setJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const handleChat = async (job: any) => {
    setChatting(job.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setChatting(null); return }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ session_id: job.id })
        }
      )
      const result = await res.json()
      if (result.success) {
        window.open(result.painter_chat_link, "_blank")
        setJobs(prev => prev.filter(j => j.id !== job.id))
      } else {
        alert(result.error || "Failed to start chat")
      }
    } catch {
      alert("Failed to start chat. Please try again.")
    }
    setChatting(null)
  }

  if (!painter?.is_active) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Available Jobs</h1>
          <p className="text-muted-foreground text-sm">Jobs near you looking for painters</p>
        </div>
        <div className="border border-border rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">🔒</div>
          <p className="font-medium">Complete your profile to unlock jobs</p>
          <p className="text-sm text-muted-foreground">
            You need KYC approval, insurance verification and account activation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Available Jobs</h1>
          <p className="text-muted-foreground text-sm">Jobs near you looking for painters</p>
        </div>
        <button onClick={loadJobs}
          className="text-sm border border-border px-3 py-1.5 rounded hover:bg-accent transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center space-y-2">
          <p className="font-medium">No jobs available right now</p>
          <p className="text-sm text-muted-foreground">
            New jobs near {painter.postcode} will appear here automatically.
          </p>
        </div>
      ) : jobs.map(job => (
        <div key={job.id} className="border border-border rounded-xl p-5 space-y-4 hover:border-foreground/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{job.job_type}</span>
                {job.has_structural_defects && (
                  <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded">
                    ⚠️ Structural issues
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                📍 {job.postcode?.split(" ")[0] || "Unknown area"}
              </p>
              <p className="text-sm text-muted-foreground">
                🏠 {job.rooms?.length || 0} room{(job.rooms?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(job.created_at).toLocaleDateString("en-GB")}
            </span>
          </div>
          {job.job_description && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3 line-clamp-2">
              {job.job_description.slice(0, 120)}{job.job_description.length > 120 ? "..." : ""}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleChat(job)}
              disabled={chatting === job.id}
              className="flex-1 bg-foreground text-background py-2.5 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {chatting === job.id ? (
                <><div className="h-3.5 w-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Connecting...</>
              ) : "💬 Chat with Customer"}
            </button>
            <button
              onClick={() => handlePass(job.id)}
              className="px-4 py-2.5 border border-border text-muted-foreground rounded-md text-sm hover:bg-accent transition-colors"
            >
              Pass
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

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
    window.location.href = "/login";
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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <a href="/" className="flex-shrink-0">
            <img src={LOGO} alt="PaintBookCo" className="h-7 sm:h-8 object-contain max-w-[140px]" />
          </a>
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => {}}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Contact Us
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-x-hidden">
        {/* Sidebar — desktop only */}
        <aside className="w-56 border-r border-border hidden lg:flex flex-col bg-card/30 flex-shrink-0">
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
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-w-0">
          {/* pb-20 reserves space above the mobile bottom tab bar */}
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:p-12 pb-24 lg:pb-12">

            {/* TAB 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Overview</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {painter.first_name}</p>
                </div>

                {/* Insurance required banner */}
                {painter.kyc_status === "approved" && !painter.insurance_submitted_at && (
                  <div className="border border-amber-800/40 bg-amber-900/20 rounded-xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div>
                        <p className="font-semibold text-amber-400 mb-1 text-sm sm:text-base">
                          ✓ Identity Verified — Submit Insurance to Go Live
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your KYC has been approved. The next step is to submit
                          your public liability insurance certificate. Once verified
                          by our team, your account will be activated.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="w-full sm:w-auto flex-shrink-0 bg-amber-500 text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-amber-400 transition-colors whitespace-nowrap min-h-[44px]"
                      >
                        Submit Insurance →
                      </button>
                    </div>
                  </div>
                )}

                {/* Insurance under review banner */}
                {painter.kyc_status === "approved" && painter.insurance_submitted_at && !painter.insurance_verified && !painter.is_active && (
                  <div className="border border-blue-800/40 bg-blue-900/20 rounded-xl p-4 sm:p-5">
                    <p className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">
                      ✓ Insurance Submitted — Under Review
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Our team is verifying your insurance certificate.
                      You will receive an email when your account is activated.
                      This typically takes 1-2 working days.
                    </p>
                  </div>
                )}

                {/* Stats Grid — 2-col on mobile, 4-col on md+ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Total Earnings</p>
                    <p className="text-xl sm:text-2xl font-bold">£{painter.total_earnings || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Completed Jobs</p>
                    <p className="text-xl sm:text-2xl font-bold">{painter.completed_jobs || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Active Jobs</p>
                    <p className="text-xl sm:text-2xl font-bold">{painter.active_jobs || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Average Rating</p>
                    <p className="text-xl sm:text-2xl font-bold">{painter.avg_rating || 0}/5</p>
                  </div>
                </div>

                {/* Commission tier */}
                <div className="border border-border rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold mb-3 sm:mb-4">Commission Tier</h3>
                  <div className="flex gap-4 items-center mb-3 sm:mb-4">
                    <div
                      className={`px-3 sm:px-4 py-2 rounded text-sm font-medium ${
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
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Registration Progress</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Complete your profile to start receiving jobs</p>
                </div>

                <div className="space-y-4">
                  {REGISTRATION_STEPS.map((step) => {
                    let isComplete = false;
                    if (step.key === "account_created") isComplete = true;
                    else if (step.key === "email_confirmed") isComplete = user?.email_confirmed_at !== null;
                    else if (step.key === "insurance_submitted") isComplete = painter?.insurance_submitted_at !== null;
                    else if (step.key === "insurance_verified") isComplete = painter?.insurance_verified === true;
                    else if (step.key === "kyc_status") isComplete = painter?.kyc_status === "approved";
                    else if (step.key === "is_active") isComplete = painter?.is_active === true;

                    return (
                      <div key={step.number} className="flex gap-3 sm:gap-4 items-start">
                        <div
                          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isComplete
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isComplete ? "✓" : step.number}
                        </div>
                        <div className="flex-1 pt-1.5 sm:pt-2">
                          <p className="font-medium text-sm sm:text-base">{step.label}</p>
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
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Available Jobs</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Jobs near you looking for painters</p>
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
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">My Jobs</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Track your current and past jobs</p>
                </div>
                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">No jobs yet</p>
                </div>
              </div>
            )}

            {/* TAB 5: Gallery */}
            {activeTab === "gallery" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Gallery</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Showcase your best work</p>
                </div>
                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">Gallery feature coming soon</p>
                </div>
              </div>
            )}

            {/* TAB 6: Availability */}
            {activeTab === "availability" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Availability</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Set when you're available for jobs</p>
                </div>
                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">Availability calendar coming soon</p>
                </div>
              </div>
            )}

            {/* TAB 7: Profile & Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Profile & Settings</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Personal Details */}
                  <div className="border border-border rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold mb-3 sm:mb-4">Personal Details</h3>
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

                  {/* Insurance Section */}
                  <div className="border border-border rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold mb-3 sm:mb-4">Insurance Details</h3>
                    {painter.insurance_verified ? (
                      <div className="border border-green-800/40 bg-green-900/20 rounded-lg p-4">
                        <p className="text-green-400 font-medium">✓ Insurance Verified</p>
                        <p className="text-sm text-muted-foreground mt-1">{painter.insurance_company} — {painter.insurance_policy_number}</p>
                        <p className="text-sm text-muted-foreground">Expires: {painter.insurance_expiry_date}</p>
                      </div>
                    ) : painter.insurance_submitted_at ? (
                      <div className="border border-amber-800/40 bg-amber-900/20 rounded-lg p-4">
                        <p className="text-amber-400 font-medium">⏳ Insurance Under Review</p>
                        <p className="text-sm text-muted-foreground mt-1">Submitted {new Date(painter.insurance_submitted_at).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Our team will verify within 1-2 working days.</p>
                      </div>
                    ) : (
                      <InsuranceBoundary>
                        <InsuranceUploadForm painter={painter} onSuccess={loadDashboard} />
                      </InsuranceBoundary>
                    )}
                  </div>

                  {/* Account Actions */}
                  <div className="border border-border rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold mb-3 sm:mb-4">Account Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground p-3 rounded border border-border hover:bg-accent transition-colors min-h-[44px]">
                        <Download className="h-4 w-4" />
                        Download My Data
                      </button>
                      <button className="w-full flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 p-3 rounded border border-destructive/20 transition-colors min-h-[44px]">
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
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Notifications</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your notification preferences</p>
                </div>
                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm">No notifications yet</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar — icons only, horizontal scroll */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex overflow-x-auto">
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-shrink-0 flex items-center justify-center px-3 min-w-[56px] min-h-[56px] transition-colors ${
                activeTab === id
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default PainterDashboard;
