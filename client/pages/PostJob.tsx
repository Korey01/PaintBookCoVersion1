import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, Paintbrush, FileText, Home, Palette, Mail, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { z } from "zod";

const LOGO = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png";
const fieldClass = "w-full text-sm py-3 placeholder:text-[#C4C2BA] focus:outline-none transition-colors duration-200 bg-transparent";

const JOB_TYPES = [
  { id: "interior", label: "Interior Painting", emoji: "🏠" },
  { id: "exterior", label: "Exterior Painting", emoji: "🏡" },
  { id: "wallpaper", label: "Wallpapering", emoji: "📋" },
  { id: "feature-wall", label: "Feature Wall", emoji: "✨" },
  { id: "tv-wall", label: "TV/Media Wall", emoji: "📺" },
  { id: "commercial", label: "Commercial Painting", emoji: "🏢" },
  { id: "interior-refurb", label: "Full Interior Refurb", emoji: "🔨" },
  { id: "exterior-refurb", label: "Full Exterior Refurb", emoji: "🔧" },
  { id: "new-build", label: "New Build Decoration", emoji: "🏗️" },
  { id: "landlord", label: "Landlord Refresh", emoji: "🔑" },
  { id: "specialist", label: "Specialist / Other", emoji: "🎨" },
];

const ROOM_TYPES = ["Bedroom", "Living Room", "Kitchen", "Bathroom", "Hallway", "Office", "Garage", "Other"];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface Room {
  id: string;
  type: string;
  name: string;
  length?: number;
  width?: number;
  height?: number;
  doors?: number;
  windows?: number;
}

