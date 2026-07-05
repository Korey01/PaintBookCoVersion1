import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User, Briefcase, Shield, FileCheck, Fingerprint, CheckCircle2, Mail, Upload, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

const LOGO = "https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png";
// text-base (16px) prevents iOS Safari from auto-zooming on input focus
const fieldClass = "w-full border-b border-border bg-transparent text-base text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

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

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-2", label: "1-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

type Step = 1 | 2 | 3 | 4 | 5;
type InsuranceOption = "now" | "later" | "not-required";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getPasswordLabel(score: number): string {
  if (score <= 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong";
}

function getPasswordColor(score: number): string {
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-amber-500";
  if (score === 3) return "bg-blue-500";
  return "bg-green-500";
}

export function JoinPainterComplete() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Check your inbox</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a confirmation link to your email address.
              Click the link to confirm your account, then come back
              here to sign in and complete your identity verification.
            </p>
          </div>
          <div className="space-y-2 text-left border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">What happens next</p>
            {[
              "Click the confirmation link in your email",
              "Sign in to your PaintBookCo account",
              "Complete identity verification (KYC)",
              "Submit your insurance certificate",
              "Our team activates your account",
              "Start receiving job notifications",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
          <a
            href="/login"
            className="inline-block w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors text-center"
          >
            Go to Login
          </a>
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or{" "}
            <a href="/join-painter" className="underline hover:text-foreground">
              register again
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function JoinPainter() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 - Personal Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 - Professional Details
  const [specialisms, setSpecialisms] = useState<string[]>([]);
  const [servicePostcode, setServicePostcode] = useState("");
  const [serviceCity, setServiceCity] = useState("");
  const [serviceRadius, setServiceRadius] = useState(10);
  const [experience, setExperience] = useState("");

  // Step 3 - Insurance
  const [insuranceOption, setInsuranceOption] = useState<InsuranceOption>("now");
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [policyDetails, setPolicyDetails] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [certificateFile, setCertificateFile] = useState<{ name: string; size: number } | null>(null);
  const [actualCertificateFile, setActualCertificateFile] = useState<File | null>(null);

  // Step 4 - Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Step 5 - KYC
  const [kycStarted, setKycStarted] = useState(false);

  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;
  const passwordStrength = getPasswordStrength(password);
  const passwordLabel = getPasswordLabel(passwordStrength);
  const passwordColor = getPasswordColor(passwordStrength);

  const passwordRequirements: PasswordRequirement[] = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  function toggleSpecialism(s: string) {
    setSpecialisms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function handleCertificateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ certificate: "File must be less than 5MB" });
        return;
      }
      setCertificateFile({ name: file.name, size: file.size });
      setActualCertificateFile(file);
      setErrors((prev) => {
        const { certificate, ...rest } = prev;
        return rest;
      });
    }
  }

  function handleStep1() {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name required";
    if (!lastName.trim()) errors.lastName = "Last name required";
    if (!email.trim()) errors.email = "Email required";
    else if (!email.includes("@")) errors.email = "Invalid email";
    if (!phone.trim()) errors.phone = "Phone required";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (passwordStrength <= 1) errors.password = "Password is too weak";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleStep2() {
    const errors: Record<string, string> = {};
    if (specialisms.length === 0) errors.specialisms = "Select at least one specialism";
    if (!servicePostcode.trim()) errors.servicePostcode = "Postcode required";
    else if (!ukPostcode.test(servicePostcode.trim())) errors.servicePostcode = "Invalid UK postcode";
    if (!serviceCity.trim()) errors.serviceCity = "City required";
    if (!experience) errors.experience = "Select experience level";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setStep(3);
  }

  function handleStep3() {
    const errors: Record<string, string> = {};

    // Only validate insurance fields if user chose to upload now
    if (insuranceOption === "now") {
      if (!insuranceCompany.trim()) errors.insuranceCompany = "Insurance company required";
      if (!policyNumber.trim()) errors.policyNumber = "Policy number required";
      if (!policyDetails.trim()) errors.policyDetails = "Policy details required";
      if (!expiryDate) errors.expiryDate = "Expiry date required";
      else if (new Date(expiryDate) < new Date()) errors.expiryDate = "Policy has expired";
      if (!certificateFile) errors.certificate = "Certificate upload required";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setStep(4);
  }

  async function handleStep4() {
    const errors: Record<string, string> = {};
    if (!termsAccepted) errors.terms = "You must accept the Terms of Service";
    if (!privacyAccepted) errors.privacy = "You must accept the Privacy Policy";
    // Only require insurance confirmation if user uploaded insurance now
    if (insuranceOption === "now" && !insuranceConfirmed) errors.insurance = "You must confirm your insurance coverage";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      // Register painter via Edge Function (creates auth user + painter record atomically)
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-painter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            phone,
            specialisms: specialisms,
            service_radius_km: serviceRadius,
            postcode: servicePostcode,
            city: servicePostcode,
            terms_accepted: true,
            privacy_accepted: true,
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // If painter uploaded insurance at registration, submit it now
      if (insuranceOption === "now" && actualCertificateFile) {
        try {
          // Sign in to get session
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInData?.session) {
            // Upload certificate to storage
            const fileExt = actualCertificateFile.name.split(".").pop();
            const tempId = crypto.randomUUID();
            const path = `${tempId}/${Date.now()}_insurance.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("painter-insurance")
              .upload(path, actualCertificateFile, { upsert: true });

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from("painter-insurance")
                .getPublicUrl(path);

              // Submit insurance details
              await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-insurance`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${signInData.session.access_token}`,
                    "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                  },
                  body: JSON.stringify({
                    insurance_company: insuranceCompany,
                    insurance_policy_number: policyNumber,
                    insurance_policy_details: policyDetails || "Not provided",
                    insurance_expiry_date: expiryDate,
                    insurance_certificate_url: publicUrl,
                    certificate_size_bytes: actualCertificateFile.size,
                  })
                }
              );

              // Sign out so user goes through proper login flow
              await supabase.auth.signOut();
            }
          }
        } catch (insuranceErr) {
          console.error("Insurance submission error:", insuranceErr);
          // Don't block registration if insurance fails
        }
      }

      // Trigger confirmation email (Edge Function creates the user, resend ensures delivery)
      await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/verify-email` },
      });

      // After signup, go to KYC verification
      setIsSubmitting(false);
      navigate("/kyc-painter");
    } catch (error: any) {
      setIsSubmitting(false);
      setErrors({ submit: error.message || "Registration failed" });
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <header className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain max-w-[140px]" />
        </a>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-foreground transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          {/* Step 1 - Personal Details */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Your details</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Join as a Decorator</h1>
                    <p className="text-xs text-muted-foreground mt-1">Tell us about yourself</p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStep1();
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">First name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} placeholder="John" />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Last name *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} placeholder="Smith" />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Phone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="+44 7700 000000" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Password *</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} placeholder="Min. 8 characters" />
                  {password && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                        <div className={`h-1.5 rounded-full transition-all ${passwordColor}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          Strength: <span className={passwordStrength <= 1 ? "text-red-500" : passwordStrength === 2 ? "text-amber-500" : passwordStrength === 3 ? "text-blue-500" : "text-green-500"}>{passwordLabel}</span>
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {passwordRequirements.map((req) => (
                          <li key={req.label} className={`text-xs flex items-center gap-1 ${req.met ? "text-green-600" : "text-muted-foreground"}`}>
                            <span>{req.met ? "✓" : "○"}</span> {req.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Confirm password *</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={fieldClass} placeholder="Repeat password" />
                  {confirmPassword && (
                    <p className={`text-xs mt-1 ${password === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                      {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* Step 2 - Professional Details */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Your expertise</p>
                    <h1 className="text-2xl font-semibold tracking-tight">What do you specialise in?</h1>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Specialisms *</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALISMS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialism(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          specialisms.includes(s)
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-foreground hover:border-foreground/40"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.specialisms && <p className="text-xs text-destructive mt-1">{errors.specialisms}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Service postcode *</label>
                  <input type="text" value={servicePostcode} onChange={(e) => setServicePostcode(e.target.value.toUpperCase())} className={fieldClass} placeholder="SW1A 1AA" />
                  {errors.servicePostcode && <p className="text-xs text-destructive mt-1">{errors.servicePostcode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">City/Town *</label>
                  <input type="text" value={serviceCity} onChange={(e) => setServiceCity(e.target.value)} className={fieldClass} placeholder="London" />
                  {errors.serviceCity && <p className="text-xs text-destructive mt-1">{errors.serviceCity}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Service radius</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Jobs within {serviceRadius}km of {servicePostcode || "your postcode"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Years experience *</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} className={fieldClass}>
                    <option value="">Select experience level</option>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.experience && <p className="text-xs text-destructive mt-1">{errors.experience}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button onClick={() => handleStep2()} className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Insurance */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Insurance</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Insurance details</h1>
                    <p className="text-xs text-muted-foreground mt-1">Add your public liability insurance</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Info notice */}
                <div className="border-l-2 border-blue-500 pl-3 py-2">
                  <p className="text-xs text-muted-foreground">You must hold public liability insurance of at least £2,000,000 to work on jobs. You can add this now or later from your dashboard.</p>
                </div>

                {/* Insurance Options */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors" style={{backgroundColor: insuranceOption === "now" ? "rgba(0,0,0,0.05)" : "transparent"}}>
                    <input
                      type="radio"
                      name="insurance"
                      value="now"
                      checked={insuranceOption === "now"}
                      onChange={(e) => setInsuranceOption(e.target.value as InsuranceOption)}
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Add insurance now</p>
                      <p className="text-xs text-muted-foreground">Upload your policy details and certificate immediately</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors" style={{backgroundColor: insuranceOption === "later" ? "rgba(0,0,0,0.05)" : "transparent"}}>
                    <input
                      type="radio"
                      name="insurance"
                      value="later"
                      checked={insuranceOption === "later"}
                      onChange={(e) => setInsuranceOption(e.target.value as InsuranceOption)}
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Add insurance later</p>
                      <p className="text-xs text-muted-foreground">Upload from your dashboard within 7 days of account creation</p>
                    </div>
                  </label>
                </div>

                {/* Insurance Form - Show only if "now" is selected */}
                {insuranceOption === "now" && (
                  <div className="space-y-6 pt-4 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Insurance company *</label>
                      <input type="text" value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} className={fieldClass} placeholder="e.g. AXA" />
                      {errors.insuranceCompany && <p className="text-xs text-destructive mt-1">{errors.insuranceCompany}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Policy number *</label>
                      <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} className={fieldClass} placeholder="e.g. POL-12345" />
                      {errors.policyNumber && <p className="text-xs text-destructive mt-1">{errors.policyNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Policy details *</label>
                      <textarea
                        value={policyDetails}
                        onChange={(e) => setPolicyDetails(e.target.value)}
                        className="w-full border-b border-border bg-transparent text-base text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
                        rows={3}
                        placeholder="Coverage details..."
                      />
                      {errors.policyDetails && <p className="text-xs text-destructive mt-1">{errors.policyDetails}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Expiry date *</label>
                      <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={fieldClass} />
                      {errors.expiryDate && <p className="text-xs text-destructive mt-1">{errors.expiryDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Upload certificate *</label>
                      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" onChange={handleCertificateUpload} className="hidden" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-border hover:border-foreground/40 py-6 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex flex-col items-center gap-2"
                      >
                        <Upload className="h-5 w-5" />
                        Upload certificate
                        <span className="text-xs">PDF, JPG or PNG — max 5MB</span>
                      </button>
                      {certificateFile && <p className="text-xs text-green-600 mt-2">✓ {certificateFile.name}</p>}
                      {errors.certificate && <p className="text-xs text-destructive mt-2">{errors.certificate}</p>}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button onClick={() => handleStep3()} className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Terms */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Terms</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Almost there</h1>
                    <p className="text-xs text-muted-foreground mt-1">Review and accept our terms</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Summary card */}
                <div className="border border-border rounded-md p-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-2">Commission Structure</p>
                    <p className="text-xs text-muted-foreground">Jobs 1-5: 12% | Jobs 6-10: 10% | Jobs 11+: 8%</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">How it works</p>
                    <p className="text-xs text-muted-foreground">Customer pays escrow → Job completed → Customer confirms → You get paid</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Requirements</p>
                    <p className="text-xs text-muted-foreground">KYC verification + Insurance required. No off-platform contact details.</p>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Terms of Service</a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border" />
                    <span className="text-sm text-foreground">
                      I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Privacy Policy</a>
                    </span>
                  </label>

                  {insuranceOption === "now" && (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={insuranceConfirmed}
                        onChange={(e) => setInsuranceConfirmed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm text-foreground">I confirm I hold valid public liability insurance of at least <strong>£2,000,000</strong></span>
                    </label>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border" />
                    <span className="text-sm text-foreground">I'd like marketing communications (optional)</span>
                  </label>
                </div>

                {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep4}
                    disabled={isSubmitting || !termsAccepted || !privacyAccepted || (insuranceOption === "now" && !insuranceConfirmed)}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 - KYC Verification */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Fingerprint className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Identity verification</p>
                    <h1 className="text-2xl font-semibold tracking-tight">Verify your identity</h1>
                    <p className="text-xs text-muted-foreground mt-1">Required before receiving jobs</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border border-border rounded-md p-4 space-y-3">
                  <p className="font-medium text-sm">What you'll need</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Valid photo ID (passport or driving licence)</li>
                    <li>✓ Smartphone or webcam for face scan</li>
                    <li>✓ Good lighting</li>
                    <li>✓ 3-5 minutes</li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground italic">Powered by Didit — GDPR compliant. Documents are encrypted and never stored by PaintBookCo.</p>

                <button
                  onClick={async () => {
                    setKycStarted(true);
                    try {
                      const { data: { session: authSession } } = await supabase.auth.getSession();
                      if (!authSession?.access_token) return;
                      const res = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-kyc`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                            "Authorization": `Bearer ${authSession.access_token}`,
                          },
                          body: JSON.stringify({}),
                        }
                      );
                      const result = await res.json();
                      if (result.verification_url) {
                        window.open(result.verification_url, "_blank");
                      }
                    } catch (err) {
                      console.error("KYC error:", err);
                    }
                  }}
                  className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Start Identity Verification
                </button>

                {kycStarted && (
                  <div className="border border-amber-500/30 bg-amber-500/5 rounded-md p-4 text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">Verification in progress</p>
                    <p className="text-xs text-muted-foreground">Complete the verification in the tab that opened. Return here when done.</p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => navigate("/join-painter/completed")}
                        className="flex-1 text-sm font-medium text-foreground hover:text-muted-foreground"
                      >
                        Check My Status
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
