import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800";

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

// Completion screen component
export function JoinPainterComplete() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <Link to="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">Registration Complete</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your application has been submitted successfully.<br />
            Check your email for next steps and verification instructions.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-sm font-medium underline underline-offset-4 text-foreground hover:text-muted-foreground"
          >
            Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function JoinPainter() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Step 1 — personal details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 — account + location
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [postcode, setPostcode] = useState("");

  // Step 3 — specialisms
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);

  function toggleSpecialism(s: string) {
    setSelectedSpecialisms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!ukPostcode.test(postcode.trim())) {
      setError("Please enter a valid UK postcode (e.g. SW1A 1AA).");
      return;
    }
    setStep(3);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (selectedSpecialisms.length === 0) {
      setError("Please select at least one specialism.");
      return;
    }
    setIsLoading(true);

    try {
      // Call the backend API endpoint for painter registration
      const response = await fetch("https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/register-painter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          specialisms: selectedSpecialisms,
          service_radius_km: 70,
          postcode: postcode.trim().toUpperCase(),
          city: "",
          terms_accepted: true,
          privacy_accepted: true,
        }),
      });

      const data = await response.json();
      console.log("Registration response:", { status: response.status, data });

      if (response.ok && data.success) {
        setIsLoading(false);
        setConfirmed(true);
      } else {
        setIsLoading(false);
        const errorMsg = data.error || data.message || "Registration failed. Please try again.";
        console.error("Registration failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Registration error:", err);
      setError("Failed to create account. Please try again.");
    }
  }

  // ── Email confirmation screen ──────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 py-5 border-b border-border">
          <Link to="/">
            <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">Check your inbox</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We've sent a confirmation link to <strong>{email}</strong>.<br />
              Please confirm your email before logging in.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-sm font-medium underline underline-offset-4 text-foreground hover:text-muted-foreground"
            >
              Back to login
            </Link>
          </div>
        </main>
      </div>
    );
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
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "bg-foreground" : "bg-border"}`}
              />
            ))}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            {step === 1 && "Join as a Painter"}
            {step === 2 && "Set up your account"}
            {step === 3 && "Your specialisms"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {step === 1 && "Tell us about yourself"}
            {step === 2 && "Choose a password and your location"}
            {step === 3 && "Select the services you offer"}
          </p>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">First name</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Last name</label>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} placeholder="Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Phone</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="+44 7700 000000" />
              </div>
              <button type="submit" className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Confirm password</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={fieldClass} placeholder="Repeat password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Postcode</label>
                <input type="text" required value={postcode} onChange={(e) => setPostcode(e.target.value)} className={fieldClass} placeholder="SW1A 1AA" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors">
                  Back
                </button>
                <button type="submit" className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {SPECIALISMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialism(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedSpecialisms.includes(s)
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {isLoading ? "Creating account…" : "Create account"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
