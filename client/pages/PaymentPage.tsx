import DOMPurify from "dompurify";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Shield, CheckCircle2, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  const { transaction_id } = useParams<{ transaction_id: string }>();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    customer_first_name: "",
    customer_last_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    customer_postcode: "",
    terms_accepted: false,
    address_confirmed: false,
    escrow_understood: false,
  });

  useEffect(() => {
    if (!transaction_id) return;
    loadTransaction();
  }, [transaction_id]);

  const loadTransaction = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/transactions?id=eq.${transaction_id}&select=id,invoice_id,amount,job_summary,status,invoice_html,painter_id`,
        {
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          }
        }
      );
      const data = await res.json();
      if (data && data[0]) {
        setTransaction(data[0]);
        const session_email = localStorage.getItem("pbc_session_email");
        if (session_email) setForm(f => ({ ...f, customer_email: session_email }));
      } else {
        setError("Invoice not found. Please check your link.");
      }
    } catch (err) {
      setError("Failed to load invoice. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.terms_accepted || !form.address_confirmed || !form.escrow_understood) {
      setError("Please accept all terms before proceeding.");
      return;
    }
    if (!form.customer_first_name || !form.customer_last_name ||
        !form.customer_email || !form.customer_phone ||
        !form.customer_address || !form.customer_postcode) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            transaction_id,
            customer_first_name: form.customer_first_name.trim(),
            customer_last_name: form.customer_last_name.trim(),
            customer_email: form.customer_email.trim().toLowerCase(),
            customer_phone: form.customer_phone.trim(),
            customer_address: form.customer_address.trim(),
            customer_postcode: form.customer_postcode.trim().toUpperCase(),
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("pbc_customer_token", data.customer_token);
        localStorage.setItem("pbc_transaction_id", transaction_id!);
        setSuccess(true);
      } else {
        setError(data.error || "Payment processing failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }

    setSubmitting(false);
  };

  const fieldClass = "w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none text-sm";

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (error && !transaction) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">Invoice Not Found</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h1>
          <p className="text-gray-400 text-sm">
            Your payment is safely held in Transpact escrow.
            Your painter has been notified and will be in touch shortly.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 text-left space-y-3">
          <h3 className="text-white font-medium text-sm">What happens next?</h3>
          {[
            "Your painter receives your contact details and job address",
            "Your painter contacts you to arrange site visit",
            "Painter completes the work",
            "You confirm completion — funds released to painter",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-gray-300 text-sm">{s}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs">
          Transaction ID: {transaction_id}
        </p>
      </div>
    </div>
  );

  if (transaction?.status === "completed") return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">Already Paid</h1>
        <p className="text-gray-400">This invoice has already been paid.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-1">Complete Your Payment</h1>
          <p className="text-gray-400 text-sm">
            Invoice {transaction?.invoice_id} · £{transaction?.amount}
          </p>
        </div>

        {/* Invoice preview */}
        {transaction?.invoice_html && (
          <div className="mb-8 border border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
              <p className="text-gray-400 text-xs">Invoice Preview</p>
            </div>
            <div
              className="p-4 max-h-64 overflow-y-auto text-xs"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(transaction.invoice_html ?? "") }}
            />
          </div>
        )}

        {/* Amount summary */}
        <div className="bg-orange-900/20 border border-orange-800 rounded-xl p-5 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-3xl font-bold text-white">£{transaction?.amount}</p>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Escrow Protected</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Funds held securely by Transpact until you confirm completion
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Customer details form */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold">Your Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={form.customer_first_name}
                onChange={e => setForm(f => ({ ...f, customer_first_name: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={form.customer_last_name}
                onChange={e => setForm(f => ({ ...f, customer_last_name: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={form.customer_email}
              onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.customer_phone}
              onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
              placeholder="e.g. 07700 900000"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Job Site Address * 
            </label>
            <p className="text-amber-400 text-xs mb-2">
              ⚠️ This is the address where painting will take place — 
              not necessarily your home address. It will be shared with 
              your painter after payment is confirmed.
            </p>
            <input
              type="text"
              value={form.customer_address}
              onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))}
              placeholder="House number and street name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Job Site Postcode *
            </label>
            <input
              type="text"
              value={form.customer_postcode}
              onChange={e => setForm(f => ({ ...f, customer_postcode: e.target.value.toUpperCase() }))}
              placeholder="e.g. M1 1AB"
              className={fieldClass}
            />
          </div>

          {/* Terms */}
          <div className="space-y-3 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-medium text-sm">Terms & Confirmation</h3>
            {[
              {
                key: "terms_accepted",
                label: <>I agree to the <a href="/terms" target="_blank" className="text-orange-400 underline">Terms of Service</a></>
              },
              {
                key: "address_confirmed",
                label: "I confirm the job site address above is correct and will be shared with my painter after payment"
              },
              {
                key: "escrow_understood",
                label: "I understand my payment is held in Transpact escrow and only released when I confirm the job is complete"
              },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form as any)[item.key]}
                  onChange={e => setForm(f => ({ ...f, [item.key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-300 text-sm">{item.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
            ) : (
              <><Shield className="h-5 w-5" /> Pay £{transaction?.amount} Securely</>
            )}
          </button>

          <div className="text-center space-y-1">
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Powered by Transpact Escrow
            </p>
            <p className="text-gray-600 text-xs">
              Your payment is protected until you confirm the job is complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
