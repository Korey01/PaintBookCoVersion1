import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Plus, Trash2, MapPin, Paintbrush, FileText, Home, Palette, Mail } from "lucide-react";

const JOB_TYPES = [
  { label: "Interior Painting", icon: "🏠" },
  { label: "Exterior Painting", icon: "🏡" },
  { label: "Wallpapering", icon: "📋" },
  { label: "Feature Wall", icon: "✨" },
  { label: "TV/Media Wall", icon: "📺" },
  { label: "Commercial Painting", icon: "🏢" },
  { label: "Full Interior Refurb", icon: "🔨" },
  { label: "Full Exterior Refurb", icon: "🔧" },
  { label: "New Build Decoration", icon: "🏗️" },
  { label: "Landlord Refresh", icon: "🔑" },
  { label: "Specialist/Other", icon: "🎨" },
];

const ROOM_TYPES = [
  "Living Room", "Bedroom", "Master Bedroom",
  "Bathroom", "Kitchen", "Hallway", "Landing",
  "Office/Study", "Dining Room", "Conservatory", "Other"
];

type Room = {
  type: string;
  custom_name: string;
  length?: number;
  width?: number;
  height?: number;
  doors?: number;
  windows?: number;
};

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";
const labelClass = "block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider";

const TOTAL_STEPS = 6;

