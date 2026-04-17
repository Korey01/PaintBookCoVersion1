import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

const JOB_TYPES = [
  "Interior Painting", "Exterior Painting", "Wallpapering",
  "Feature Wall", "TV/Media Wall", "Commercial Painting",
  "Full Interior Refurb", "Full Exterior Refurb",
  "New Build Decoration", "Landlord Refresh", "Specialist/Other"
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

export default function PostJobPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jobRef, setJobRef] = useState("");
  const [error, setError] = useState("");

  // Form state
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

  // Analytics
  const [startTime] = useState(Date.now());

  const addRoom = () => {
    setRooms(prev => [...prev, {
      type: "Living Room", custom_name: "", height: 2.4
    }]);
  };

  const updateRoom = (index: number, field: keyof Room, value: any) => {
    setRooms(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const removeRoom = (index: number) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
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
            postcode,
            city,
            job_type: jobType,
            job_description: description,
            has_structural_defects: hasDefects,
            structural_defect_details: defectDetails || null,
            rooms,
            paint_choice: paintChoice || null,
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
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }

    setSubmitting(false);
  };

  const fieldClass = "w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none text-sm";

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Posted!</h1>
            <p className="text-gray-400">
              Verified painters near {postcode} have been notified.
            </p>
            <p className="text-orange-400 font-mono text-sm mt-2">
              Job Ref: {jobRef}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 text-left space-y-4">
            <h3 className="font-semibold text-white">What happens next?</h3>
            {[
              "A verified painter will reach out to discuss your job",
              "You'll agree the details and price via our secure chat",
              "We'll send you a professional invoice to review",
              "Pay securely — funds held in escrow until completion",
              "Confirm completion and funds are released to your painter",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-gray-300 text-sm">{step}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            Return to homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-gray-500 hover:text-white text-sm">
            ← Back to PaintBookCo
          </a>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1,2,3,4,5,6].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
              step >= s ? "bg-orange-500" : "bg-gray-800"
            }`} />
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1 — Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Find a Painter Near You</h1>
              <p className="text-gray-400">Enter your location to get started</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                Postcode *
              </label>
              <input
                type="text"
                value={postcode}
                onChange={e => setPostcode(e.target.value.toUpperCase())}
                placeholder="e.g. M1 1AB"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                City / Area
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Manchester"
                className={fieldClass}
              />
            </div>
            <button
              onClick={() => postcode.trim() ? setStep(2) : setError("Please enter your postcode")}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2 — Job Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">What needs painting?</h1>
              <p className="text-gray-400">Select the type of work needed</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {JOB_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setJobType(type)}
                  className={`p-4 rounded-xl border text-sm font-medium text-left transition-colors ${
                    jobType === type
                      ? "border-orange-500 bg-orange-900/20 text-orange-400"
                      : "border-gray-700 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-gray-700 text-gray-300 py-4 rounded-xl hover:border-gray-500 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => jobType ? setStep(3) : setError("Please select a job type")}
                className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Description */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Describe your job</h1>
              <p className="text-gray-400">Tell us what you need done</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                🔒 Please do not include your phone number, email address or
                social media handles. Our platform will connect you with
                painters safely and securely.
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                Job Description *
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what you need painted, any specific requirements, preferred colours, etc."
                rows={5}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDefects}
                  onChange={e => setHasDefects(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600"
                />
                <span className="text-gray-300 text-sm">
                  Are there any structural issues? (e.g. plastering, screeding needed)
                </span>
              </label>
              {hasDefects && (
                <textarea
                  value={defectDetails}
                  onChange={e => setDefectDetails(e.target.value)}
                  placeholder="Describe the structural issues..."
                  rows={3}
                  className={`${fieldClass} mt-3`}
                />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 border border-gray-700 text-gray-300 py-4 rounded-xl hover:border-gray-500 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => description.trim() ? setStep(4) : setError("Please describe your job")}
                className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Rooms */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">How many rooms?</h1>
              <p className="text-gray-400">Add each room that needs painting</p>
            </div>
            <div className="space-y-3">
              {rooms.map((room, i) => (
                <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium text-sm">Room {i + 1}</span>
                    <button onClick={() => removeRoom(i)}
                      className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Room Type</label>
                      <select
                        value={room.type}
                        onChange={e => updateRoom(i, "type", e.target.value)}
                        className={fieldClass}
                      >
                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Custom Name (optional)</label>
                      <input
                        value={room.custom_name}
                        onChange={e => updateRoom(i, "custom_name", e.target.value)}
                        placeholder="e.g. Main bedroom"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addRoom}
              className="w-full border border-dashed border-gray-600 text-gray-400 py-3 rounded-xl hover:border-orange-500 hover:text-orange-400 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Room
            </button>
            {rooms.length > 0 && (
              <p className="text-gray-500 text-sm text-center">
                {rooms.length} room{rooms.length > 1 ? "s" : ""} added
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)}
                className="flex-1 border border-gray-700 text-gray-300 py-4 rounded-xl hover:border-gray-500 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => rooms.length > 0 ? setStep(5) : setError("Please add at least one room")}
                className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — Paint & Dimensions (optional) */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Paint details</h1>
              <p className="text-gray-400">Optional — helps painters quote accurately</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                Paint Choice
              </label>
              <input
                type="text"
                value={paintChoice}
                onChange={e => setPaintChoice(e.target.value)}
                placeholder="e.g. Dulux Brilliant White Matt"
                className={fieldClass}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-medium text-sm">Room Dimensions (optional)</h3>
              {rooms.map((room, i) => (
                <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <p className="text-white text-sm font-medium mb-3">
                    {room.custom_name || room.type}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "length", label: "Length (m)" },
                      { key: "width", label: "Width (m)" },
                      { key: "height", label: "Height (m)" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-gray-500 text-xs block mb-1">{f.label}</label>
                        <input
                          type="number"
                          step="0.1"
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
                        <label className="text-gray-500 text-xs block mb-1">{f.label}</label>
                        <input
                          type="number"
                          min="0"
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
            <div className="flex gap-3">
              <button onClick={() => setStep(4)}
                className="flex-1 border border-gray-700 text-gray-300 py-4 rounded-xl hover:border-gray-500 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => setStep(6)}
              className="w-full text-gray-500 hover:text-gray-300 text-sm">
              Skip this step
            </button>
          </div>
        )}

        {/* STEP 6 — Email & Submit */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stay updated</h1>
              <p className="text-gray-400">
                We'll send you painter responses and your invoice
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={fieldClass}
              />
              <p className="text-gray-600 text-xs mt-2">
                Used to send you painter quotes and your invoice. No account needed.
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={e => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 mt-0.5"
              />
              <span className="text-gray-400 text-sm">
                I'd like to receive painting tips and special offers from PaintBookCo
              </span>
            </label>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <h3 className="text-white font-medium text-sm mb-3">Your job summary</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="text-white">{postcode} {city && `· ${city}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Job type</span>
                  <span className="text-white">{jobType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms</span>
                  <span className="text-white">{rooms.length} room{rooms.length !== 1 ? "s" : ""}</span>
                </div>
                {paintChoice && (
                  <div className="flex justify-between">
                    <span>Paint</span>
                    <span className="text-white">{paintChoice}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(5)}
                className="flex-1 border border-gray-700 text-gray-300 py-4 rounded-xl hover:border-gray-500 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Posting job...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Post Job</>
                )}
              </button>
            </div>
            <p className="text-center text-gray-600 text-xs">
              No account needed · Free to post
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
