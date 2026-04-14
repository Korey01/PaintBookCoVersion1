import { useState } from "react";
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { createPaymentIntent, fundEscrowAccount } from "@/lib/payments";

interface PaymentFormProps {
  jobId: string;
  jobTitle: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentForm({
  jobId,
  jobTitle,
  amount,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [step, setStep] = useState<"amount" | "card" | "processing" | "success">(
    "amount"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stripe fields state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");

  async function handleCreatePayment() {
    setLoading(true);
    setError("");

    const { clientSecret, error: intentError } = await createPaymentIntent(
      Math.round(amount * 100), // Convert to cents
      jobId
    );

    if (intentError) {
      setError(intentError);
      setLoading(false);
      return;
    }

    if (clientSecret) {
      setStep("card");
    }

    setLoading(false);
  }

  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate card details
    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError("Please fill in all card details");
      setLoading(false);
      return;
    }

    try {
      // In production, submit to server with Stripe token
      // For now, simulate payment processing
      setStep("processing");

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Fund escrow account
      const { success, error: escrowError } = await fundEscrowAccount(
        jobId,
        jobId
      );

      if (!success || escrowError) {
        setError(escrowError || "Failed to fund escrow");
        setStep("card");
        setLoading(false);
        return;
      }

      setStep("success");
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment processing failed"
      );
      setStep("card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Secure Payment</h2>
        <p className="text-sm text-dashboard-customer-text-secondary">
          {jobTitle}
        </p>
      </div>

      {/* Amount step */}
      {step === "amount" && (
        <div className="dashboard-customer-card border-white/10 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-dashboard-customer-text-secondary">
              Amount to pay
            </p>
            <p className="text-3xl font-bold text-dashboard-customer-accent">
              £{amount.toFixed(2)}
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="text-xs text-blue-100">
                <p className="font-semibold mb-1">Payment Protected</p>
                <p>
                  Your payment is held in secure escrow until the job is
                  completed.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreatePayment}
            disabled={loading}
            className="w-full dashboard-customer-accent text-black py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : "Continue to Payment"}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full border border-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/5"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Card entry step */}
      {step === "card" && (
        <form onSubmit={handleConfirmPayment} className="space-y-4">
          <div className="dashboard-customer-card border-white/10 rounded-lg p-6 space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-100">{error}</p>
              </div>
            )}

            {/* Card holder name */}
            <div>
              <label className="block text-sm text-dashboard-customer-text-secondary mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Smith"
                className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-dashboard-customer-accent"
              />
            </div>

            {/* Card number */}
            <div>
              <label className="block text-sm text-dashboard-customer-text-secondary mb-2">
                Card Number
              </label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded px-3 py-2">
                <CreditCard className="h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                  }
                  placeholder="4242 4242 4242 4242"
                  className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-dashboard-customer-text-secondary mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setExpiry(val.length >= 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
                  }}
                  placeholder="MM/YY"
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-dashboard-customer-accent"
                />
              </div>
              <div>
                <label className="block text-sm text-dashboard-customer-text-secondary mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="123"
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-dashboard-customer-accent"
                />
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-dashboard-customer-text-secondary">
              This is a test payment form. In production, Stripe.js would handle
              secure card processing.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("amount")}
              disabled={loading}
              className="flex-1 border border-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/5 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 dashboard-customer-accent text-black py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      )}

      {/* Processing step */}
      {step === "processing" && (
        <div className="dashboard-customer-card border-white/10 rounded-lg p-8 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-dashboard-customer-accent mx-auto" />
          <div>
            <p className="text-lg font-semibold text-white">Processing Payment</p>
            <p className="text-sm text-dashboard-customer-text-secondary">
              Please wait while we process your payment...
            </p>
          </div>
        </div>
      )}

      {/* Success step */}
      {step === "success" && (
        <div className="dashboard-customer-card border-white/10 rounded-lg p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Payment Successful</p>
            <p className="text-sm text-dashboard-customer-text-secondary mt-2">
              Your payment of £{amount.toFixed(2)} has been processed and placed
              in secure escrow.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
