import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, CheckCircle2, XCircle, LogOut, Shield, Briefcase, AlertTriangle, Users, BarChart3 } from "lucide-react";

const ADMIN_EMAIL = "o.a.alashe@paintbookco.co.uk";
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
  const [stats, setStats] = useState({
    pendingKYC: 0, pendingInsurance: 0,
    readyToActivate: 0, activePainters: 0,
    openDisputes: 0, jobsToday: 0,
  });

  // Rejection reason state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
        fetch(`${SUPABASE_URL}/rest/v1/sessions?select=*&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/transactions?status=eq.disputed&select=*&order=disputed_at.desc`, { headers }),
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
        openDisputes: (disp || []).length,
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

  const updateTransactionStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
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
      setMessage({ text: `✓ Transaction updated to ${status}`, type: "success" });
      await loadAll(session.access_token);
    } catch (err) {
      setMessage({ text: "Update failed", type: "error" });
    }
    setActionLoading(null);
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
          <img src="/logo.png" alt="PaintBookCo" className="h-7 object-contain" />
          <span className="text-sm font-medium text-muted-foreground">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadAll(session.access_token)}
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
                              disabled={!!actionLoading}
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
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-accent/30">
                          <tr>
                            {["Ref", "Job Type", "Postcode", "Rooms", "Status", "Email", "Posted"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sessions.map(s => (
                            <tr key={s.id} className="hover:bg-accent/20 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs">PBC-{s.id.slice(-6).toUpperCase()}</td>
                              <td className="px-4 py-3">{s.job_type || "—"}</td>
                              <td className="px-4 py-3">{s.postcode || "—"}</td>
                              <td className="px-4 py-3">{s.rooms?.length || 0}</td>
                              <td className="px-4 py-3"><StatusBadge status={s.status || "browsing"} /></td>
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
                    <p>No open disputes</p>
                  </div>
                ) : disputes.map(d => (
                  <div key={d.id} className={cardClass}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{d.invoice_id}</p>
                        <p className="font-medium mt-1">£{d.amount}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
                        <p>{d.customer_first_name} {d.customer_last_name}</p>
                        <p className="text-muted-foreground">{d.customer_email}</p>
                        <p className="text-muted-foreground">{d.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Job Address</p>
                        <p>{d.customer_address}</p>
                        <p className="text-muted-foreground">{d.customer_postcode}</p>
                      </div>
                    </div>
                    {d.job_summary && (
                      <p className="text-sm text-muted-foreground border-t border-border pt-3">
                        {d.job_summary}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Disputed: {d.disputed_at ? new Date(d.disputed_at).toLocaleDateString("en-GB") : "—"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTransactionStatus(d.id, "completed")}
                        disabled={actionLoading === d.id}
                        className={btnGreen}>
                        Release to Painter
                      </button>
                      <button
                        onClick={() => updateTransactionStatus(d.id, "cancelled")}
                        disabled={actionLoading === d.id}
                        className={btnRed}>
                        Refund Customer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
