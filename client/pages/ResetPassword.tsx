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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl text-foreground">
            PaintBookCo
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-card border border-border p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-lg text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground leading-[1.7]">
                We have sent a password reset link to <strong>{email}</strong>. Check
                your inbox and follow the link to set a new password.
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 text-sm text-primary font-medium hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-muted-foreground leading-[1.7]">
                Enter your email address and we will send you a link to reset
                your password.
              </p>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-input text-sm px-3 py-2.5 bg-background text-foreground focus:outline-none focus:border-ring transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-primary-foreground bg-primary font-semibold py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">
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
