import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

export default function LoginPage() {
  useEffect(() => { document.title = "Log In | PaintBookCo"; }, []);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError("Incorrect email or password. Please try again.");
      return;
    }
    if (!data.user) {
      setLoading(false);
      setError("Login failed. Please try again.");
      return;
    }

    const { data: painterRecord } = await supabase
      .from("painters").select("id").eq("user_id", data.user.id).maybeSingle();

    setLoading(false);
    navigate(painterRecord ? "/dashboard/painter" : "/dashboard/customer");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm animate-editorial-up" style={{ animationFillMode: "both" }}>
        {/* Wordmark */}
        <div className="text-center mb-12">
          <Link to="/" aria-label="PaintBookCo home" className="inline-block">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800" alt="PaintBookCo" className="h-8 w-auto" />
          </Link>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="text-sm text-destructive border-l-2 border-destructive pl-4 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="editorial-label text-muted-foreground mb-2 block">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={fieldClass} placeholder="you@example.com" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="editorial-label text-muted-foreground">Password</label>
              <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">Forgot?</Link>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={fieldClass} placeholder="Your password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-0 bottom-3 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Hide" : "Show"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-medium py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Log In
          </button>
        </form>

        <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground">
          <p>No account? <Link to="/register/customer" className="text-foreground font-medium hover:text-primary transition-colors">Register</Link></p>
          <p>Are you a painter? <Link to="/join-painter" className="text-foreground font-medium hover:text-primary transition-colors">Join here</Link></p>
        </div>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(LoginPage, { name: "LoginPage", inputs: [] }); })
  .catch(() => {});
