import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

export default function ResetPassword() {
  useEffect(() => { document.title = "Reset Password | PaintBookCo"; }, []);

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
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm animate-editorial-up" style={{ animationFillMode: "both" }}>
        <div className="text-center mb-12">
          <Link to="/" className="font-display text-2xl text-foreground">PaintBookCo</Link>
          <p className="text-sm text-muted-foreground mt-2">Reset your password</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-xl text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-[1.8]">
              We have sent a password reset link to <strong className="text-foreground">{email}</strong>.
              Check your inbox and follow the link to set a new password.
            </p>
            <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline mt-4">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <p className="text-sm text-muted-foreground leading-[1.8]">
              Enter your email address and we will send you a link to reset your password.
            </p>

            {error && (
              <div className="text-sm text-destructive border-l-2 border-destructive pl-4 py-2">{error}</div>
            )}

            <div>
              <label className="editorial-label text-muted-foreground mb-2 block">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} placeholder="you@example.com" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background font-medium py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-foreground hover:text-primary transition-colors">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(ResetPassword, { name: "ResetPassword", inputs: [] }); })
  .catch(() => {});
