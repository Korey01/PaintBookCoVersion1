import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

export const SPECIALISMS = [
  "Interior walls & ceilings",
  "Exterior / facade",
  "Commercial / office",
  "New build decoration",
  "Period property restoration",
  "Kitchen & bathroom",
  "Wallpapering",
  "Coving & specialist finishes",
];

const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;

export default function JoinPainter() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [postcode, setPostcode] = useState("");

  // Step 2 fields
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);

  function toggleSpecialism(s: string) {
    setSelectedSpecialisms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords must match."); return; }
    if (!ukPostcode.test(postcode)) { setError("Enter a valid UK postcode, e.g. M1 1AE."); return; }

    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "painter",
          postcode,
          specialisms: selectedSpecialisms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error === "Email already in use"
          ? "This email is already registered."
          : data.error || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("paintbook:token", data.token);
        localStorage.setItem("paintbook:user", JSON.stringify(data.user));
        navigate("/painter-onboarding");
      }
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm animate-editorial-up" style={{ animationFillMode: "both" }}>
        <div className="text-center mb-12">
          <Link to="/" className="font-display text-2xl text-foreground">PaintBookCo</Link>
          <p className="text-sm text-muted-foreground mt-2">Join as a painter</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`h-px flex-1 transition-colors duration-300 ${step >= 1 ? "bg-foreground" : "bg-border"}`} />
          <span className={`editorial-label transition-colors duration-300 ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>Details</span>
          <div className={`h-px flex-1 transition-colors duration-300 ${step >= 2 ? "bg-foreground" : "bg-border"}`} />
          <span className={`editorial-label transition-colors duration-300 ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>Specialisms</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {error && (
          <div className="text-sm text-destructive border-l-2 border-destructive pl-4 py-2 mb-8">{error}</div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-8">
            <div>
              <label className="editorial-label text-muted-foreground mb-2 block">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={fieldClass} placeholder="you@example.com" />
            </div>

            <div>
              <label className="editorial-label text-muted-foreground mb-2 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" className={fieldClass} placeholder="Min. 6 characters" />
            </div>

            <div>
              <label className="editorial-label text-muted-foreground mb-2 block">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className={fieldClass} placeholder="Repeat your password" />
            </div>

            <div>
              <label className="editorial-label text-muted-foreground mb-2 block">Work postcode</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} required className={fieldClass} placeholder="e.g. M1 1AE" />
              <p className="text-xs text-muted-foreground mt-2">We'll use this to match you with nearby jobs.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background font-medium py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground font-medium hover:text-primary transition-colors">Log in</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="editorial-label text-muted-foreground mb-4 block">Your specialisms</label>
              <p className="text-sm text-muted-foreground leading-[1.8] mb-6">
                Select all that apply. This helps us match you with the right jobs.
              </p>
              <div className="space-y-3">
                {SPECIALISMS.map((s) => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedSpecialisms.includes(s)}
                      onChange={() => toggleSpecialism(s)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-border text-foreground font-medium py-4 transition-all duration-200 hover:bg-muted"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-foreground text-background font-medium py-4 transition-all duration-200 hover:bg-foreground/85 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </div>

            <div className="border-l-2 border-primary/30 pl-6 py-2">
              <p className="text-xs font-medium text-foreground mb-2">What happens next?</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Complete your KYC verification</li>
                <li>Upload ID and insurance documents</li>
                <li>Get approved and start accepting jobs</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function JoinPainterComplete() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm text-center animate-editorial-up" style={{ animationFillMode: "both" }}>
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
        <h1 className="font-display text-2xl text-foreground mb-3">Profile complete!</h1>
        <p className="text-sm text-muted-foreground leading-[1.8] mb-10">
          Your account is verified and ready. Start browsing nearby jobs.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/dashboard/painter")}
            className="w-full bg-foreground text-background font-medium py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01]"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/find-painter")}
            className="w-full border border-border text-foreground font-medium py-4 transition-all duration-200 hover:bg-muted"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(JoinPainter, { name: "JoinPainter", inputs: [] }); })
  .catch(() => {});
