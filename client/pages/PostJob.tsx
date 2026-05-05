import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, Paintbrush, FileText, Home, Palette, Mail, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { z } from "zod";

const LOGO = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/PaintBookCO+Official+Logo.png";
const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

const JOB_TYPES = [
  { id: "interior", label: "🏠 Interior Painting", emoji: "🏠" },
  { id: "exterior", label: "🏡 Exterior Painting", emoji: "🏡" },
  { id: "wallpaper", label: "📋 Wallpapering", emoji: "📋" },
  { id: "feature-wall", label: "✨ Feature Wall", emoji: "✨" },
  { id: "tv-wall", label: "📺 TV/Media Wall", emoji: "📺" },
  { id: "commercial", label: "🏢 Commercial Painting", emoji: "🏢" },
  { id: "interior-refurb", label: "🔨 Full Interior Refurb", emoji: "🔨" },
  { id: "exterior-refurb", label: "🔧 Full Exterior Refurb", emoji: "🔧" },
  { id: "new-build", label: "🏗️ New Build Decoration", emoji: "🏗️" },
  { id: "landlord", label: "🔑 Landlord Refresh", emoji: "🔑" },
  { id: "specialist", label: "🎨 Specialist/Other", emoji: "🎨" },
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
        paint_choice: paintChoice.trim() || null,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-foreground transition-all duration-500"
          style={{ width: `${(step / 6) * 100}%` }}
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
                    <h1 className="text-2xl font-semibold tracking-tight">Where is the job?</h1>
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
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
                  className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
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
                    <h1 className="text-2xl font-semibold tracking-tight">What needs painting?</h1>
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
                      className={`p-3 border rounded-md text-sm text-left transition-colors ${
                        jobType === type.id
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {errors.jobType && <p className="text-xs text-destructive">{errors.jobType}</p>}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep2()}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
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
                    <h1 className="text-2xl font-semibold tracking-tight">Describe the job</h1>
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
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
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep3()}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
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
                    <h1 className="text-2xl font-semibold tracking-tight">How many rooms?</h1>
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
                            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
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
                            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
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
                  className="w-full border border-dashed border-border hover:border-foreground/40 hover:text-foreground text-muted-foreground py-3 rounded-md text-sm font-medium transition-colors"
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
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep4()}
                    disabled={rooms.length === 0}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
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
                    <h1 className="text-2xl font-semibold tracking-tight">Paint details</h1>
                    <p className="text-xs text-muted-foreground mt-1">Optional — helps painters quote accurately</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                    Paint choice
                  </label>
                  <input
                    type="text"
                    value={paintChoice}
                    onChange={(e) => setPaintChoice(e.target.value)}
                    className={fieldClass}
                    placeholder="e.g. Dulux Brilliant White Matt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Photos</label>
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
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleStep5()}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
                  >
                    Continue →
                  </button>
                </div>

                <p className="text-center">
                  <button onClick={() => handleStep5()} className="text-sm text-muted-foreground hover:text-foreground">
                    Skip this step →
                  </button>
                </p>
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
                    <h1 className="text-2xl font-semibold tracking-tight">Stay updated on your job</h1>
                    <p className="text-xs text-muted-foreground mt-1">We'll send painter quotes and your invoice</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">First Name</label>
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
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Last Name</label>
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Phone Number</label>
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email</label>
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
                <div className="border border-border rounded-md p-4 space-y-3">
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
                  {paintChoice && (
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
                    className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !email.trim()}
                    className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold mb-2">Job Posted!</h1>
            <p className="text-sm text-muted-foreground">Painters near your area have been notified.</p>
          </div>

          <div className="bg-card border border-border rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">Your job reference</p>
            <p className="font-mono text-sm font-medium">{jobRef}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm space-y-2">
            <p className="font-medium text-blue-900">Check your email</p>
            <p className="text-xs text-blue-700">We have sent a job tracking link to <strong>{email}</strong>. Use it to track progress, chat with your painter, approve milestones and release payment.</p>
            <p className="text-xs text-blue-600">No password needed — keep the link safe.</p>
          </div>

          <div className="bg-accent/20 border border-border rounded-md p-4 text-sm space-y-2">
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
