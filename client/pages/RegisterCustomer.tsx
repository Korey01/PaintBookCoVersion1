import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  if (!password) return null;

  return (
    <div className="mt-3">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 transition-colors duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "hsl(var(--border))" }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs mt-1" style={{ color: colors[score] }}>{labels[score]}</p>
      )}
    </div>
  );
}

export default function RegisterCustomer() {
  useEffect(() => { document.title = "Create Account | PaintBookCo"; }, []);

  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agreeTerms || !agreePrivacy) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "customer" } },
    });
    setLoading(false);

    if (signUpError) { setError(signUpError.message); return; }
    navigate("/dashboard/customer");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm animate-editorial-up" style={{ animationFillMode: "both" }}>
        <div className="text-center mb-12">
          <Link to="/" className="font-display text-2xl text-foreground">PaintBookCo</Link>
          <p className="text-sm text-muted-foreground mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="text-sm text-destructive border-l-2 border-destructive pl-4 py-2">{error}</div>
          )}

          <div>
            <label className="editorial-label text-muted-foreground mb-2 block">Full name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={fieldClass} placeholder="Jane Smith" />
          </div>

          <div>
            <label className="editorial-label text-muted-foreground mb-2 block">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={fieldClass} placeholder="you@example.com" />
          </div>

          <div>
            <label className="editorial-label text-muted-foreground mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={fieldClass}
                placeholder="Min. 8 characters"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-0 bottom-3 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Hide" : "Show"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="editorial-label text-muted-foreground mb-2 block">Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className={fieldClass} placeholder="Repeat your password" />
          </div>

          <div className="space-y-4 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted-foreground leading-[1.7]">
                I agree to the{" "}
                <Link to="/terms" className="text-foreground hover:text-primary transition-colors" target="_blank">Terms of Service</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted-foreground leading-[1.7]">
                I agree to the{" "}
                <Link to="/privacy" className="text-foreground hover:text-primary transition-colors" target="_blank">Privacy Policy</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-medium py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:text-primary transition-colors">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(RegisterCustomer, { name: "RegisterCustomer", inputs: [] }); })
  .catch(() => {});