export default function PostJobPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jobRef, setJobRef] = useState("");
  const [error, setError] = useState("");

  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [jobType, setJobType] = useState("");
  const [description, setDescription] = useState("");
  const [hasDefects, setHasDefects] = useState(false);
  const [defectDetails, setDefectDetails] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [paintChoice, setPaintChoice] = useState("");
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [startTime] = useState(Date.now());

  const goTo = (nextStep: number) => {
    if (animating) return;
    setError("");
    setDirection(nextStep > step ? "forward" : "backward");
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
      setAnimating(false);
    }, 220);
  };

  const next = (nextStep: number) => {
    setError("");
    goTo(nextStep);
  };

  const addRoom = () => {
    setRooms(prev => [...prev, { type: "Living Room", custom_name: "", height: 2.4 }]);
  };

  const updateRoom = (i: number, field: keyof Room, value: any) => {
    setRooms(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const removeRoom = (i: number) => {
    setRooms(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
      const urlParams = new URLSearchParams(window.location.search);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: email || null,
            postcode, city, job_type: jobType,
            job_description: description,
            has_structural_defects: hasDefects,
            structural_defect_details: defectDetails || null,
            rooms, paint_choice: paintChoice || null,
            utm_source: urlParams.get("utm_source"),
            utm_medium: urlParams.get("utm_medium"),
            utm_campaign: urlParams.get("utm_campaign"),
            referrer: document.referrer || null,
            landing_page: window.location.pathname,
            device_type: deviceType,
            browser: navigator.userAgent.split(" ").pop() || null,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            form_step_reached: step,
            time_spent_seconds: timeSpent,
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("pbc_session_id", data.session_id);
        localStorage.setItem("pbc_session_token", data.session_token);
        localStorage.setItem("pbc_job_ref", data.job_ref);
        setJobRef(data.job_ref);
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to post job. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    setSubmitting(false);
  };

  const stepTitles = [
    "Your location",
    "Type of work",
    "Job details",
    "Rooms",
    "Paint details",
    "Almost done",
  ];

  const stepIcons = [MapPin, Paintbrush, FileText, Home, Palette, Mail];
  const StepIcon = stepIcons[step - 1];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 py-5 border-b border-border">
          <a href="/">
            <img src="/logo.png" alt="PaintBookCo" className="h-8 object-contain" />
          </a>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Job Posted!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Verified painters near <strong>{postcode}</strong> have been notified.
                A painter will reach out to discuss your job.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-3 font-mono">
                Job ref: {jobRef}
              </p>
            </div>
            <div className="text-left space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                What happens next
              </p>
              {[
                "A verified painter contacts you to chat about your job",
                "You agree the details and price",
                "We send you an invoice — pay securely via escrow",
                "Painter completes the work",
                "You confirm completion and funds are released",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Return to homepage
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <a href="/">
            <img src="/logo.png" alt="PaintBookCo" className="h-8 object-contain" />
          </a>
          <span className="text-xs text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-border h-0.5">
        <div
          className="h-0.5 bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">

          {/* Step indicator */}
          <div
            className="transition-all duration-200"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateX(0)"
                : direction === "forward"
                  ? "translateX(-24px)"
                  : "translateX(24px)",
            }}
          >
            {/* Icon */}
            <div className="mb-8">
              <StepIcon className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Step label */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {stepTitles[step - 1]}
            </p>

            {error && (
              <div className="mb-6 text-sm text-destructive border-b border-destructive pb-2">
                {error}
              </div>
            )}

            {/* STEP 1 — Location */}
            {step === 1 && (
              <div className="space-y-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Where is the job?
                </h1>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Postcode *</label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={e => setPostcode(e.target.value.toUpperCase())}
                      placeholder="e.g. M1 1AB"
                      autoFocus
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City / Area</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Manchester"
                      className={fieldClass}
                    />
                  </div>
                </div>
                <button
                  onClick={() => postcode.trim() ? next(2) : setError("Please enter your postcode")}
                  className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* STEP 2 — Job Type */}
            {step === 2 && (
              <div className="space-y-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  What needs painting?
                </h1>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_TYPES.map(type => (
                    <button
                      key={type.label}
                      onClick={() => setJobType(type.label)}
                      className={`p-3 rounded-md border text-left text-sm transition-all duration-150 ${
                        jobType === type.label
                          ? "border-foreground bg-foreground/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/40"
                      }`}
                    >
                      <span className="text-base mr-2">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => goTo(1)}
                    className="flex-1 border border-border py-3 rounded-md text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={() => jobType ? next(3) : setError("Please select a job type")}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Description */}
            {step === 3 && (
              <div className="space-y-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Describe the job
                </h1>
                <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 leading-relaxed">
                  Please do not include your phone number, email or social media handles.
                  Our platform connects you with painters safely.
                </div>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Description *</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what needs to be painted, any specific requirements..."
                      rows={4}
                      className="w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hasDefects ? "bg-foreground border-foreground" : "border-border group-hover:border-foreground/40"}`}
                        onClick={() => setHasDefects(!hasDefects)}>
                        {hasDefects && <span className="text-background text-xs">✓</span>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Are there any structural issues? (plastering, screeding etc.)
                      </span>
                    </label>
                    {hasDefects && (
                      <div className="mt-4">
                        <label className={labelClass}>Describe the issues</label>
                        <textarea
                          value={defectDetails}
                          onChange={e => setDefectDetails(e.target.value)}
                          placeholder="e.g. One wall needs re-plastering before painting..."
                          rows={2}
                          className="w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => goTo(2)}
                    className="flex-1 border border-border py-3 rounded-md text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={() => description.trim() ? next(4) : setError("Please describe your job")}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — Rooms */}
            {step === 4 && (
              <div className="space-y-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  How many rooms?
                </h1>
                <div className="space-y-3">
                  {rooms.map((room, i) => (
                    <div key={i} className="border border-border rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Room {i + 1}
                        </span>
                        <button onClick={() => removeRoom(i)}
                          className="text-muted-foreground hover:text-foreground transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Type</label>
                          <select
                            value={room.type}
                            onChange={e => updateRoom(i, "type", e.target.value)}
                            className="w-full border-b border-border bg-transparent text-sm text-foreground py-2 focus:outline-none focus:border-foreground transition-colors"
                          >
                            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Custom name</label>
                          <input
                            value={room.custom_name}
                            onChange={e => updateRoom(i, "custom_name", e.target.value)}
                            placeholder="Optional"
                            className={fieldClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addRoom}
                    className="w-full border border-dashed border-border py-3 rounded-md text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add a room
                  </button>
                  {rooms.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {rooms.length} room{rooms.length > 1 ? "s" : ""} added
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => goTo(3)}
                    className="flex-1 border border-border py-3 rounded-md text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={() => rooms.length > 0 ? next(5) : setError("Please add at least one room")}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 — Paint details (optional) */}
            {step === 5 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Paint details
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional — helps painters quote more accurately
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Paint choice</label>
                    <input
                      type="text"
                      value={paintChoice}
                      onChange={e => setPaintChoice(e.target.value)}
                      placeholder="e.g. Dulux Brilliant White Matt"
                      className={fieldClass}
                    />
                  </div>
                  {rooms.length > 0 && (
                    <div className="space-y-4">
                      <p className={labelClass}>Room dimensions (optional)</p>
                      {rooms.map((room, i) => (
                        <div key={i} className="border border-border rounded-md p-4">
                          <p className="text-sm font-medium mb-3">
                            {room.custom_name || room.type}
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { key: "length", label: "Length (m)" },
                              { key: "width", label: "Width (m)" },
                              { key: "height", label: "Height (m)" },
                            ].map(f => (
                              <div key={f.key}>
                                <label className={labelClass}>{f.label}</label>
                                <input
                                  type="number" step="0.1"
                                  value={(room as any)[f.key] || ""}
                                  onChange={e => updateRoom(i, f.key as keyof Room, parseFloat(e.target.value))}
                                  className={fieldClass}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {[
                              { key: "doors", label: "Doors" },
                              { key: "windows", label: "Windows" },
                            ].map(f => (
                              <div key={f.key}>
                                <label className={labelClass}>{f.label}</label>
                                <input
                                  type="number" min="0"
                                  value={(room as any)[f.key] || ""}
                                  onChange={e => updateRoom(i, f.key as keyof Room, parseInt(e.target.value))}
                                  className={fieldClass}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => goTo(4)}
                    className="flex-1 border border-border py-3 rounded-md text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={() => next(6)}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => next(6)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Skip this step →
                </button>
              </div>
            )}

            {/* STEP 6 — Email */}
            {step === 6 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Stay updated on your job
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll send you painter responses and your invoice
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={fieldClass}
                    />
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      No account needed. Used only to send painter quotes and your invoice.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${marketingConsent ? "bg-foreground border-foreground" : "border-border group-hover:border-foreground/40"}`}
                      onClick={() => setMarketingConsent(!marketingConsent)}
                    >
                      {marketingConsent && <span className="text-background text-xs">✓</span>}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      I'd like to receive painting tips and offers from PaintBookCo
                    </span>
                  </label>
                </div>

                {/* Summary */}
                <div className="border border-border rounded-md p-4 space-y-2">
                  <p className={labelClass}>Your job summary</p>
                  {[
                    { label: "Location", value: `${postcode}${city ? ` · ${city}` : ""}` },
                    { label: "Job type", value: jobType },
                    { label: "Rooms", value: `${rooms.length} room${rooms.length !== 1 ? "s" : ""}` },
                    ...(paintChoice ? [{ label: "Paint", value: paintChoice }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => goTo(5)}
                    className="flex-1 border border-border py-3 rounded-md text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Post Job</>
                    )}
                  </button>
                </div>
                <p className="text-center text-xs text-muted-foreground/60">
                  Free to post · No account needed
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