export default function PostJob() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [params] = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 - Location
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");

  // Step 2 - Job Type
  const [jobType, setJobType] = useState("");

  // Step 3 - Description
  const [description, setDescription] = useState("");
  const [hasStructuralIssues, setHasStructuralIssues] = useState(false);
  const [structuralDetails, setStructuralDetails] = useState("");

  // Step 4 - Rooms
  const [rooms, setRooms] = useState<Room[]>([]);

  // Step 5 - Paint Details
  const [paintChoice, setPaintChoice] = useState("");
  const [useVestimator, setUseVestimator] = useState(false);
  const [vestimatorEstimate, setVestimatorEstimate] = useState<number | null>(null);
  const [vestimatorColour, setVestimatorColour] = useState("");
  const [vestimatorNotes, setVestimatorNotes] = useState("");

  // Step 6 - Contact & Submit
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;

  function addRoom() {
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      type: ROOM_TYPES[0],
      name: "",
    };
    setRooms([...rooms, newRoom]);
  }

  function updateRoom(id: string, updates: Partial<Room>) {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  function deleteRoom(id: string) {
    setRooms(rooms.filter((r) => r.id !== id));
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  function handleStep1() {
    const errors: Record<string, string> = {};
    if (!postcode.trim()) errors.postcode = "Postcode is required";
    else if (!ukPostcode.test(postcode.trim())) errors.postcode = "Invalid UK postcode";
    if (!city.trim()) errors.city = "City is required";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleStep2() {
    if (!jobType) {
      setErrors({ jobType: "Please select a job type" });
      return;
    }
    setErrors({});
    setStep(3);
  }

  function handleStep3() {
    const errors: Record<string, string> = {};
    if (!description.trim()) errors.description = "Description is required";
    else if (description.trim().length < 10) errors.description = "Description must be at least 10 characters";

    if (hasStructuralIssues && !structuralDetails.trim()) {
      errors.structuralDetails = "Please describe the structural issues";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    setStep(4);
  }

  function handleStep4() {
    if (rooms.length === 0) {
      setErrors({ rooms: "Please add at least one room" });
      return;
    }
    setErrors({});
    setStep(5);
  }

  function handleStep5() {
    setErrors({});
    setStep(6);
  }

  async function handleSubmit() {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!email.includes("@")) errors.email = "Invalid email address";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const payload = {
        postcode: postcode.trim().toUpperCase(),
        city: city.trim(),
        job_type: jobType,
        description: description.trim(),
        structural_issues: hasStructuralIssues,
        structural_details: structuralDetails.trim() || null,
        rooms: rooms.length > 0 ? rooms : null,
        paint_choice: vestimatorColour.trim() || paintChoice.trim() || null,
        vestimator_estimate: vestimatorEstimate,
        vestimator_notes: vestimatorNotes.trim() || null,
        customer_first_name: firstName.trim(),
        customer_last_name: lastName.trim(),
        customer_phone: phone.trim(),
        email: email.trim(),
        marketing_consent: marketingConsent,
        images: images.slice(0, 5),
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to post job");
      }

      navigate("/post-job/confirmation", {
        state: { jobRef: result.job_ref, email: email.trim() }
      });
    } catch (error) {
      console.error("Error posting job:", error);
      setErrors({ submit: "Failed to post job. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col ambient-ivory">
      {/* Header */}
      <header className="px-6 py-5" style={{ background: '#FFFFFF', borderBottom: '0.5px solid rgba(180,150,100,0.18)' }}>
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      {/* Progress bar */}
      <div className="h-0.5" style={{ background: 'rgba(180,150,100,0.2)' }}>
        <div
          className="h-full transition-all duration-500" style={{ background: '#D85A30', width: `${(step / 6) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Step 1 - Location */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Your location</p>
                    <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Where is the job?</h1>
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
                  <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    className={fieldClass}
                    placeholder="SW1A 1AA"
                  />
                  {errors.postcode && <p className="text-xs text-destructive mt-1">{errors.postcode}</p>}
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                    City/Area *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={fieldClass}
                    placeholder="London"
                  />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                </div>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 w-full" style={{ background: '#D85A30', color: '#F5F0E8' }}
                >
                  Continue →
                </button>
              </form>
            </div>
          )}

          {/* Step 2 - Job Type */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Paintbrush className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Type of work</p>
                    <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>What needs painting?</h1>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {JOB_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setJobType(type.id);
                        setErrors({});
                      }}
                      className="p-3 text-sm text-left transition-all rounded-lg"
                      style={jobType === type.id
                        ? { border: '0.5px solid #D85A30', background: 'rgba(216,90,48,0.06)', color: '#1A1A14' }
                        : { border: '0.5px solid rgba(180,150,100,0.25)', background: '#FFFFFF', color: '#1A1A14' }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {errors.jobType && <p className="text-xs text-destructive">{errors.jobType}</p>}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all" style={{ background: 'transparent', border: '0.5px solid rgba(180,150,100,0.3)', color: '#1A1A14' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep2()}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2" style={{ background: '#D85A30', color: '#F5F0E8' }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Description */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Job details</p>
                    <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Describe the job</h1>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Safety notice */}
                <div className="border-l-2 border-amber-500 pl-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Do not include phone numbers, email addresses or social media handles. Our system screens messages
                    automatically.
                  </p>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
                    rows={4}
                    placeholder="Describe what needs painting..."
                  />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                </div>

                {/* Structural issues */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasStructuralIssues}
                      onChange={(e) => setHasStructuralIssues(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Any structural issues? (plastering, screeding)</span>
                  </label>

                  {hasStructuralIssues && (
                    <textarea
                      value={structuralDetails}
                      onChange={(e) => setStructuralDetails(e.target.value)}
                      className="w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none"
                      rows={3}
                      placeholder="Describe the structural issues..."
                    />
                  )}
                  {errors.structuralDetails && <p className="text-xs text-destructive">{errors.structuralDetails}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all" style={{ background: 'transparent', border: '0.5px solid rgba(180,150,100,0.3)', color: '#1A1A14' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep3()}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2" style={{ background: '#D85A30', color: '#F5F0E8' }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Rooms */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Rooms</p>
                    <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>How many rooms?</h1>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Room list */}
                {rooms.length > 0 && (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div key={room.id} className="border border-border rounded-md p-4 relative">
                        <button
                          onClick={() => deleteRoom(room.id)}
                          className="absolute top-4 right-4 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>

                        <div className="space-y-3 pr-8">
                          <div>
                            <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                              Room type
                            </label>
                            <select
                              value={room.type}
                              onChange={(e) => updateRoom(room.id, { type: e.target.value })}
                              className={fieldClass}
                            >
                              {ROOM_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                              Custom name (optional)
                            </label>
                            <input
                              type="text"
                              value={room.name}
                              onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                              className={fieldClass}
                              placeholder="e.g. Master bedroom"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add room button */}
                <button
                  onClick={addRoom}
                  className="w-full py-3 rounded-lg text-sm font-medium transition-all" style={{ border: '0.5px dashed rgba(180,150,100,0.4)', color: '#9B8A75', background: 'transparent' }}
                >
                  + Add a room
                </button>

                {rooms.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">{rooms.length} room{rooms.length !== 1 ? "s" : ""} added</p>
                )}
                {errors.rooms && <p className="text-xs text-destructive text-center">{errors.rooms}</p>}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all" style={{ background: 'transparent', border: '0.5px solid rgba(180,150,100,0.3)', color: '#1A1A14' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep4()}
                    disabled={rooms.length === 0}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: '#D85A30', color: '#F5F0E8' }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 - Paint Details (optional) */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Paint details</p>
                    <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Paint & Colour</h1>
                    <p className="text-xs text-muted-foreground mt-1">Optional — use our Paint Vestimator to estimate paint usage, visualise colours and get product recommendations</p>
                  </div>
                </div>
              </div>

              {/* Vestimator toggle */}
              <div className="border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Use Paint Vestimator</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Estimate paint usage, visualise wall colours and browse products</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseVestimator(v => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useVestimator ? "bg-foreground" : "bg-muted"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useVestimator ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {useVestimator && (
                  <div className="space-y-4">
                    <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium">Estimates only:</span> Paint quantities and costs shown are estimates. Actual usage may vary depending on surface condition, number of coats and application method. Always check product coverage rates before purchasing.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                          Estimated paint cost (£)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={vestimatorEstimate ?? ""}
                          onChange={e => setVestimatorEstimate(e.target.value ? Number(e.target.value) : null)}
                          className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                          placeholder="e.g. 45.00"
                        />
                      </div>
                      <div>
                        <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                          Chosen colour / paint
                        </label>
                        <input
                          type="text"
                          value={vestimatorColour}
                          onChange={e => setVestimatorColour(e.target.value)}
                          className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                          placeholder="e.g. Farrow & Ball Elephant's Breath"
                        />
                      </div>
                      <div>
                        <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>
                          Additional notes
                        </label>
                        <textarea
                          value={vestimatorNotes}
                          onChange={e => setVestimatorNotes(e.target.value)}
                          rows={2}
                          className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
                          placeholder="e.g. 2 coats needed, customer supplying paint"
                        />
                      </div>
                    </div>

                    <a
                      href="/vestimator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full border border-border py-2.5 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                    >
                      <Palette className="h-4 w-4" />
                      Open Full Paint Vestimator →
                    </a>
                    <p className="text-xs text-muted-foreground text-center">Opens in a new tab — come back here to continue</p>
                  </div>
                )}
              </div>

              {/* Photo upload */}
              <div className="space-y-3">
                <label className="block uppercase tracking-wider" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>Photos (optional)</label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Add Photos
                </button>
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((src, i) => (
                      <img key={i} src={src} className="h-24 w-full rounded object-cover" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-lg text-sm font-medium transition-all" style={{ background: 'transparent', border: '0.5px solid rgba(180,150,100,0.3)', color: '#1A1A14' }}
                >
                  Back
                </button>
                <button
                  onClick={() => handleStep5()}
                  className="flex-1 py-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2" style={{ background: '#D85A30', color: '#F5F0E8' }}
                >
                  {useVestimator && (vestimatorEstimate || vestimatorColour) ? "Continue →" : "Skip →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 6 - Email & Submit */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Almost done</p>
                    <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Stay updated on your job</h1>
                    <p className="text-xs text-muted-foreground mt-1">We'll send painter quotes and your invoice</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={fieldClass}
                      placeholder="Jane"
                    />
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={fieldClass}
                      placeholder="Smith"
                    />
                    {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                    placeholder="07700 900000"
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: '#9B8A75', fontWeight: 500, letterSpacing: '0.1em' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                    placeholder="you@example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">No account needed. We'll send your job tracking link here.</p>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Subscribe to tips, promotions and PaintBookCo news</span>
                </label>

                {/* Job summary */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(180,150,100,0.07)', border: '0.5px solid rgba(180,150,100,0.18)' }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{city}, {postcode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Job type</span>
                    <span className="font-medium">{JOB_TYPES.find((t) => t.id === jobType)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rooms</span>
                    <span className="font-medium">{rooms.length} room{rooms.length !== 1 ? "s" : ""}</span>
                  </div>
                  {(vestimatorColour || vestimatorEstimate) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paint:</span>
                      <span className="font-medium">
                        {vestimatorColour && <span>{vestimatorColour}</span>}
                        {vestimatorEstimate && <span className="ml-2">~£{vestimatorEstimate}</span>}
                      </span>
                    </div>
                  )}
                  {!vestimatorColour && !vestimatorEstimate && paintChoice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paint</span>
                      <span className="font-medium">{paintChoice}</span>
                    </div>
                  )}
                </div>

                {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all" style={{ background: 'transparent', border: '0.5px solid rgba(180,150,100,0.3)', color: '#1A1A14' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !email.trim()}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: '#D85A30', color: '#F5F0E8' }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function PostJobConfirmation() {
  const location = useLocation();
  const jobRef = location.state?.jobRef || "PBC-XXXXXX";
  const email = location.state?.email || "your email";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col ambient-ivory">
      <header className="px-6 py-5" style={{ background: '#FFFFFF', borderBottom: '0.5px solid rgba(180,150,100,0.18)' }}>
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,90,61,0.1)' }}>
            <CheckCircle2 className="h-7 w-7" style={{ color: '#2D5A3D' }} />
          </div>

          <div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Job Posted!</h1>
            <p className="text-sm text-muted-foreground">Painters near your area have been notified.</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)' }}>
            <p className="text-xs text-muted-foreground mb-1">Your job reference</p>
            <p className="font-mono text-sm font-medium">{jobRef}</p>
          </div>

          <div className="rounded-xl p-4 text-sm space-y-2" style={{ background: 'rgba(45,90,61,0.06)', border: '0.5px solid rgba(45,90,61,0.2)' }}>
            <p className="font-medium" style={{ color: '#2D5A3D' }}>Check your email</p>
            <p className="text-xs" style={{ color: '#4A7A5A' }}>We have sent a job tracking link to <strong>{email}</strong>. Use it to track progress, chat with your painter, approve milestones and release payment.</p>
            <p className="text-xs" style={{ color: '#4A7A5A' }}>No password needed — keep the link safe.</p>
          </div>

          <div className="rounded-xl p-4 text-sm space-y-2" style={{ background: 'rgba(180,150,100,0.08)', border: '0.5px solid rgba(180,150,100,0.2)' }}>
            <p className="font-medium">What happens next</p>
            <ol className="text-xs text-muted-foreground space-y-1 text-left">
              <li>1. A verified painter reviews your job and makes contact</li>
              <li>2. Agree the job details and price via chat</li>
              <li>3. Receive invoice by email — pay securely into escrow</li>
              <li>4. Painter completes the work</li>
              <li>5. Confirm completion — funds released to painter</li>
            </ol>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            Return to homepage
          </button>
        </div>
      </main>
    </div>
  );
}
