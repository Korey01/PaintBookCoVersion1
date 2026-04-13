import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  useEffect(() => {
    document.title = "Reset Password | PaintBookCo";
  }, []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirm`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-[#1B3A5C]">
            PaintBookCo
          </Link>
          <p className="text-gray-500 text-sm mt-2">Reset your password</p>
        </div>

        <div
          className="bg-white border border-gray-100 p-8"
          style={{ borderRadius: "8px" }}
        >
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-[#1B3A5C] mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We have sent a password reset link to <strong>{email}</strong>. Check
                your inbox and follow the link to set a new password.
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 text-sm text-[#2E75B6] font-medium hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600">
                Enter your email address and we will send you a link to reset
                your password.
              </p>

              {error && (
                <div
                  className="text-sm text-red-600 bg-red-50 px-4 py-3"
                  style={{ borderRadius: "8px" }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
                  style={{ borderRadius: "8px" }}
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-[#2E75B6] hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(ResetPassword, {
      name: "ResetPassword",
      inputs: [],
    });
  })
  .catch(() => {});
