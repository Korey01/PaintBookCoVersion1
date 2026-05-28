import { useEffect, useState } from "react";
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
  const isReadOnly = ["completed", "cancelled"].includes(status);
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

        {status === "disputed" && (
          <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-4">
            <p className="text-amber-400 font-medium">⚖️ Dispute Under Review</p>
            <p className="text-sm text-muted-foreground mt-1">
              Our team is reviewing this dispute and will contact both parties within 10 working days.
              Once resolved, this page will update with the outcome.
            </p>
          </div>
        )}

        {/* Status tracker */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-medium mb-4">Job Progress</h2>
          <div className="space-y-3">
            {STATUS_STEPS.map((step, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
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
        {transaction?.invoice_html && status === "invoice_sent" && !isReadOnly && status !== "disputed" && (
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

        {/* Chat — embedded for customer */}
        {(transaction?.chat_channel_id || session?.chat_channel_id) && !isReadOnly && status !== "disputed" && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" /> Chat with your painter
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

        {/* Action buttons */}
        {!isReadOnly && transaction && (
          <div className="space-y-3">
            {actionMessage && (
              <div className="bg-accent/20 border border-border rounded-md p-3 text-sm text-center">
                {actionMessage}
              </div>
            )}

            {["funded", "in_progress", "completion_requested"].includes(status) && status !== "disputed" && (
              <button
                onClick={() => handleAction("confirm-completion")}
                disabled={!!actionLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === "confirm-completion" ? "Processing..." : "Confirm Job Complete — Release Payment"}
              </button>
            )}

            {["funded", "in_progress", "completion_requested"].includes(status) && status !== "disputed" && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="w-full border border-destructive/50 text-destructive py-3 rounded-xl text-sm hover:bg-destructive/10 transition-colors"
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
                className="w-full border border-border text-muted-foreground py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {actionLoading === "cancel-job" ? "Processing..." : "Cancel Job"}
              </button>
            )}
          </div>
        )}

        {/* Find Another Painter — available before payment, no transaction required */}
        {!isReadOnly && ["painter_contacted", "invoice_sent"].includes(status) && (
          <div className="space-y-2">
            {!showFindAnotherPainterConfirm ? (
              <button
                onClick={() => setShowFindAnotherPainterConfirm(true)}
                className="w-full border border-border text-muted-foreground py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                Find Another Painter
              </button>
            ) : (
              <div className="border border-amber-500/30 bg-amber-900/10 rounded-md p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  This will remove the current painter and put your job back in the queue.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleFindAnotherPainter}
                    disabled={findingAnotherPainter}
                    className="flex-1 bg-amber-600 text-white py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    {findingAnotherPainter ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowFindAnotherPainterConfirm(false)}
                    className="flex-1 border border-border py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
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
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" /> Rate Your Painter
            </h2>

            {review ? (
              <div className="space-y-3">
                {reviewSubmitted && (
                  <p className="text-sm text-green-600 font-medium">Thank you for your review!</p>
                )}
                <StarRating value={review.rating} />
                <p className="text-sm text-foreground">{review.review_text}</p>
                <p className="text-xs text-muted-foreground">
                  Reviewed on {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">How would you rate your painter?</p>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience (min 20 characters)…"
                    maxLength={500}
                    rows={4}
                    className="w-full border border-border bg-transparent text-sm text-foreground rounded-md p-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground resize-none transition-colors"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{reviewText.length}/500</p>
                </div>
                {reviewError && (
                  <p className="text-sm text-destructive">{reviewError}</p>
                )}
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Review
                </button>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
