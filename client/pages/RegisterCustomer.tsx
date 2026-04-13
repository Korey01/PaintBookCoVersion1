import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "#e5e7eb" }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs" style={{ color: colors[score] }}>
          {labels[score]}
        </p>
      )}
    </div>
  );
}

export default function RegisterCustomer() {
  useEffect(() => {
    document.title = "Create Account | PaintBookCo";
  }, []);

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "customer" },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    navigate("/dashboard/customer");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-[#1B3A5C]">
            PaintBookCo
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your customer account</p>
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

          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Full name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
              style={{ borderRadius: "8px" }}
              placeholder="Jane Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Email address <span className="text-red-400">*</span>
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

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 text-sm px-3 py-2.5 pr-10 focus:outline-none focus:border-[#2E75B6] transition-colors"
                style={{ borderRadius: "8px" }}
                placeholder="Min. 8 characters"
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
            <PasswordStrength password={password} />
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Confirm password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
              style={{ borderRadius: "8px" }}
              placeholder="Repeat your password"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 accent-[#2E75B6]"
              />
              <span className="text-xs text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="text-[#2E75B6] hover:underline" target="_blank">
                  Terms of Service
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 accent-[#2E75B6]"
              />
              <span className="text-xs text-gray-600">
                I agree to the{" "}
                <Link to="/privacy" className="text-[#2E75B6] hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#2E75B6] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(RegisterCustomer, {
      name: "RegisterCustomer",
      inputs: [],
    });
  })
  .catch(() => {});
