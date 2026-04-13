import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SPECIALISMS = [
  "Interior Painting",
  "Exterior Painting",
  "Wallpapering",
  "Feature Wall",
  "TV/Media Wall",
  "Commercial Painting",
  "Full Interior Refurb",
  "Full Exterior Refurb",
  "New Build Decoration",
  "Landlord Refresh",
  "Specialist/Other",
];

export default function JoinPainter() {
  useEffect(() => {
    document.title = "Join as a Painter | PaintBookCo";
  }, []);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);
  const [postcode, setPostcode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  function toggleSpecialism(s: string) {
    setSelectedSpecialisms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

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
    if (selectedSpecialisms.length === 0) {
      setError("Please select at least one specialism.");
      return;
    }

    setLoading(true);

    // 1. Create Supabase auth account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          role: "painter",
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (!authData.user) {
      setLoading(false);
      setError("Registration failed. Please try again.");
      return;
    }

    // 2. Insert painter record
    const { error: painterError } = await supabase.from("painters").insert({
      user_id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      specialisms: selectedSpecialisms,
      service_area_postcode: postcode,
      kyc_status: "pending",
    });

    setLoading(false);

    if (painterError) {
      // Auth account created but painter record failed — still redirect
      console.error("Painter insert error:", painterError.message);
    }

    navigate("/dashboard/painter");
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, system-ui, sans-serif" }}
    >
      {/* Header spacer */}
      <div className="h-16" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold text-[#1B3A5C]">
            PaintBookCo
          </Link>
          <h1 className="text-3xl font-bold text-[#1B3A5C] mt-4 mb-2">
            Apply to join
          </h1>
          <p className="text-gray-500">
            No subscription fees. Commission only on completed jobs.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 p-8 space-y-6"
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

          {/* Name row */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                First name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
                style={{ borderRadius: "8px" }}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Last name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
                style={{ borderRadius: "8px" }}
                placeholder="Smith"
              />
            </div>
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

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
              style={{ borderRadius: "8px" }}
              placeholder="+44 7700 000000"
            />
          </div>

          {/* Password row */}
          <div className="grid sm:grid-cols-2 gap-5">
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
            </div>
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
                placeholder="Repeat password"
              />
            </div>
          </div>

          {/* Specialisms */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-3">
              Specialisms <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPECIALISMS.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-2 px-3 py-2 text-xs border cursor-pointer transition-colors ${
                    selectedSpecialisms.includes(s)
                      ? "border-[#2E75B6] text-[#2E75B6] bg-[#EBF3FC]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={{ borderRadius: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialisms.includes(s)}
                    onChange={() => toggleSpecialism(s)}
                    className="accent-[#2E75B6] flex-shrink-0"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Service area postcode */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Service area postcode <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
              className="w-full border border-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:border-[#2E75B6] transition-colors"
              style={{ borderRadius: "8px", maxWidth: "240px" }}
              placeholder="e.g. M1 1AE"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used to match you with jobs in your area
            </p>
          </div>

          {/* Agreements */}
          <div className="space-y-3 pt-1 border-t border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 accent-[#2E75B6]"
              />
              <span className="text-xs text-gray-600">
                I agree to the{" "}
                <Link to="/terms" target="_blank" className="text-[#2E75B6] hover:underline">
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
                <Link to="/privacy" target="_blank" className="text-[#2E75B6] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Note */}
          <div
            className="flex gap-3 p-4 text-xs text-gray-600 border border-blue-100"
            style={{ backgroundColor: "#EBF3FC", borderRadius: "8px" }}
          >
            <CheckCircle2 className="h-4 w-4 text-[#2E75B6] flex-shrink-0 mt-0.5" />
            <p>
              After registration you will need to complete KYC verification
              (identity, address, and insurance check) before receiving jobs.
              This typically takes 1–3 working days.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply to Join
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

// Kept for backward compatibility with existing /join-painter/completed route
export function JoinPainterComplete() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Application Received | PaintBookCo";
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 text-center"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <div className="max-w-md">
        <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#1B3A5C] mb-3">
          Application received
        </h1>
        <p className="text-gray-600 mb-8">
          Your application is under review. We will email you within 1–3 working
          days once your KYC verification is complete.
        </p>
        <button
          onClick={() => navigate("/dashboard/painter")}
          className="inline-block text-white font-semibold px-8 py-3 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(JoinPainter, {
      name: "JoinPainter",
      inputs: [],
    });
  })
  .catch(() => {});
