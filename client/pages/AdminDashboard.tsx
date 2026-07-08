import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, CheckCircle2, XCircle, LogOut, Shield, Briefcase, AlertTriangle, Users, BarChart3 } from "lucide-react";
import DOMPurify from "dompurify";
import { PaintBookChatAdmin } from "@/components/chat/PaintBookChatAdmin";

interface DisputeResolutionModalProps {
  dispute: any;
  onClose: () => void;
  onResolved: () => void;
  session: any;
  SUPABASE_URL: string;
  ANON_KEY: string;
}

function DisputeResolutionModal({ dispute, onClose, onResolved, session, SUPABASE_URL, ANON_KEY }: DisputeResolutionModalProps) {
  const [resolutionType, setResolutionType] = useState<"mutual" | "release" | "refund">("mutual");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState<number>(dispute.transactions?.amount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const originalAmount = dispute.transactions?.amount || 0;

  const handleResolve = async () => {
    if (!notes.trim()) { setError("Please enter resolution notes."); return; }
    if ((resolutionType === "release" || resolutionType === "refund") && (!amount || amount <= 0)) {
      setError("Please enter a valid amount."); return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/disputes?id=eq.${dispute.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": ANON_KEY,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          status: "resolved",
          resolution_notes: `[${resolutionType.toUpperCase()}] ${notes}`,
          resolved_by: "admin",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      const transactionId = dispute.transaction_id;
      const sessionId = dispute.session_id;

      if (resolutionType === "mutual") {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${transactionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "completion_requested", disputed_at: null }),
        });
        await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "completion_requested" }),
        });
      } else if (resolutionType === "release") {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${transactionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "completed", amount, resolution_type: "admin_release" }),
        });
        await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "completed" }),
        });
      } else if (resolutionType === "refund") {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${transactionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "cancelled", amount, resolution_type: "admin_refund" }),
        });
        await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "cancelled" }),
        });
      }

      onResolved();
    } catch {
      setError("Failed to resolve dispute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl max-w-lg w-full p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Resolve Dispute</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Dispute #{dispute.id.slice(-6).toUpperCase()} · £{originalAmount} at stake</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Resolution Type</label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/20 transition-colors">
              <input type="radio" name="resolution" value="mutual" checked={resolutionType === "mutual"} onChange={() => setResolutionType("mutual")} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">✅ Mutual Resolution — Return to Completion</p>
                <p className="text-xs text-muted-foreground">Painter and customer have agreed. Job returns to "Pending Completion" so customer can confirm and release payment.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/20 transition-colors">
              <input type="radio" name="resolution" value="release" checked={resolutionType === "release"} onChange={() => setResolutionType("release")} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">💰 Release to Painter</p>
                <p className="text-xs text-muted-foreground">Admin releases escrow funds to painter. Use when painter has completed work satisfactorily.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/20 transition-colors">
              <input type="radio" name="resolution" value="refund" checked={resolutionType === "refund"} onChange={() => setResolutionType("refund")} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">↩️ Refund to Customer</p>
                <p className="text-xs text-muted-foreground">Admin refunds customer. Use when painter has not completed work or breached agreement.</p>
              </div>
            </label>
          </div>
        </div>

        {(resolutionType === "release" || resolutionType === "refund") && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {resolutionType === "release" ? "Amount to Release to Painter" : "Amount to Refund to Customer"} (£)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">£</span>
              <input
                type="number"
                min="0"
                max={originalAmount}
                step="0.01"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">Original amount: £{originalAmount}. You can adjust this for partial resolutions.</p>
            {amount !== originalAmount && (
              <p className="text-xs text-amber-400">⚠️ Adjusted amount differs from original escrow amount of £{originalAmount}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Resolution Notes *</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe the resolution and any actions taken..."
            rows={3}
            className="w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border py-2.5 rounded-lg text-sm hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={loading || !notes.trim()}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              resolutionType === "refund" ? "bg-red-600 text-white hover:bg-red-700" :
              resolutionType === "release" ? "bg-green-600 text-white hover:bg-green-700" :
              "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {loading ? "Processing..." :
              resolutionType === "mutual" ? "Return to Completion" :
              resolutionType === "release" ? `Release £${amount} to Painter` :
              `Refund £${amount} to Customer`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

type Tab = "kyc" | "insurance" | "cscs" | "activate" | "jobs" | "disputes" | "rtw";

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


// ── Right to Work Tab ────────────────────────────────────────────────────────
function RTWTab({ session, SUPABASE_URL, ANON_KEY, onRequestRTW }: { session: any; SUPABASE_URL: string; ANON_KEY: string; onRequestRTW: (p: any) => void }) {
  const [painters, setPainters] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const headers = { "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY };
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const dateStr = thirtyDaysFromNow.toISOString().split("T")[0];

      // Get expired RTW painters
      const expiredRes = await fetch(
        `${SUPABASE_URL}/rest/v1/painters?rtw_status=eq.expired&select=*&order=rtw_visa_expiry.asc`,
        { headers }
      );
      // Get expiring within 30 days
      const expiringRes = await fetch(
        `${SUPABASE_URL}/rest/v1/painters?rtw_visa_expiry=lte.${dateStr}&rtw_status=eq.verified&select=*&order=rtw_visa_expiry.asc`,
        { headers }
      );
      // Get not checked
      const uncheckedRes = await fetch(
        `${SUPABASE_URL}/rest/v1/painters?rtw_status=eq.not_checked&kyc_status=eq.approved&select=*&order=created_at.desc`,
        { headers }
      );

      const expired = await expiredRes.json();
      const expiring = await expiringRes.json();
      const unchecked = await uncheckedRes.json();

      const combined = [
        ...(expired || []).map((p: any) => ({ ...p, rtw_flag: "expired" })),
        ...(expiring || []).map((p: any) => ({ ...p, rtw_flag: "expiring" })),
        ...(unchecked || []).map((p: any) => ({ ...p, rtw_flag: "unchecked" })),
      ];
      setPainters(combined);
      setLoading(false);
    }
    load();
  }, [session, SUPABASE_URL, ANON_KEY]);

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Phone", "RTW Status", "Visa Expiry", "Flag"],
      ...painters.map(p => [
        `${p.first_name} ${p.last_name}`, p.email, p.phone || "",
        p.rtw_status, p.rtw_visa_expiry || "N/A", p.rtw_flag
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rtw_report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-center text-muted-foreground py-12">Loading RTW data...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Right to Work Report</h2>
        <button onClick={exportCSV} className="px-4 py-2 border border-border rounded text-sm hover:bg-accent transition-colors">
          ↓ Export CSV
        </button>
      </div>

      {painters.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
          <p>No RTW issues found</p>
        </div>
      ) : painters.map(p => (
        <div key={p.id} className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{p.first_name} {p.last_name}</p>
              <p className="text-sm text-muted-foreground">{p.email} · {p.phone}</p>
              {p.rtw_visa_expiry && (
                <p className="text-sm text-muted-foreground">Visa expiry: {new Date(p.rtw_visa_expiry).toLocaleDateString("en-GB")}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              p.rtw_flag === "expired" ? "bg-red-900/40 text-red-400" :
              p.rtw_flag === "expiring" ? "bg-amber-900/40 text-amber-400" :
              "bg-blue-900/40 text-blue-400"
            }`}>
              {p.rtw_flag === "expired" ? "⚠️ RTW Expired" :
               p.rtw_flag === "expiring" ? "⏰ Expiring Soon" :
               "❓ Not Checked"}
            </span>
          </div>
          <button
            onClick={() => onRequestRTW(p)}
            className="px-4 py-2 border border-amber-500 text-amber-500 rounded text-sm hover:bg-amber-500/10 transition-colors"
          >
            📋 Trigger RTW Check
          </button>
        </div>
      ))}
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
  const [pendingCSCS, setPendingCSCS] = useState<any[]>([]);
  const [readyToActivate, setReadyToActivate] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobSortBy, setJobSortBy] = useState("newest");

  const [jobDateFrom, setJobDateFrom] = React.useState("");
  const [jobDateTo, setJobDateTo] = React.useState("");
  const [jobTypeFilter, setJobTypeFilter] = React.useState("all");

  const filteredJobs = sessions
    .filter(s => {
      if (jobStatusFilter !== "all" && s.status !== jobStatusFilter) return false;
      if (jobTypeFilter !== "all" && (s.job_type || "") !== jobTypeFilter) return false;
      if (jobDateFrom && new Date(s.created_at) < new Date(jobDateFrom)) return false;
      if (jobDateTo && new Date(s.created_at) > new Date(jobDateTo + "T23:59:59")) return false;
      if (jobSearch) {
        const q = jobSearch.toLowerCase();
        const ref = `pbc-${s.id.slice(-6).toLowerCase()}`;
        return ref.includes(q) || (s.postcode || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q) || (s.job_type || "").toLowerCase().includes(q);
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
    pendingKYC: 0, pendingInsurance: 0, pendingCSCS: 0,
    readyToActivate: 0, activePainters: 0,
    openDisputes: 0, jobsToday: 0,
  });

  // Rejection reason state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rtwModal, setRtwModal] = useState<any | null>(null);
  const [approveKycModal, setApproveKycModal] = useState<any | null>(null);
  const [rtwEligible, setRtwEligible] = useState<boolean | null>(null);
  const [rtwVisaExpiry, setRtwVisaExpiry] = useState("");
  const [rtwNoExpiry, setRtwNoExpiry] = useState(false);
  const [rtwNotes, setRtwNotes] = useState("");
  const [rtwSending, setRtwSending] = useState(false);

  // Job detail modal
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState<any | null>(null);

  // Dispute messaging state
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [messageRecipient, setMessageRecipient] = useState<"customer" | "painter">("customer");
  const [activeDisputeChannel, setActiveDisputeChannel] = useState<{
    id: string;
    painterChannelId: string;
    sessionId: string;
    type: "customer" | "painter";
  } | null>(null);
  const [disputeChatTab, setDisputeChatTab] = useState<string>("customer");
  const [disputeUnread, setDisputeUnread] = useState<Record<string, number>>({});

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
        activePaintersRes, cscsRes
      ] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/painters?kyc_status=in.(pending,submitted)&select=*&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?insurance_submitted_at=not.is.null&insurance_verified=eq.false&select=*&order=insurance_submitted_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?kyc_status=eq.approved&insurance_verified=eq.true&is_active=eq.false&select=*&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/sessions?select=*,transactions(id,invoice_id,amount,commission_rate,painter_payout,status,invoice_html,funded_at,completed_at,disputed_at,invoice_sent_at,session_id,painter_id,customer_first_name,customer_last_name,customer_email,customer_phone,customer_postcode)&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/disputes?select=*,transactions(id,amount,painter_id,customer_email,customer_first_name,customer_last_name,disputed_at,painters(id,first_name,last_name,email,phone))&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?is_active=eq.true&select=id`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/painters?cscs_submitted_at=not.is.null&cscs_verified=eq.false&select=*&order=cscs_submitted_at.desc`, { headers }),
      ]);

      const [kyc, insurance, activate, sess, trans, disp, active, cscs] = await Promise.all([
        kycRes.json(), insuranceRes.json(), activateRes.json(),
        sessionsRes.json(), transactionsRes.json(), disputesRes.json(),
        activePaintersRes.json(),
        cscsRes.json(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const todayJobs = (sess || []).filter((s: any) =>
        s.created_at?.startsWith(today)
      ).length;

      setPendingKYC(kyc || []);
      setPendingCSCS(cscs || []);
      setPendingInsurance(insurance || []);
      setReadyToActivate(activate || []);
      setSessions(sess || []);
      setTransactions(trans || []);
      setDisputes(disp || []);
      setStats({
        pendingKYC: (kyc || []).length,
        pendingInsurance: (insurance || []).length,
        pendingCSCS: (cscs || []).length,
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
        if (!authSession?.access_token) throw new Error("No auth session");
        const tokenRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${authSession.access_token}`,
            },
            body: JSON.stringify({ session_id: "admin" }),
          }
        );
        const tokenData = await tokenRes.json();
        console.log("Admin Stream token response:", tokenRes.status, JSON.stringify(tokenData).slice(0, 100));
        if (!tokenData.token || !tokenData.user_id) throw new Error(`Token fetch failed: ${JSON.stringify(tokenData)}`);
        await streamClient.connectUser(
          { id: tokenData.user_id, name: "PaintBookCo Admin", role: "admin" },
          tokenData.token
        );
        console.log("Admin connected to Stream as:", tokenData.user_id);
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

  const openDisputeChannel = (dispute: any) => {
    setActiveDisputeChannel({
      id: dispute.admin_customer_channel_id,
      painterChannelId: dispute.admin_painter_channel_id,
      sessionId: dispute.session_id,
      type: "customer",
    });
    setDisputeChatTab("customer");
    setMessagingId(dispute.admin_customer_channel_id);
    setAdminMessage("");
  };

  const resolveDispute = (dispute: any) => {
    setResolvingDispute(dispute);
  };

  const tabs = [
    { id: "kyc", label: "KYC Review", icon: Shield, count: stats.pendingKYC },
    { id: "rtw", label: "Right to Work", icon: Shield, count: 0 },
    { id: "insurance", label: "Insurance", icon: CheckCircle2, count: stats.pendingInsurance },
    { id: "cscs", label: "CSCS Cards", icon: Shield, count: stats.pendingCSCS },
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
          <img src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png" alt="PaintBookCo" className="h-7 object-contain" />
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
          { label: "Pending CSCS", value: stats.pendingCSCS, color: "text-purple-400" },
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
                          onClick={() => { setApproveKycModal(p); setRtwEligible(null); setRtwVisaExpiry(""); setRtwNoExpiry(false); setRtwNotes(""); }}
                          disabled={actionLoading === `approve_kyc-${p.email}`}
                          className={btnGreen}>
                          ✓ Approve KYC
                        </button>
                        <button
                          onClick={() => { setRejectingId(p.id); setRejectReason(""); }}
                          className={btnRed}>
                          ✕ Reject KYC
                        </button>
                        <button
                          onClick={() => setRtwModal(p)}
                          className="px-4 py-2 border border-amber-500 text-amber-500 rounded text-sm hover:bg-amber-500/10 transition-colors">
                          📋 Request RTW
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

            {activeTab === "cscs" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">CSCS Card Review</h2>
                {pendingCSCS.length === 0 ? (
                  <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No pending CSCS card submissions</p>
                  </div>
                ) : pendingCSCS.map(p => (
                  <div key={p.id} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{p.first_name} {p.last_name}</p>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                        <p className="text-sm text-muted-foreground">Card type: {p.cscs_card_type}</p>
                        <p className="text-sm text-muted-foreground">Card number: {p.cscs_card_number}</p>
                        <p className="text-sm text-muted-foreground">Expires: {p.cscs_expiry_date ? new Date(p.cscs_expiry_date).toLocaleDateString("en-GB") : "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(p.cscs_submitted_at).toLocaleDateString("en-GB")}</p>
                      </div>
                      <StatusBadge status={p.cscs_verified ? "approved" : "submitted"} />
                    </div>

                    {p.cscs_card_url && (
                      <div className="flex gap-2">
                        <a href={p.cscs_card_url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-400 underline hover:text-blue-300">
                          📄 View CSCS Card
                        </a>
                      </div>
                    )}

                    {rejectingId === p.id ? (
                      <div className="space-y-2">
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..." rows={2}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            await fetch(`${SUPABASE_URL}/rest/v1/painters?id=eq.${p.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
                              body: JSON.stringify({ cscs_rejection_reason: rejectReason, cscs_submitted_at: null }),
                            });
                            setMessage({ text: "CSCS card rejected", type: "success" });
                            setRejectingId(null);
                            setRejectReason("");
                            await loadAll(session.access_token);
                            setTimeout(() => setMessage({ text: "", type: "" }), 4000);
                          }} className={btnRed}>Confirm Reject</button>
                          <button onClick={() => setRejectingId(null)} className="px-4 py-2 border border-border text-muted-foreground rounded text-sm hover:bg-accent">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={async () => {
                          await fetch(`${SUPABASE_URL}/rest/v1/painters?id=eq.${p.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
                            body: JSON.stringify({ cscs_verified: true, cscs_verified_at: new Date().toISOString(), cscs_verified_by: session.user.email }),
                          });
                          setMessage({ text: `✓ CSCS card verified for ${p.first_name}`, type: "success" });
                          await loadAll(session.access_token);
                          setTimeout(() => setMessage({ text: "", type: "" }), 4000);
                        }} className={btnGreen}>✓ Verify CSCS</button>
                        <button onClick={() => { setRejectingId(p.id); setRejectReason(""); }} className={btnRed}>✕ Reject CSCS</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

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
                    <select
                      value={jobTypeFilter}
                      onChange={e => setJobTypeFilter(e.target.value)}
                      className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none focus:border-foreground"
                    >
                      <option value="all">All Job Types</option>
                      <option value="interior-painting">Interior Painting</option>
                      <option value="exterior-painting">Exterior Painting</option>
                      <option value="wallpaper">Wallpaper</option>
                      <option value="feature-wall">Feature Wall</option>
                      <option value="tv-wall">TV Wall</option>
                      <option value="commercial">Commercial</option>
                    </select>
                    <input
                      type="date"
                      value={jobDateFrom}
                      onChange={e => setJobDateFrom(e.target.value)}
                      className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none focus:border-foreground"
                      title="From date"
                    />
                    <input
                      type="date"
                      value={jobDateTo}
                      onChange={e => setJobDateTo(e.target.value)}
                      className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none focus:border-foreground"
                      title="To date"
                    />
                    {(jobSearch || jobStatusFilter !== "all" || jobTypeFilter !== "all" || jobDateFrom || jobDateTo) && (
                      <button
                        onClick={() => { setJobSearch(""); setJobStatusFilter("all"); setJobTypeFilter("all"); setJobDateFrom(""); setJobDateTo(""); }}
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
            {activeTab === "rtw" && (
              <RTWTab session={session} SUPABASE_URL={SUPABASE_URL} ANON_KEY={ANON_KEY} onRequestRTW={(p: any) => setRtwModal(p)} />
            )}

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
                        {d.attachments && d.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {d.attachments.map((url: string, i: number) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                className="block border border-border rounded overflow-hidden hover:opacity-80 transition-opacity"
                              >
                                {url.match(/\.(mp4|mov|webm)$/i) ? (
                                  <div className="w-20 h-16 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                    🎥 Video
                                  </div>
                                ) : (
                                  <img src={url} alt={`Attachment ${i+1}`} className="w-20 h-16 object-cover" />
                                )}
                              </a>
                            ))}
                          </div>
                        )}
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

                    {(d.admin_customer_channel_id || d.admin_painter_channel_id) && (
                      <div>
                        <button
                          onClick={() =>
                            activeDisputeChannel?.id === d.admin_customer_channel_id
                              ? (setActiveDisputeChannel(null), setMessagingId(null))
                              : openDisputeChannel(d)
                          }
                          className="w-full border border-border text-xs py-2 rounded hover:bg-accent transition-colors"
                        >
                          {activeDisputeChannel?.id === d.admin_customer_channel_id
                            ? "Hide Chat Channels"
                            : "💬 Open Dispute Channels"}
                        </button>

                        {activeDisputeChannel?.id === d.admin_customer_channel_id && (
                          <div className="mt-3 border border-border rounded-xl overflow-hidden">
                            <div className="flex border-b border-border">
                              {[
                                { id: "job", label: "Job Chat (read-only)" },
                                { id: "customer", label: "Customer Channel" },
                                { id: "painter", label: "Painter Channel" },
                              ].map(tab => (
                                <button
                                  key={tab.id}
                                  onClick={() => setDisputeChatTab(tab.id)}
                                  className={`flex-1 py-2 text-xs font-medium border-r last:border-r-0 border-border transition-colors ${
                                    disputeChatTab === tab.id
                                      ? "bg-foreground text-background"
                                      : "hover:bg-accent"
                                  }`}
                                >
                                  {tab.label}
                                  {(disputeUnread[tab.id] || 0) > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 text-white rounded-full">
                                      {disputeUnread[tab.id]}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="h-96">
                              {disputeChatTab === "job" && (
                                <PaintBookChatAdmin
                                  channelId={`job-${activeDisputeChannel.sessionId}`}
                                  readOnly={true}
                                  supabase={supabase}
                                />
                              )}
                              {disputeChatTab === "customer" && (
                                <PaintBookChatAdmin
                                  channelId={activeDisputeChannel.id}
                                  readOnly={false}
                                  supabase={supabase}
                                  onUnreadChange={(count) =>
                                    setDisputeUnread(prev => ({ ...prev, customer: count }))
                                  }
                                />
                              )}
                              {disputeChatTab === "painter" && (
                                <PaintBookChatAdmin
                                  channelId={activeDisputeChannel.painterChannelId}
                                  readOnly={false}
                                  supabase={supabase}
                                  onUnreadChange={(count) =>
                                    setDisputeUnread(prev => ({ ...prev, painter: count }))
                                  }
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {d.status !== "resolved" && (
                      <button
                        onClick={() => resolveDispute(d)}
                        className="w-full bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        ✓ Resolve Dispute
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

      {resolvingDispute && (
        <DisputeResolutionModal
          dispute={resolvingDispute}
          onClose={() => setResolvingDispute(null)}
          onResolved={async () => {
            setResolvingDispute(null);
            setMessage({ text: "Dispute resolved successfully", type: "success" });
            await loadAll(session.access_token);
            setTimeout(() => setMessage({ text: "", type: "" }), 4000);
          }}
          session={session}
          SUPABASE_URL={SUPABASE_URL}
          ANON_KEY={ANON_KEY}
        />
      )}

      {/* RTW Request Modal */}
      {rtwModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Request Right to Work — {rtwModal.first_name} {rtwModal.last_name}</h2>
            <p className="text-sm text-muted-foreground">The following message will be sent via Stream Chat to the painter:</p>
            <div className="bg-muted/40 rounded-lg p-3 text-sm text-muted-foreground border border-border leading-relaxed">
              Hello {rtwModal.first_name}, as part of our compliance process under UK immigration law, we need to verify your right to work in the UK. If you do not hold a British or Irish passport, please provide your share code and date of birth, or upload supporting documents via your dashboard. This is a legal requirement under the Immigration, Asylum and Nationality Act 2006. Please contact us at hello@paintbookco.co.uk if you need assistance.
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setRtwSending(true);
                  try {
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-action`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY },
                      body: JSON.stringify({ action: "request_rtw", painter_email: rtwModal.email }),
                    });
                    const result = await res.json();
                    if (result.success) {
                      setMessage({ text: `✓ RTW request sent to ${rtwModal.first_name}`, type: "success" });
                      setRtwModal(null);
                    } else {
                      setMessage({ text: result.error || "Failed to send RTW request", type: "error" });
                    }
                  } catch { setMessage({ text: "Network error", type: "error" }); }
                  setRtwSending(false);
                  setTimeout(() => setMessage({ text: "", type: "" }), 4000);
                }}
                disabled={rtwSending}
                className={btnGreen}
              >
                {rtwSending ? "Sending..." : "Send RTW Request"}
              </button>
              <button onClick={() => setRtwModal(null)} className="px-4 py-2 border border-border rounded text-sm hover:bg-accent">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve KYC Modal with RTW Check */}
      {approveKycModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Approve KYC — {approveKycModal.first_name} {approveKycModal.last_name}</h2>
            <p className="text-sm text-muted-foreground">Please confirm Right to Work eligibility before approving KYC.</p>
            <div className="space-y-3">
              <p className="text-sm font-medium">Is this painter eligible to work in the UK?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="rtw_eligible" checked={rtwEligible === true} onChange={() => setRtwEligible(true)} /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="rtw_eligible" checked={rtwEligible === false} onChange={() => setRtwEligible(false)} /> No
                </label>
              </div>
              {rtwEligible === true && (
                <div className="space-y-3 border border-border rounded-lg p-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={rtwNoExpiry} onChange={e => { setRtwNoExpiry(e.target.checked); setRtwVisaExpiry(""); }} />
                    No expiry — British/Irish passport or EU Settled Status
                  </label>
                  {!rtwNoExpiry && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Visa Expiry Date</label>
                      <input type="date" value={rtwVisaExpiry} onChange={e => setRtwVisaExpiry(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground" />
                    </div>
                  )}
                </div>
              )}
              {rtwEligible === false && (
                <div className="border border-red-800/40 bg-red-900/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">⚠️ This painter cannot be approved — they are not eligible to work in the UK.</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Notes</label>
                <textarea value={rtwNotes} onChange={e => setRtwNotes(e.target.value)} rows={2}
                  placeholder="e.g. British passport verified, Tier 2 visa confirmed..."
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                disabled={!(rtwEligible === true && (rtwNoExpiry || rtwVisaExpiry)) || actionLoading === `approve_kyc-${approveKycModal.email}`}
                onClick={async () => {
                  await fetch(`${SUPABASE_URL}/rest/v1/painters?email=eq.${encodeURIComponent(approveKycModal.email)}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}`, "apikey": ANON_KEY, "Prefer": "return=minimal" },
                    body: JSON.stringify({ rtw_eligible: true, rtw_visa_expiry: rtwNoExpiry ? null : rtwVisaExpiry, rtw_status: "verified", rtw_checked_at: new Date().toISOString(), rtw_checked_by: session.user.email, rtw_notes: rtwNotes }),
                  });
                  await adminAction("approve_kyc", approveKycModal.email);
                  setApproveKycModal(null);
                }}
                className={`${btnGreen} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {actionLoading === `approve_kyc-${approveKycModal.email}` ? "Approving..." : "✓ Confirm & Approve KYC"}
              </button>
              <button onClick={() => setApproveKycModal(null)} className="px-4 py-2 border border-border rounded text-sm hover:bg-accent">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
