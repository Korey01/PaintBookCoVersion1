import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Clock, MessageSquare, Shield, AlertTriangle, XCircle, ChevronRight, Loader2 } from "lucide-react";

const STATUS_STEPS = [
  { key: "job_posted",        label: "Job Posted" },
  { key: "painter_contacted", label: "Painter Matched" },
  { key: "invoice_sent",      label: "Invoice Received" },
  { key: "funded",            label: "Escrow Funded" },
  { key: "in_progress",       label: "In Progress" },
  { key: "completed",         label: "Completed" },
];

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function JobSessionPage() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (!token) { setError("Invalid link."); setLoading(false); return; }
    loadSession();
  }, [token]);

  async function loadSession() {
    setLoading(true);
    try {
      const { data: sess, error: sessErr } = await supabase
        .from("sessions")
        .select("*")
        .eq("customer_token", token)
        .single();

      if (sessErr || !sess) {
        setError("This link is invalid or has expired.");
        setLoading(false);
        return;
      }
      setSession(sess);

      if (sess.transaction_id) {
        const { data: tx } = await supabase
          .from("transactions")
          .select("*, painters(first_name, last_name)")
          .eq("id", sess.transaction_id)
          .single();
        setTransaction(tx);
      }
    } catch (err) {
      setError("Failed to load your job. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    if (!transaction) return;
    setActionLoading(action);
    setActionMessage("");
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            transaction_id: transaction.id,
            customer_token: token,
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setActionMessage(result.message || "Done.");
        await loadSession();
      } else {
        setActionMessage(result.error || "Something went wrong.");
      }
    } catch {
      setActionMessage("Request failed. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading your job...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-sm">
        <XCircle className="h-10 w-10 text-destructive mx-auto" />
        <h1 className="text-xl font-semibold">Link not found</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  const status = transaction?.status || session?.status || "job_posted";
  const stepIndex = getStepIndex(status);
  const isReadOnly = ["completed", "cancelled", "disputed"].includes(status);
  // Painter name: first name only until escrow funded; full name after
  const painterName = transaction?.painters
    ? (["funded", "in_progress", "completion_requested", "completed"].includes(status)
        ? `${transaction.painters.first_name} ${transaction.painters.last_name}`
        : transaction.painters.first_name)
    : null;

  async function handlePayNow() {
    if (!transaction) return;
    setPayLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-transpact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            transaction_id: transaction.id,
            customer_token: token,
          }),
        }
      );
      const result = await res.json();
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        setActionMessage(result.error || "Could not create payment. Please try again.");
      }
    } catch {
      setActionMessage("Payment request failed. Please try again.");
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">PaintBookCo</p>
            <p className="font-semibold text-sm">Job Tracker</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Job reference</p>
            <p className="font-mono text-xs font-medium">PBC-{session?.id?.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {isReadOnly && (
          <div className="bg-accent/20 border border-border rounded-md p-3 text-sm text-center text-muted-foreground">
            This job is <strong>{status}</strong>. This page is now read-only and kept for your records.
          </div>
        )}

        {/* Status tracker */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-medium mb-4">Job Progress</h2>
          <div className="space-y-3">
            {STATUS_STEPS.map((step, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              const upcoming = i > stepIndex;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    done ? "bg-green-500" : current ? "bg-foreground" : "bg-muted"
                  }`}>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : current ? (
                      <Clock className="h-3 w-3 text-background" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    done ? "text-muted-foreground line-through" :
                    current ? "font-medium text-foreground" :
                    "text-muted-foreground"
                  }`}>{step.label}</span>
                  {current && <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full">Current</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Job details */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-medium">Job Details</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Type</span>
            <span>{session?.job_type?.replace(/_/g, " ")}</span>
            <span className="text-muted-foreground">Location</span>
            <span>{session?.city}, {session?.postcode?.split(" ")[0]}</span>
            {painterName && <>
              <span className="text-muted-foreground">Painter</span>
              <span>{painterName}</span>
            </>}
            {transaction?.amount && <>
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">£{transaction.amount.toFixed(2)}</span>
            </>}
          </div>
        </div>

        {/* Invoice + Pay Now */}
        {transaction?.invoice_html && status === "invoice_sent" && !isReadOnly && (
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" /> Invoice
            </h2>
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(transaction.invoice_html) }}
            />

            {actionMessage && (
              <p className="text-sm text-destructive text-center">{actionMessage}</p>
            )}

            <button
              onClick={handlePayNow}
              disabled={payLoading}
              className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {payLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay Now — Secure Escrow
            </button>
          </div>
        )}

        {/* Milestones */}
        {transaction?.milestones?.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-medium">Milestones</h2>
            {transaction.milestones.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <span>{m.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.status === "completed" ? "bg-green-100 text-green-700" :
                  m.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                  "bg-muted text-muted-foreground"
                }`}>{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chat link */}
        {transaction?.chat_channel_id && !isReadOnly && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" /> Chat with your painter
            </h2>

            <a
              href={`/chat/${transaction.chat_channel_id}?token=${token}`}
              className="block w-full border border-border text-center py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              Open Chat
            </a>
          </div>
        )}

        {/* Action buttons */}
        {!isReadOnly && transaction && (
          <div className="space-y-3">
            {actionMessage && (
              <div className="bg-accent/20 border border-border rounded-md p-3 text-sm text-center">
                {actionMessage}
              </div>
            )}

            {["funded", "in_progress", "completion_requested"].includes(status) && (
              <button
                onClick={() => handleAction("confirm-completion")}
                disabled={!!actionLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === "confirm-completion" ? "Processing..." : "Confirm Job Complete — Release Payment"}
              </button>
            )}

            {["funded", "in_progress", "completion_requested"].includes(status) && (
              <button
                onClick={() => handleAction("raise-dispute")}
                disabled={!!actionLoading}
                className="w-full border border-destructive text-destructive py-3 rounded-md text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === "raise-dispute" ? "Processing..." : "Raise a Dispute"}
              </button>
            )}

            {["job_posted", "painter_contacted"].includes(status) && (
              <button
                onClick={() => handleAction("cancel-job")}
                disabled={!!actionLoading}
                className="w-full border border-border text-muted-foreground py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {actionLoading === "cancel-job" ? "Processing..." : "Cancel Job"}
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
