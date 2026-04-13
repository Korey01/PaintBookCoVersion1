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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-[#1B3A5C]">
            PaintBookCo
          </Link>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 p-8 space-y-5"
          style={{ borderRadius: "8px" }}
        >
          {error && (
            <div
              className="text-sm text-red-600 bg-red-50 px-4 py-3"
              style={{ borderRadius: "8px" }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
              style={{ borderRadius: "8px" }}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Password</label>
              <Link
                to="/reset-password"
                className="text-xs text-[#2E75B6] hover:underline"
              >
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
                className="w-full border border-gray-200 text-sm px-3 py-2.5 pr-10 focus:outline-none focus:border-[#2E75B6] transition-colors"
                style={{ borderRadius: "8px" }}
                placeholder="Your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="w-full text-white font-semibold py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Log In
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            No account?{" "}
            <Link to="/register/customer" className="text-[#2E75B6] font-medium hover:underline">
              Register as a customer
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Are you a painter?{" "}
            <Link to="/join-painter" className="text-[#2E75B6] font-medium hover:underline">
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
