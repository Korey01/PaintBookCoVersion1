import { useEffect, useState } from "react";
import React from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/lib/supabase";
import { PaintBookChat } from "@/components/chat/PaintBookChat";
import { DisputeModal } from "@/components/dispute/DisputeModal";
import { CheckCircle2, Clock, MessageSquare, Shield, AlertTriangle, XCircle, ChevronRight, Loader2, Star } from "lucide-react";

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

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              n <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
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
  const [showFindAnotherPainterConfirm, setShowFindAnotherPainterConfirm] = useState(false);
  const [findingAnotherPainter, setFindingAnotherPainter] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showPayPrompt, setShowPayPrompt] = React.useState(false);
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [adminUnread, setAdminUnread] = useState(0);

  const [disputeChannelId, setDisputeChannelId] = useState<string | null>(null);

  // Review state
  const [review, setReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
      if (sess.status === "disputed") {
        setDisputeChannelId(`dispute-customer-${sess.id}`);
      }

      const { data: tx } = await supabase
        .from("transactions")
        .select("*, painters(first_name, last_name)")
        .eq("session_id", sess.id)
        .maybeSingle();
      if (tx) setTransaction(tx);

      // Check for existing review
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id, rating, review_text, created_at")
        .eq("session_id", sess.id)
        .maybeSingle();
      if (existingReview) setReview(existingReview);

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
        // Optimistic UI update — don't wait for full reload
        if (action === "confirm-completion") setStatus("completed");
        else if (action === "raise-dispute") setStatus("disputed");
        else if (action === "cancel-job") setStatus("cancelled");
        loadSession(); // reload in background
      } else {
        setActionMessage(result.error || "Something went wrong.");
      }
    } catch {
      setActionMessage("Request failed. Please try again.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError("");
    if (reviewRating === 0) { setReviewError("Please select a star rating."); return; }
    if (reviewText.trim().length < 20) { setReviewError("Review must be at least 20 characters."); return; }
    if (reviewText.trim().length > 500) { setReviewError("Review must be under 500 characters."); return; }
    setReviewLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-job`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            customer_token: token,
            session_id: session?.id,
            rating: reviewRating,
            review_text: reviewText.trim(),
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setReviewSubmitted(true);
        setReview({ rating: reviewRating, review_text: reviewText.trim(), created_at: new Date().toISOString() });
      } else {
        setReviewError(result.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setReviewError("Failed to submit review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center ambient-ivory">
      <p className="text-sm" style={{ color: "#9B8A75" }}>Loading your job...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-6 ambient-ivory">
      <div className="text-center space-y-4 max-w-sm">
        <XCircle className="h-10 w-10 mx-auto" style={{ color: "#D85A30" }} />
        <h1 className="text-xl font-semibold" style={{ color: "#3A3228" }}>Link not found</h1>
        <p className="text-sm" style={{ color: "#9B8A75" }}>{error}</p>
      </div>
    </div>
  );

  const status = transaction?.status || session?.status || "job_posted";
  const stepIndex = getStepIndex(status);
  const isReadOnly = ["completed", "cancelled"].includes(status);
  // Painter name: first name only until escrow funded; full name after
  const painterName = transaction?.painters
    ? (["funded", "in_progress", "completion_requested", "completed"].includes(status)
        ? `${transaction.painters.first_name} ${transaction.painters.last_name}`
        : transaction.painters.first_name)
    : null;

  async function handlePayNow() {
    if (!transaction) return;
    setShowPayPrompt(true);
  }

  async function handlePayNowConfirmed() {
    if (!transaction) return;
    setShowPayPrompt(false);
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

  async function handleFindAnotherPainter() {
    if (!session) return;
    setFindingAnotherPainter(true);
    setActionMessage("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pass-on-job`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            session_id: session.id,
            customer_token: token,
            reason: "customer_requested_new_painter",
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setShowFindAnotherPainterConfirm(false);
        await loadSession();
      } else {
        setActionMessage(result.error || "Something went wrong.");
      }
    } catch {
      setActionMessage("Request failed. Please try again.");
    } finally {
      setFindingAnotherPainter(false);
    }
  }

  return (
    <div className="min-h-screen ambient-ivory">
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(180,150,100,0.18)" }} className="px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img
            src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png"
            alt="PaintBookCo"
            className="h-6 w-auto"
          />
          <div className="text-right">
            <p className="text-xs" style={{ color: "#9B8A75" }}>Job reference</p>
            <p className="font-mono text-xs font-semibold" style={{ color: "#2D5A3D" }}>PBC-{session?.id?.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">

        {/* Greeting banner */}
        <div style={{ background: "#2D5A3D" }} className="rounded-xl px-5 py-4 text-white">
          <p className="text-base font-semibold">Your space is in good hands 🎨</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
            Secure escrow · Payment only released when you approve
          </p>
        </div>

        {/* Payment protection banner */}
        <div style={{ background: "#fff", border: "1px solid rgba(45,90,61,0.2)" }} className="rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-lg">🛡️</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#2D5A3D" }}>Payment Protection Active</p>
            <p className="text-xs" style={{ color: "#9B8A75" }}>Funds held safely until you confirm the job is complete.</p>
          </div>
        </div>

        {isReadOnly && (
          <div style={{ background: "rgba(180,150,100,0.1)", border: "1px solid rgba(180,150,100,0.3)" }} className="rounded-xl p-3 text-sm text-center" style={{ color: "#9B8A75" }}>
            This job is <strong style={{ color: "#2D5A3D" }}>{status}</strong>. This page is now read-only and kept for your records.
          </div>
        )}

        {status === "disputed" && (
          <div style={{ background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.3)" }} className="rounded-xl p-4">
            <p className="font-semibold text-sm" style={{ color: "#D85A30" }}>⚖️ Dispute Under Review</p>
            <p className="text-sm mt-1" style={{ color: "#9B8A75" }}>
              Our team is reviewing this dispute and will contact both parties within 10 working days.
              Once resolved, this page will update with the outcome.
            </p>
          </div>
        )}

        {status === "disputed" && session && (
          <div style={{ background: "#fff", border: "1px solid rgba(216,90,48,0.25)" }} className="rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdminChat(prev => !prev)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "#D85A30" }}>💬 Messages from PaintBookCo Support</span>
                {adminUnread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {adminUnread > 9 ? "9+" : adminUnread}
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: "#9B8A75" }}>{showAdminChat ? "Hide" : "Show"}</span>
            </button>
            {showAdminChat && (
              <div style={{ borderTop: "1px solid rgba(216,90,48,0.2)" }} className="h-80">
                <PaintBookChat
                  sessionId={session.id}
                  userId={`customer-${session.id}`}
                  userRole="customer"
                  customerToken={token || ""}
                  jobStatus={status}
                  disputeChannelId={`dispute-customer-${session.id}`}
                  onUnreadChange={setAdminUnread}
                />
              </div>
            )}
          </div>
        )}

        {/* Status tracker */}
        <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-5" style={{ color: "#3A3228" }}>Job Progress</h2>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              const isLast = i === STATUS_STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      done ? "" : current ? "" : ""
                    }`} style={{
                      background: done ? "#2D5A3D" : current ? "#D85A30" : "rgba(180,150,100,0.2)",
                    }}>
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      ) : current ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full" style={{ background: "rgba(180,150,100,0.5)" }} />
                      )}
                    </div>
                    {!isLast && <div className="w-px h-6 mt-1" style={{ background: done ? "#2D5A3D" : "rgba(180,150,100,0.2)" }} />}
                  </div>
                  <div className="pb-5">
                    <span className="text-sm font-medium" style={{ color: done ? "#9B8A75" : current ? "#3A3228" : "#C4B5A5" }}>
                      {step.label}
                    </span>
                    {current && <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ background: "#D85A30" }}>Current</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job details */}
        <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: "#3A3228" }}>Job Details</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span style={{ color: "#9B8A75" }}>Type</span>
            <span style={{ color: "#3A3228" }}>{session?.job_type?.replace(/_/g, " ")}</span>
            <span style={{ color: "#9B8A75" }}>Location</span>
            <span style={{ color: "#3A3228" }}>{session?.city}, {session?.postcode?.split(" ")[0]}</span>
            {painterName && <>
              <span style={{ color: "#9B8A75" }}>Painter/decorator</span>
              <span style={{ color: "#3A3228" }}>{painterName}</span>
            </>}
            {transaction?.amount && <>
              <span style={{ color: "#9B8A75" }}>Amount</span>
              <span className="font-semibold" style={{ color: "#2D5A3D" }}>£{transaction.amount.toFixed(2)}</span>
            </>}
          </div>
        </div>

        {/* Invoice + Pay Now */}
        {transaction?.invoice_html && status === "invoice_sent" && !isReadOnly && status !== "disputed" && (
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#3A3228" }}>
              <Shield className="h-4 w-4" style={{ color: "#2D5A3D" }} /> Invoice
            </h2>
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(transaction.invoice_html) }}
            />

            {actionMessage && (
              <p className="text-sm text-center" style={{ color: "#D85A30" }}>{actionMessage}</p>
            )}

            <button
              onClick={handlePayNow}
              disabled={payLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white"
              style={{ background: "#2D5A3D" }}
            >
              {payLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay Now — Secure Escrow
            </button>
          </div>
        )}

        {/* Milestones */}
        {transaction?.milestones?.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: "#3A3228" }}>Milestones</h2>
            {transaction.milestones.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between text-sm pb-2 last:pb-0" style={{ borderBottom: "1px solid rgba(180,150,100,0.15)" }}>
                <span style={{ color: "#3A3228" }}>{m.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  background: m.status === "completed" ? "rgba(45,90,61,0.12)" :
                               m.status === "in_progress" ? "rgba(26,92,138,0.12)" : "rgba(180,150,100,0.15)",
                  color: m.status === "completed" ? "#2D5A3D" :
                         m.status === "in_progress" ? "#1A5C8A" : "#9B8A75",
                }}>{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chat — embedded for customer */}
        {(transaction?.chat_channel_id || session?.chat_channel_id) && !isReadOnly && status !== "disputed" && (
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: "#3A3228" }}>
              <MessageSquare className="h-4 w-4" style={{ color: "#D85A30" }} /> Chat with your painter/decorator
            </h2>
            <div className="h-96">
              <PaintBookChat
                sessionId={session?.id}
                userId={`customer-${session?.id}`}
                userRole="customer"
                customerToken={token}
              />
            </div>
          </div>
        )}

        {/* Admin Messages panel — shown when disputed */}
        {disputeChannelId && (
          <div style={{ background: "#fff", border: "1px solid rgba(216,90,48,0.25)" }} className="rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdminChat(!showAdminChat)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">💬 Messages from PaintBookCo Support</span>
                {adminUnread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {adminUnread > 9 ? "9+" : adminUnread}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{showAdminChat ? "Hide" : "Show"}</span>
            </button>
            {showAdminChat && (
              <div className="border-t border-amber-800/40 h-80">
                <PaintBookChat
                  sessionId={session!.id}
                  userId={`customer-${session!.id}`}
                  userRole="customer"
                  customerToken={token || ""}
                  jobStatus={session!.status}
                  disputeChannelId={disputeChannelId}
                  onUnreadChange={setAdminUnread}
                />
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isReadOnly && transaction && (
          <div className="space-y-3">
            {actionMessage && (
              <div style={{ background: "rgba(180,150,100,0.1)", border: "1px solid rgba(180,150,100,0.3)" }} className="rounded-xl p-3 text-sm text-center" style={{ color: "#9B8A75" }}>
                {actionMessage}
              </div>
            )}

            {["funded", "in_progress", "completion_requested"].includes(status) && status !== "disputed" && (
              <button
                onClick={() => handleAction("confirm-completion")}
                disabled={!!actionLoading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "#2D5A3D" }}
              >
                {actionLoading === "confirm-completion" ? "Processing..." : "Confirm Job Complete — Release Payment"}
              </button>
            )}

            {["funded", "in_progress", "completion_requested"].includes(status) && status !== "disputed" && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(216,90,48,0.4)", color: "#D85A30" }}
              >
                ⚠️ Raise a Dispute
              </button>
            )}

            {showDisputeModal && transaction && (
              <DisputeModal
                transactionId={transaction.id}
                sessionId={session?.id || ""}
                raisedBy="customer"
                customerToken={token || ""}
                onClose={() => setShowDisputeModal(false)}
                onSuccess={() => {
                  setShowDisputeModal(false);
                  setActionMessage("Dispute raised. Our team will contact you within 24 hours.");
                  loadSession();
                }}
                supabase={supabase}
              />
            )}

            {["job_posted", "painter_contacted", "invoice_sent"].includes(status) && status !== "disputed" && (
              <button
                onClick={() => handleAction("cancel-job")}
                disabled={!!actionLoading}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ border: "1px solid rgba(180,150,100,0.3)", color: "#9B8A75" }}
              >
                {actionLoading === "cancel-job" ? "Processing..." : "Cancel Job"}
              </button>
            )}
          </div>
        )}

        {/* Find Another Painter/decorator — available before payment, no transaction required */}
        {!isReadOnly && ["painter_contacted", "invoice_sent"].includes(status) && (
          <div className="space-y-2">
            {!showFindAnotherPainterConfirm ? (
              <button
                onClick={() => setShowFindAnotherPainterConfirm(true)}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(180,150,100,0.3)", color: "#9B8A75" }}
              >
                Find Another Painter/Decorator
              </button>
            ) : (
              <div style={{ background: "rgba(216,90,48,0.05)", border: "1px solid rgba(216,90,48,0.2)" }} className="rounded-xl p-4 space-y-3">
                <p className="text-sm" style={{ color: "#9B8A75" }}>
                  This will remove the current painter/decorator and put your job back in the queue.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleFindAnotherPainter}
                    disabled={findingAnotherPainter}
                    className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ background: "#D85A30" }}
                  >
                    {findingAnotherPainter ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowFindAnotherPainterConfirm(false)}
                    className="flex-1 py-2 rounded-xl text-sm transition-all"
                    style={{ border: "1px solid rgba(180,150,100,0.3)", color: "#9B8A75" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review section — only when completed */}
        {status === "completed" && (
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#3A3228" }}>
              <Star className="h-4 w-4" style={{ color: "#D85A30" }} /> Rate Your Painter/Decorator
            </h2>

            {review ? (
              <div className="space-y-3">
                {reviewSubmitted && (
                  <p className="text-sm font-semibold" style={{ color: "#2D5A3D" }}>Thank you for your review!</p>
                )}
                <StarRating value={review.rating} />
                <p className="text-sm" style={{ color: "#3A3228" }}>{review.review_text}</p>
                <p className="text-xs" style={{ color: "#9B8A75" }}>
                  Reviewed on {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-xs mb-2" style={{ color: "#9B8A75" }}>How would you rate your painter/decorator?</p>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience (min 20 characters)…"
                    maxLength={500}
                    rows={4}
                    className="w-full text-sm rounded-xl p-3 resize-none transition-colors focus:outline-none"
                    style={{
                      background: "#FBF7F0",
                      border: "1px solid rgba(180,150,100,0.3)",
                      color: "#3A3228",
                    }}
                  />
                  <p className="text-xs text-right mt-1" style={{ color: "#C4B5A5" }}>{reviewText.length}/500</p>
                </div>
                {reviewError && (
                  <p className="text-sm" style={{ color: "#D85A30" }}>{reviewError}</p>
                )}
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "#2D5A3D" }}
                >
                  {reviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Review
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* Customer pre-payment prompt */}
      {showPayPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPayPrompt(false)}>
          <div className="rounded-xl max-w-md w-full p-6 space-y-5" style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.2)' }} onClick={e => e.stopPropagation()}>
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: '#1A1A14', marginBottom: '8px', fontWeight: 400 }}>
                Before you pay
              </h2>
              <p style={{ fontSize: '13px', color: '#6B6860', lineHeight: '1.6' }}>
                Please read carefully — these are the legally binding conditions for your payment.
              </p>
            </div>

            {transaction?.invoice_description && (
              <div style={{ background: '#F0F9F4', border: '0.5px solid rgba(45,90,61,0.25)', borderRadius: '8px', padding: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#2D5A3D', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agreed work</p>
                <p style={{ fontSize: '13px', color: '#1A1A14', lineHeight: '1.65' }}>{transaction.invoice_description}</p>
              </div>
            )}

            <div style={{ background: '#FBF7F0', border: '0.5px solid rgba(180,150,100,0.2)', borderRadius: '8px', padding: '14px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A14', marginBottom: '8px' }}>What this means for you:</p>
              <ul style={{ fontSize: '12px', color: '#6B6860', lineHeight: '1.7', paddingLeft: '16px', listStyleType: 'disc' }}>
                <li>Your money is held securely by <strong style={{ color: '#1A1A14' }}>Transpact</strong> (FCA Ref: 546279) — not by PaintBookCo</li>
                <li>You release payment to the painter by logging into <strong style={{ color: '#1A1A14' }}>Transpact directly</strong> once you are happy with the work</li>
                <li>The job description above and your property address are the <strong style={{ color: '#1A1A14' }}>legally binding conditions</strong> — if anything is wrong, ask your painter to update the invoice before you pay</li>
                <li>If anything goes wrong, raise a dispute on PaintBookCo first — our team will try to resolve it at no cost</li>
                <li>If unresolved, formal Transpact arbitration costs £20 per party — refunded to the winning party</li>
              </ul>
            </div>

            <div style={{ background: '#FFF4EF', border: '0.5px solid rgba(216,90,48,0.2)', borderRadius: '6px', padding: '12px' }}>
              <p style={{ fontSize: '12px', color: '#D85A30', lineHeight: '1.6' }}>
                If the job description above does not match what was agreed, do not pay — ask your painter to update the invoice first.
              </p>
            </div>

            <p style={{ fontSize: '11px', color: '#B4B2A9', lineHeight: '1.6' }}>
              By proceeding you agree to <a href="/terms" target="_blank" style={{ color: '#D85A30' }}>PaintBookCo's Terms of Service</a> and the Transpact escrow process.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowPayPrompt(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '4px', border: '0.5px solid rgba(180,150,100,0.3)', background: 'transparent', color: '#6B6860', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePayNowConfirmed}
                style={{ flex: 1, padding: '11px', borderRadius: '4px', border: 'none', background: '#D85A30', color: '#F5F0E8', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                I understand — Pay securely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
