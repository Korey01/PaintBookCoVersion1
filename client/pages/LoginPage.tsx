import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200";

export default function LoginPage() {
  useEffect(() => { document.title = "Log In | PaintBookCo"; }, []);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailUnconfirmed(false);
    setLoading(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setEmailUnconfirmed(true);
        setError("Please confirm your email first. Check your inbox for a confirmation link.");
      } else {
        setError("Incorrect email or password. Please try again.");
      }
      return;
    }

    const user = signInData?.user;

    if (!user) {
      setLoading(false);
      setError("Could not retrieve user. Please try again.");
      return;
    }

    // Admin check first
    if (user.email === "o.a.alashe@paintbookco.co.uk") {
      setLoading(false);
      navigate("/admin-dashboard");
      return;
    }

    // Role-based redirect: check painters table
    try {
      // Small wait for session to propagate
      await new Promise(r => setTimeout(r, 300));

      const { data: painterRecord, error: painterError } = await supabase
        .from("painters")
        .select("id, kyc_status, is_active, insurance_submitted_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (painterError) {
        console.error("Painter query error:", painterError);
      }

      setLoading(false);

      if (painterRecord) {
        if (painterRecord.kyc_status !== "approved") {
          navigate("/kyc/painter");
        } else if (!painterRecord.insurance_submitted_at) {
          navigate("/dashboard/painter");
        } else {
          navigate("/dashboard/painter");
        }
      } else {
        navigate("/login");
        setError("No painter account found. Please register at /join-painter");
      }
    } catch (err: any) {
      setLoading(false);
      setError(`Login failed: ${err?.message || "Please try again."}`);
      console.error("Login error:", err);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setResendSent(true);
    setResendLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <Link to="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Sign in to your PaintBookCo account</p>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
              {emailUnconfirmed && (
                <button
                  onClick={handleResend}
                  disabled={resendLoading || resendSent}
                  className="ml-2 underline disabled:opacity-50"
                >
                  {resendSent ? "Sent!" : resendLoading ? "Sending…" : "Resend email"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass + " pr-10"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New customer?{" "}
            <Link to="/register/customer" className="text-foreground font-medium hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Are you a painter or decorator?{" "}
            <Link to="/join-painter" className="text-foreground font-medium hover:underline underline-offset-4">
              Join as a painter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
