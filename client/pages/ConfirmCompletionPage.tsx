import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, Star } from "lucide-react";

export default function ConfirmCompletionPage() {
  const { transaction_id } = useParams<{ transaction_id: string }>();
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [disputed, setDisputed] = useState(false);
  const [error, setError] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const customerToken = searchParams.get("token") ||
    localStorage.getItem("pbc_customer_token") || "";

  useEffect(() => {
    if (!transaction_id) return;
    loadTransaction();
  }, [transaction_id]);

  const loadTransaction = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/transactions?id=eq.${transaction_id}&select=id,invoice_id,amount,job_summary,status,painter_id`,
        {
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        }
      );
      const data = await res.json();
      if (data && data[0]) {
        setTransaction(data[0]);
      } else {
        setError("Transaction not found.");
      }
    } catch {
      setError("Failed to load transaction.");
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            transaction_id,
            customer_token: customerToken,
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        setConfirmed(true);
        localStorage.removeItem("pbc_customer_token");
        localStorage.removeItem("pbc_transaction_id");
      } else {
        setError(data.error || "Failed to confirm completion.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
    setConfirming(false);
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      setError("Please describe the reason for the dispute.");
      return;
    }
    setConfirming(true);
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/transactions?id=eq.${transaction_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            status: "disputed",
            disputed_at: new Date().toISOString(),
          })
        }
      );
      setDisputed(true);
    } catch {
      setError("Failed to raise dispute.");
    }
    setConfirming(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (confirmed) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Job Confirmed Complete!
          </h1>
          <p className="text-gray-400 text-sm">
            Payment has been released to your painter.
            Thank you for using PaintBookCo!
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 justify-center mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="h-6 w-6 text-gray-600 cursor-pointer hover:text-orange-400 transition-colors" />
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            How was your experience? Leave a review for your painter.
          </p>
        </div>
        <a href="/" className="text-gray-500 hover:text-white text-sm underline">
          Return to homepage
        </a>
      </div>
    </div>
  );

  if (disputed) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Dispute Raised</h1>
          <p className="text-gray-400 text-sm">
            Our team has been notified and will be in touch within
            1-2 working days to resolve this dispute.
            Your funds remain safely held in escrow.
          </p>
        </div>
        <p className="text-gray-500 text-xs">
          Reference: {transaction_id}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto px-6 py-12">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Is Your Job Complete?</h1>
          <p className="text-gray-400 text-sm">
            Review the job details below before confirming
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Job summary */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Invoice</span>
            <span className="text-white">{transaction?.invoice_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-bold">£{transaction?.amount}</span>
          </div>
          {transaction?.job_summary && (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Job Summary</p>
              <p className="text-white text-sm">{transaction.job_summary}</p>
            </div>
          )}
        </div>

        <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 mb-6">
          <p className="text-amber-300 text-sm">
            ⚠️ By confirming, you authorise the release of
            <span className="font-bold"> £{transaction?.amount} </span>
            to your painter. This cannot be undone.
          </p>
        </div>

        {!showDisputeForm ? (
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {confirming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              Yes — Job is Complete
            </button>
            <button
              onClick={() => setShowDisputeForm(true)}
              className="w-full border border-red-800 text-red-400 py-4 rounded-xl hover:border-red-600 flex items-center justify-center gap-2"
            >
              <AlertCircle className="h-5 w-5" />
              Raise a Dispute
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                Reason for Dispute *
              </label>
              <textarea
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="Please describe the issue with the completed work..."
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisputeForm(false)}
                className="flex-1 border border-gray-700 text-gray-300 py-3 rounded-xl hover:border-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                disabled={confirming}
                className="flex-1 bg-red-700 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {confirming ? "Submitting..." : "Submit Dispute"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
