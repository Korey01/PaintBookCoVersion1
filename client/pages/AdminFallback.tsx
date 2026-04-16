import { useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function AdminFallback() {
  const [email, setEmail] = useState("");
  const [action, setAction] = useState("approve_kyc");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action, painter_email: email, reason }),
        }
      );
      const data = await res.json();
      setResult(data.success
        ? `✓ Success: ${action} applied to ${email}`
        : `✗ Error: ${data.error}`
      );
    } catch (err) {
      setResult("✗ Network error. Check your connection.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-xl font-bold">Admin Fallback Panel</h1>
        <p className="text-gray-400 text-sm">
          Use this when the main admin dashboard is unavailable.
        </p>
        <div>
          <label className="text-gray-400 text-xs block mb-1">
            Painter Email
          </label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="painter@example.com"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs block mb-1">Action</label>
          <select
            value={action}
            onChange={e => setAction(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          >
            <option value="approve_kyc">Approve KYC</option>
            <option value="reject_kyc">Reject KYC</option>
            <option value="verify_insurance">Verify Insurance</option>
            <option value="activate_painter">Activate Painter</option>
            <option value="deactivate_painter">Deactivate Painter</option>
          </select>
        </div>
        {action === "reject_kyc" && (
          <div>
            <label className="text-gray-400 text-xs block mb-1">
              Rejection Reason
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm h-20"
            />
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !email}
          className="w-full bg-orange-600 text-white py-3 rounded text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Execute Action"}
        </button>
        {result && (
          <div className={`p-3 rounded text-sm ${
            result.startsWith("✓")
              ? "bg-green-900/50 text-green-300 border border-green-800"
              : "bg-red-900/50 text-red-300 border border-red-800"
          }`}>
            {result}
          </div>
        )}
        <p className="text-gray-600 text-xs text-center">
          Bookmark: paintbook-app.netlify.app/admin-fallback
        </p>
      </div>
    </div>
  );
}
