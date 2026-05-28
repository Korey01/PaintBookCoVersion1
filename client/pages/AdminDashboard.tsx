import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, CheckCircle2, XCircle, LogOut, Shield, Briefcase, AlertTriangle, Users, BarChart3 } from "lucide-react";
import DOMPurify from "dompurify";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

type Tab = "kyc" | "insurance" | "activate" | "jobs" | "disputes";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-800 text-gray-300",
    submitted: "bg-amber-900/40 text-amber-400",
    approved: "bg-green-900/40 text-green-400",
    rejected: "bg-red-900/40 text-red-400",
    funded: "bg-teal-900/40 text-teal-400",
    completed: "bg-green-900/40 text-green-400",
    disputed: "bg-red-900/40 text-red-400",
    cancelled: "bg-gray-800 text-gray-400",
    job_posted: "bg-blue-900/40 text-blue-400",
    invoice_sent: "bg-blue-900/40 text-blue-400",
    in_progress: "bg-blue-900/40 text-blue-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || "bg-gray-800 text-gray-300"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function JobDetailModal({ job, onClose, onUpdateStatus }: {
  job: any;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, dispute?: any) => void;
}) {
  const t = job.transactions?.[0] || job.transaction;
  const painter = t?.painters;
  const status = t?.status || job.status || "job_posted";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Job Reference</p>
            <h2 className="font-semibold text-lg font-mono">PBC-{job.id.slice(-6).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-10rem)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <StatusBadge status={status} />
          </div>

          <section>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Customer</h3>
            <div className="bg-card border border-border rounded-lg p-4 space-y-1 text-sm">
              <p className="font-medium">
                {t?.customer_first_name ? `${t.customer_first_name} ${t.customer_last_name || ""}`.trim() : "—"}
              </p>
              <p className="text-muted-foreground">{t?.customer_email || job.email || "—"}</p>
              <p className="text-muted-foreground">{t?.customer_phone || "—"}</p>
              <p className="text-muted-foreground">{t?.customer_postcode || job.postcode || "—"}</p>
            </div>
          </section>

          {painter && (
            <section>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Painter</h3>
              <div className="bg-card border border-border rounded-lg p-4 space-y-1 text-sm">
                <p className="font-medium">{painter.first_name} {painter.last_name}</p>
                <p className="text-muted-foreground">{painter.email}</p>
                <p className="text-muted-foreground">{painter.phone || "—"}</p>
              </div>
            </section>
          )}

          {t && (
            <section>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Financial</h3>
              <div className="bg-card border border-border rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice ID</span>
                  <span className="font-mono text-xs">{t.invoice_id || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">£{t.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission ({t.commission_rate}%)</span>
                  <span>
                    £{t.amount && t.commission_rate
                      ? ((parseFloat(t.amount) * parseFloat(t.commission_rate)) / 100).toFixed(2)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Painter Payout</span>
                  <span>£{t.painter_payout}</span>
                </div>
              </div>
            </section>
          )}

          {t?.invoice_html && (
            <section>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Invoice</h3>
              <div
                className="bg-white text-gray-900 rounded-lg p-4 text-sm overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.invoice_html) }}
              />
            </section>
          )}

          <section>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Timeline</h3>
            <div className="space-y-1.5 text-sm">
              {[
                { label: "Posted", date: job.created_at },
                { label: "Chat Initiated", date: t?.chat_initiated_at || job.chat_initiated_at },
                { label: "Invoice Sent", date: t?.invoice_sent_at },
                { label: "Funded", date: t?.funded_at },
                { label: "Completed", date: t?.completed_at },
                { label: "Disputed", date: t?.disputed_at },
              ].filter(e => e.date).map(e => (
                <div key={e.label} className="flex justify-between">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span>{new Date(e.date!).toLocaleDateString("en-GB")}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {status === "disputed" && (
              <>
                <button
                  onClick={() => { onUpdateStatus(t.id, "completed", t); onClose(); }}
                  className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-600 transition-colors">
                  Release to Painter
                </button>
                <button
                  onClick={() => { onUpdateStatus(t.id, "cancelled", t); onClose(); }}
                  className="px-4 py-2 border border-red-800 text-red-400 rounded text-sm hover:bg-red-900/20 transition-colors">
                  Refund Customer
                </button>
              </>
            )}
            {(status === "funded" || status === "in_progress") && (
              <button
                onClick={() => { onUpdateStatus(t.id, "completed"); onClose(); }}
                className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-600 transition-colors">
                Mark as Complete
              </button>
            )}
            <a
              href={`/chat/job-${job.id}?admin=true&session_id=${job.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-border text-muted-foreground rounded text-sm hover:bg-accent transition-colors inline-block">
              View Chat →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("kyc");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [session, setSession] = useState<any>(null);

  // Data
  const [pendingKYC, setPendingKYC] = useState<any[]>([]);
  const [pendingInsurance, setPendingInsurance] = useState<any[]>([]);
  const [readyToActivate, setReadyToActivate] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobSortBy, setJobSortBy] = useState("newest");

  const filteredJobs = sessions
    .filter(s => {
      if (jobStatusFilter !== "all" && s.status !== jobStatusFilter) return false;
      if (jobSearch) {
        const q = jobSearch.toLowerCase();
        const ref = `pbc-${s.id.slice(-6).toLowerCase()}`;
        return ref.includes(q) || (s.postcode || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (jobSortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (jobSortBy === "status") return (a.status || "").localeCompare(b.status || "");
      if (jobSortBy === "postcode") return (a.postcode || "").localeCompare(b.postcode || "");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  const [stats, setStats] = useState({
    pendingKYC: 0, pendingInsurance: 0,
    readyToActivate: 0, activePainters: 0,
    openDisputes: 0, jobsToday: 0,
  });

  // Rejection reason state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Job detail modal
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Dispute messaging state
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [messageRecipient, setMessageRecipient] = useState<"customer" | "painter">("customer");
  const [activeDisputeChannel, setActiveDisputeChannel] = useState<{id: string; type: "customer" | "painter"} | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        window.location.href = "/login";
        return;
      }
      setSession(session);
      loadAll(session.access_token);
    });
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => loadAll(session.access_token), 30000);
    return () => clearInterval(interval);
  }, [session]);

  const loadAll = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const headers = {
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        kycRes, insuranceRes, activateRes,
        sessionsRes, transactionsRes, disputesRes,
        activePaintersRes
      ] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/painters?kyc_status=in.(pending,submitted)&select=*&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?insurance_submitted_at=not.is.null&insurance_verified=eq.false&select=*&order=insurance_submitted_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?kyc_status=eq.approved&insurance_verified=eq.true&is_active=eq.false&select=*&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/sessions?select=*,transactions(id,invoice_id,amount,commission_rate,painter_payout,status,invoice_html,funded_at,completed_at,disputed_at,invoice_sent_at,session_id,painter_id,customer_first_name,customer_last_name,customer_email,customer_phone,customer_postcode)&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/disputes?select=*,transactions(id,amount,painter_id,customer_email,customer_first_name,customer_last_name,disputed_at,painters(id,first_name,last_name,email,phone))&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?is_active=eq.true&select=id`, { headers }),
      ]);

      const [kyc, insurance, activate, sess, trans, disp, active] = await Promise.all([
        kycRes.json(), insuranceRes.json(), activateRes.json(),
        sessionsRes.json(), transactionsRes.json(), disputesRes.json(),
        activePaintersRes.json(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const todayJobs = (sess || []).filter((s: any) =>
        s.created_at?.startsWith(today)
      ).length;

      setPendingKYC(kyc || []);
      setPendingInsurance(insurance || []);
      setReadyToActivate(activate || []);
      setSessions(sess || []);
      setTransactions(trans || []);
      setDisputes(disp || []);
      setStats({
        pendingKYC: (kyc || []).length,
        pendingInsurance: (insurance || []).length,
        readyToActivate: (activate || []).length,
        activePainters: (active || []).length,
        openDisputes: (disp || []).filter((d: any) => d.status !== "resolved").length,
        jobsToday: todayJobs,
      });
    } catch (err) {
      console.error("Admin load error:", err);
    }
    setLoading(false);
  }, []);

  const adminAction = async (action: string, painter_email: string, reason?: string) => {
    const key = `${action}-${painter_email}`;
    setActionLoading(key);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": ANON_KEY,
          },
          body: JSON.stringify({ action, painter_email, reason }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setMessage({ text: `✓ ${action.replace(/_/g, " ")} successful`, type: "success" });
        setRejectingId(null);
        setRejectReason("");
        await loadAll(session.access_token);
      } else {
        setMessage({ text: result.error || "Action failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
    setActionLoading(null);
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const updateTransactionStatus = async (id: string, status: string, dispute?: any) => {
    setActionLoading(id);
    try {
      if (dispute && (status === "completed" || status === "cancelled")) {
        const resolution = status === "completed" ? "release" : "refund";
        const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-action`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": ANON_KEY,
          },
          body: JSON.stringify({
            action: "resolve_dispute",
            transaction_id: id,
            resolution,
          }),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || "Resolution failed");
      } else {
        await fetch(
          `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
              "apikey": ANON_KEY,
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({ status }),
          }
        );
      }
      setMessage({ text: `✓ Transaction updated to ${status}`, type: "success" });
      await loadAll(session.access_token);
    } catch (err) {
      setMessage({ text: "Update failed", type: "error" });
    }
    setActionLoading(null);
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const sendAdminMessage = async (channelId: string, messageText: string) => {
    if (!messageText.trim()) return;
    try {
      const { StreamChat } = await import("stream-chat");
      const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;
      const streamClient = StreamChat.getInstance(streamApiKey);

      // Connect admin if not already connected
      if (!streamClient.userID) {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const tokenRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${authSession?.access_token}`,
            },
            body: JSON.stringify({ session_id: "admin", role: "admin" }),
          }
        );
        const tokenData = await tokenRes.json();
        if (tokenData.token && tokenData.user_id) {
          await streamClient.connectUser(
            { id: tokenData.user_id, name: "PaintBookCo Admin", role: "admin" },
            tokenData.token
          );
        }
      }

      const channel = streamClient.channel("messaging", channelId);
      await channel.watch();
      await channel.sendMessage({ text: messageText, user_id: "admin" });
      setMessage({ text: "Message sent successfully", type: "success" });
      setMessagingId(null);
      setAdminMessage("");
    } catch (err) {
      console.error("Admin message error:", err);
      setMessage({ text: "Failed to send message. Please try again.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const openDisputeChannel = (channelId: string, type: "customer" | "painter") => {
    setActiveDisputeChannel({ id: channelId, type });
    setMessagingId(channelId);
    setAdminMessage("");
  };

  const resolveDispute = async (disputeId: string) => {
    const notes = prompt("Enter resolution notes:");
    if (!notes) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/disputes?id=eq.${disputeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": ANON_KEY,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution_notes: notes,
          resolved_by: "admin",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      setMessage({ text: "Dispute marked as resolved", type: "success" });
      await loadAll(session.access_token);
    } catch {
      setMessage({ text: "Failed to resolve dispute", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const tabs = [
    { id: "kyc", label: "KYC Review", icon: Shield, count: stats.pendingKYC },
    { id: "insurance", label: "Insurance", icon: CheckCircle2, count: stats.pendingInsurance },
    { id: "activate", label: "Activate", icon: Users, count: stats.readyToActivate },
    { id: "jobs", label: "All Jobs", icon: Briefcase, count: 0 },
    { id: "disputes", label: "Disputes", icon: AlertTriangle, count: stats.openDisputes },
  ];

  const cardClass = "border border-border rounded-xl p-5 bg-card space-y-3";
  const btnGreen = "px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition-colors";
  const btnRed = "px-4 py-2 border border-red-800 text-red-400 rounded text-sm hover:bg-red-900/20 disabled:opacity-50 transition-colors";
  const btnOrange = "px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-500 disabled:opacity-50 transition-colors";

  if (!session) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png" alt="PaintBookCo" className="h-7 object-contain" />
          <span className="text-sm font-medium text-muted-foreground">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={async () => {
              const { data: { session: s } } = await supabase.auth.getSession()
              if (s) loadAll(s.access_token)
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded hover:bg-accent transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded hover:bg-accent transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Message */}
      {message.text && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm flex items-center justify-between ${
          message.type === "success"
            ? "bg-green-900/30 border border-green-800 text-green-400"
            : "bg-red-900/30 border border-red-800 text-red-400"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: "", type: "" })}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Pending KYC", value: stats.pendingKYC, color: "text-amber-400" },
          { label: "Pending Insurance", value: stats.pendingInsurance, color: "text-blue-400" },
          { label: "Ready to Activate", value: stats.readyToActivate, color: "text-orange-400" },
          { label: "Active Painters", value: stats.activePainters, color: "text-green-400" },
          { label: "Open Disputes", value: stats.openDisputes, color: "text-red-400" },
          { label: "Jobs Today", value: stats.jobsToday, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-lg p-3 bg-card">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KYC REVIEW */}
            {activeTab === "kyc" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">KYC Review</h2>
                {pendingKYC.length === 0 ? (
                  <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No pending KYC applications</p>
                  </div>
                ) : pendingKYC.map(p => (
                  <div key={p.id} className={cardClass}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{p.first_name} {p.last_name}</p>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                        <p className="text-sm text-muted-foreground">{p.phone}</p>
                        <p className="text-sm text-muted-foreground">{p.postcode} · {p.city}</p>
                      </div>
                      <StatusBadge status={p.kyc_status} />
                    </div>
                    {p.specialisms?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.specialisms.map((s: string) => (
                          <span key={s} className="text-xs bg-accent px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Registered: {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </p>
                    {rejectingId === p.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          rows={2}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => adminAction("reject_kyc", p.email, rejectReason)}
                            disabled={actionLoading === `reject_kyc-${p.email}`}
                            className={btnRed}>
                            Confirm Reject
                          </button>
                          <button onClick={() => setRejectingId(null)}
                            className="px-4 py-2 border border-border text-muted-foreground rounded text-sm hover:bg-accent">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => adminAction("approve_kyc", p.email)}
                          disabled={actionLoading === `approve_kyc-${p.email}`}
                          className={btnGreen}>
                          {actionLoading === `approve_kyc-${p.email}` ? "Approving..." : "✓ Approve KYC"}
                        </button>
                        <button
                          onClick={() => { setRejectingId(p.id); setRejectReason(""); }}
                          className={btnRed}>
                          ✕ Reject KYC
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* INSURANCE REVIEW */}
            {activeTab === "insurance" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Insurance Review</h2>
                {pendingInsurance.length === 0 ? (
                  <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No pending insurance applications</p>
                  </div>
                ) : pendingInsurance.map(p => {
                  const expiry = p.insurance_expiry_date ? new Date(p.insurance_expiry_date) : null;
                  const expiringSoon = expiry && expiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return (
                    <div key={p.id} className={cardClass}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{p.first_name} {p.last_name}</p>
                          <p className="text-sm text-muted-foreground">{p.email}</p>
                        </div>
                        <StatusBadge status={p.kyc_status} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Company</p>
                          <p>{p.insurance_company || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Policy Number</p>
                          <p>{p.insurance_policy_number || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Expiry Date</p>
                          <p className={expiringSoon ? "text-red-400 font-medium" : ""}>
                            {p.insurance_expiry_date || "—"}
                            {expiringSoon && " ⚠️ Expiring soon"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Submitted</p>
                          <p>{p.insurance_submitted_at ? new Date(p.insurance_submitted_at).toLocaleDateString("en-GB") : "—"}</p>
                        </div>
                      </div>
                      {p.insurance_certificate_url && (
                        <button
                          onClick={async () => {
                            try {
                              // Extract path from URL
                              const url = p.insurance_certificate_url;
                              const pathMatch = url.match(/painter-insurance\/(.+)$/);
                              if (pathMatch) {
                                const { data } = await supabase.storage
                                  .from("painter-insurance")
                                  .createSignedUrl(pathMatch[1], 300);
                                if (data?.signedUrl) {
                                  window.open(data.signedUrl, "_blank");
                                }
                              } else {
                                window.open(url, "_blank");
                              }
                            } catch {
                              window.open(p.insurance_certificate_url, "_blank");
                            }
                          }}
                          className="text-sm text-blue-400 underline hover:text-blue-300"
                        >
                          View Certificate →
                        </button>
                      )}
                      {rejectingId === `ins-${p.id}` ? (
                        <div className="space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Rejection reason..."
                            rows={2}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => adminAction("reject_insurance", p.email, rejectReason)}
                              disabled={!!actionLoading || !rejectReason.trim()}
                              className={btnRed}>
                              Confirm Reject
                            </button>
                            <button onClick={() => setRejectingId(null)}
                              className="px-4 py-2 border border-border text-muted-foreground rounded text-sm hover:bg-accent">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => adminAction("verify_insurance", p.email)}
                            disabled={actionLoading === `verify_insurance-${p.email}`}
                            className={btnGreen}>
                            {actionLoading === `verify_insurance-${p.email}` ? "Verifying..." : "✓ Verify Insurance"}
                          </button>
                          <button
                            onClick={() => { setRejectingId(`ins-${p.id}`); setRejectReason(""); }}
                            className={btnRed}>
                            ✕ Reject Insurance
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ACTIVATE PAINTERS */}
            {activeTab === "activate" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Ready to Activate</h2>
                {readyToActivate.length === 0 ? (
                  <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No painters ready to activate</p>
                  </div>
                ) : readyToActivate.map(p => (
                  <div key={p.id} className={cardClass}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{p.first_name} {p.last_name}</p>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                        <p className="text-sm text-muted-foreground">{p.phone}</p>
                        <p className="text-sm text-muted-foreground">{p.city} · {p.postcode}</p>
                        <p className="text-sm text-muted-foreground">Radius: {p.service_radius_km}km</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <StatusBadge status="approved" />
                        <span className="text-xs text-green-400">Insurance ✓</span>
                      </div>
                    </div>
                    {p.specialisms?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.specialisms.map((s: string) => (
                          <span key={s} className="text-xs bg-accent px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Registered: {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </p>
                    <button
                      onClick={() => adminAction("activate_painter", p.email)}
                      disabled={actionLoading === `activate_painter-${p.email}`}
                      className={btnOrange}>
                      {actionLoading === `activate_painter-${p.email}` ? "Activating..." : "🚀 Activate Painter"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ALL JOBS */}
            {activeTab === "jobs" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">All Jobs</h2>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Sessions — Job Postings ({sessions.length})
                  </h3>

                  {/* Search and filter controls */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Search by ref, postcode or email..."
                      value={jobSearch}
                      onChange={e => setJobSearch(e.target.value)}
                      className="border border-border bg-background text-sm rounded-md px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:border-foreground"
                    />
                    <select
                      value={jobStatusFilter}
                      onChange={e => setJobStatusFilter(e.target.value)}
                      className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none focus:border-foreground"
                    >
                      <option value="all">All Statuses</option>
                      <option value="job_posted">Job Posted</option>
                      <option value="painter_contacted">Negotiating</option>
                      <option value="invoice_sent">Invoice Sent</option>
                      <option value="funded">Escrow Funded</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completion_requested">Completion Requested</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="disputed">Disputed</option>
                    </select>
                    <select
                      value={jobSortBy}
                      onChange={e => setJobSortBy(e.target.value)}
                      className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none focus:border-foreground"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">By Status</option>
                      <option value="postcode">By Postcode</option>
                    </select>
                    {(jobSearch || jobStatusFilter !== "all") && (
                      <button
                        onClick={() => { setJobSearch(""); setJobStatusFilter("all"); }}
                        className="border border-border text-sm px-3 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Showing {filteredJobs.length} of {sessions.length} jobs
                  </p>

                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-accent/30">
                          <tr>
                            {["Ref", "Job Type", "Postcode", "Rooms", "Status", "Amount", "Painter Payout", "Commission", "Income", "Email", "Posted"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredJobs.map(s => (
                            <tr
                              key={s.id}
                              className="hover:bg-accent/20 transition-colors cursor-pointer"
                              onClick={() => setSelectedJob(s)}
                            >
                              <td className="px-4 py-3 font-mono text-xs">PBC-{s.id.slice(-6).toUpperCase()}</td>
                              <td className="px-4 py-3">{s.job_type || "—"}</td>
                              <td className="px-4 py-3">{s.postcode || "—"}</td>
                              <td className="px-4 py-3">{s.rooms?.length || 0}</td>
                              <td className="px-4 py-3"><StatusBadge status={s.status || "browsing"} /></td>
                              <td className="px-4 py-3">{s.transactions?.[0]?.amount ? `£${Number(s.transactions[0].amount).toFixed(2)}` : "—"}</td>
                              <td className="px-4 py-3 text-green-400">{s.transactions?.[0]?.painter_payout ? `£${Number(s.transactions[0].painter_payout).toFixed(2)}` : "—"}</td>
                              <td className="px-4 py-3 text-muted-foreground">{s.transactions?.[0]?.commission_rate ? `${s.transactions[0].commission_rate}%` : "—"}</td>
                              <td className="px-4 py-3 text-amber-400">{s.transactions?.[0]?.amount && s.transactions?.[0]?.commission_rate ? `£${(Number(s.transactions[0].amount) * Number(s.transactions[0].commission_rate) / 100).toFixed(2)}` : "—"}</td>
                              <td className="px-4 py-3 text-muted-foreground">{s.email || "Anonymous"}</td>
                              <td className="px-4 py-3 text-muted-foreground text-xs">
                                {new Date(s.created_at).toLocaleDateString("en-GB")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Transactions ({transactions.length})
                  </h3>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-accent/30">
                          <tr>
                            {["Invoice", "Customer", "Amount", "Commission", "Payout", "Status", "Date"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {transactions.map(t => (
                            <tr key={t.id} className="hover:bg-accent/20 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs">{t.invoice_id || "—"}</td>
                              <td className="px-4 py-3 text-xs">{t.customer_first_name ? `${t.customer_first_name} ${t.customer_last_name}` : "TBC"}</td>
                              <td className="px-4 py-3">£{t.amount}</td>
                              <td className="px-4 py-3 text-muted-foreground">{t.commission_rate}%</td>
                              <td className="px-4 py-3">£{t.painter_payout}</td>
                              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                              <td className="px-4 py-3 text-muted-foreground text-xs">
                                {new Date(t.created_at).toLocaleDateString("en-GB")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DISPUTES */}
            {activeTab === "disputes" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Disputes</h2>
                {disputes.length === 0 ? (
                  <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No disputes</p>
                  </div>
                ) : disputes.map(d => (
                  <div key={d.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">Dispute #{d.id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">
                          Raised by {d.raised_by} · {new Date(d.created_at).toLocaleDateString("en-GB")}
                        </p>
                        {d.transactions?.amount && (
                          <p className="text-xs text-muted-foreground">Amount: £{d.transactions.amount}</p>
                        )}
                        <p className="text-xs mt-1 border border-border rounded px-2 py-1 inline-block">
                          {d.reason.slice(0, 120)}{d.reason.length > 120 ? "..." : ""}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${
                        d.status === "open" ? "text-red-400 bg-red-900/20 border-red-800/40" :
                        d.status === "investigating" ? "text-amber-400 bg-amber-900/20 border-amber-800/40" :
                        "text-green-400 bg-green-900/20 border-green-800/40"
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    {d.resolution_notes && (
                      <div className="text-xs bg-green-900/20 border border-green-800/40 rounded px-3 py-2 text-green-400">
                        Resolution: {d.resolution_notes}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {d.admin_customer_channel_id && (
                        <button
                          onClick={() => openDisputeChannel(d.admin_customer_channel_id, "customer")}
                          className="flex-1 border border-border text-xs py-2 rounded hover:bg-accent transition-colors"
                        >
                          💬 Message Customer
                        </button>
                      )}
                      {d.admin_painter_channel_id && (
                        <button
                          onClick={() => openDisputeChannel(d.admin_painter_channel_id, "painter")}
                          className="flex-1 border border-border text-xs py-2 rounded hover:bg-accent transition-colors"
                        >
                          💬 Message Painter
                        </button>
                      )}
                    </div>

                    {messagingId === d.admin_customer_channel_id || messagingId === d.admin_painter_channel_id ? (
                      activeDisputeChannel && (messagingId === d.admin_customer_channel_id || messagingId === d.admin_painter_channel_id) && (
                        <div className="space-y-2 border border-border rounded-lg p-3">
                          <p className="text-xs text-muted-foreground font-medium">
                            Messaging {activeDisputeChannel.type} via dispute channel
                          </p>
                          <textarea
                            value={adminMessage}
                            onChange={e => setAdminMessage(e.target.value)}
                            placeholder="Type your message..."
                            rows={3}
                            className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendAdminMessage(messagingId!, adminMessage)}
                              disabled={!adminMessage.trim()}
                              className="flex-1 bg-foreground text-background py-2 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => { setMessagingId(null); setActiveDisputeChannel(null); setAdminMessage(""); }}
                              className="flex-1 border border-border py-2 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )
                    ) : null}

                    {d.status !== "resolved" && (
                      <button
                        onClick={() => resolveDispute(d.id)}
                        className="w-full bg-green-700 text-white text-xs py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}

                    {d.transactions && (
                      <div className="flex gap-2 pt-1 border-t border-border">
                        <button
                          onClick={() => updateTransactionStatus(d.transactions.id, "completed", d.transactions)}
                          disabled={actionLoading === d.transactions.id}
                          className={btnGreen + " text-xs py-1.5"}>
                          Release to Painter
                        </button>
                        <button
                          onClick={() => updateTransactionStatus(d.transactions.id, "cancelled", d.transactions)}
                          disabled={actionLoading === d.transactions.id}
                          className={btnRed + " text-xs py-1.5"}>
                          Refund Customer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdateStatus={updateTransactionStatus}
        />
      )}
    </div>
  );
}
