import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  useEffect(() => {
    document.title = "Log In | PaintBookCo";
  }, []);

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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

    // Check whether this user is a painter
    const { data: painterRecord } = await supabase
      .from("painters")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    setLoading(false);
    navigate(painterRecord ? "/dashboard/painter" : "/dashboard/customer");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl text-foreground">
            PaintBookCo
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border p-8 space-y-5"
        >
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
              autoComplete="email"
              className="w-full border border-input text-sm px-3 py-2.5 bg-background text-foreground focus:outline-none focus:border-ring transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <Link to="/reset-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-input text-sm px-3 py-2.5 pr-10 bg-background text-foreground focus:outline-none focus:border-ring transition-colors"
                placeholder="Your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-primary-foreground bg-primary font-semibold py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Log In
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register/customer" className="text-primary font-medium hover:underline">
              Register as a customer
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Are you a painter?{" "}
            <Link to="/join-painter" className="text-primary font-medium hover:underline">
              Join as a painter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(LoginPage, {
      name: "LoginPage",
      inputs: [],
    });
  })
  .catch(() => {});
