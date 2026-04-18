import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BRAND_INFO, DEFAULT_ESTIMATOR_INPUT, useEstimate, PAINT_TYPES } from "@/lib/paint-estimator";
import { useToast } from "@/hooks/use-toast";
import { RoomDimensions, type Room } from "@/components/site/RoomDimensions";
import { z } from "zod";

const fieldClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";
const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200";

export default function PostJob() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  type Step = 1 | 2 | 3 | 4;
  const [step, setStep] = useState<Step>(1);

  const [jobType, setJobType] = useState("");
  const [desc, setDesc] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [useEscrow, setUseEscrow] = useState(true);
  const [attachedEstimate, setAttachedEstimate] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem("paintbook:rooms");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.map((room: any) => ({
              id: room.id || `room_${Date.now()}`,
              name: room.name || "Room",
              length: typeof room.length === "number" ? room.length : 4,
              width: typeof room.width === "number" ? room.width : 3.5,
              height: typeof room.height === "number" ? room.height : 2.4,
              coats: typeof room.coats === "number" ? room.coats : 1,
            }))
          : [];
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("paintbook:rooms", JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  const brandNames = Object.keys(BRAND_INFO) as Array<keyof typeof BRAND_INFO>;
  const [selectedBrand, setSelectedBrand] = useState<keyof typeof BRAND_INFO>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("paintbook:lastEstimate") || "null");
      if (stored && typeof stored.selectedBrand === "string" && stored.selectedBrand in BRAND_INFO) {
        return stored.selectedBrand as keyof typeof BRAND_INFO;
      }
    } catch {}
    return brandNames[0];
  });

  const [estimatorInput, setEstimatorInput] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("paintbook:lastEstimate") || "null");
      if (stored && typeof stored === "object") {
        const { selectedBrand: _selectedBrand, ...rest } = stored;
        return { ...DEFAULT_ESTIMATOR_INPUT, ...rest };
      }
    } catch {}
    return DEFAULT_ESTIMATOR_INPUT;
  });

  const prePainter = params.get("painter") || undefined;

  useEffect(() => {
    localStorage.setItem("paintbook:lastEstimate", JSON.stringify({ ...estimatorInput, selectedBrand }));
  }, [estimatorInput, selectedBrand]);

  useEffect(() => {
    const info = BRAND_INFO[selectedBrand]?.[estimatorInput.paintType];
    if (!info) return;
    setEstimatorInput((prev) => {
      if (prev.coverage === info.coverage && prev.pricePerLitre === info.pricePerLitre) {
        return prev;
      }
      return { ...prev, coverage: info.coverage, pricePerLitre: info.pricePerLitre };
    });
  }, [selectedBrand, estimatorInput.paintType]);

  useEffect(() => {
    const est = params.get("estimate");
    if (est) {
      try {
        const parsed = JSON.parse(est);
        setAttachedEstimate(parsed);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.selectedBrand === "string" && parsed.selectedBrand in BRAND_INFO) {
            setSelectedBrand(parsed.selectedBrand as keyof typeof BRAND_INFO);
          } else if (typeof parsed.brand === "string" && parsed.brand in BRAND_INFO) {
            setSelectedBrand(parsed.brand as keyof typeof BRAND_INFO);
          }
          const { selectedBrand: parsedBrand, brand, ...rest } = parsed;
          setEstimatorInput((prev) => ({ ...prev, ...rest }));
        }
      } catch {}
    }
  }, [params]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  }

  const estimatorEstimate = useEstimate(estimatorInput);
  const estimate = useMemo(() => {
    if (rooms.length === 0) {
      return estimatorEstimate;
    }

    const totalWallArea = rooms.reduce((sum, room) => {
      const l = room.length ?? 4;
      const w = room.width ?? 3.5;
      const h = room.height ?? 2.4;
      const perimeter = 2 * (l + w);
      const wallArea = perimeter * h;
      return sum + wallArea;
    }, 0);

    const totalCoats = rooms.reduce((sum, room) => sum + (room.coats ?? 1), 0);
    const openings = estimatorInput.openings;
    const openingArea = estimatorInput.openingArea;
    const subtract = openings * openingArea;
    const netWallArea = Math.max(0, totalWallArea - subtract);

    const coverage = estimatorInput.coverage;
    const pricePerLitre = estimatorInput.pricePerLitre;
    const paintType = estimatorInput.paintType;

    const perCoat = netWallArea / Math.max(0.1, coverage);
    const litres = Math.round(perCoat * totalCoats * 10) / 10;
    const materialCost = Math.round(litres * pricePerLitre);

    const brandEstimates = Object.entries(BRAND_INFO).map(([name, info]) => {
      const { coverage: brandCoverage, pricePerLitre: brandPrice } = info[paintType];
      const perCoatBrand = netWallArea / brandCoverage;
      const litresBrand = Math.round(perCoatBrand * totalCoats * 10) / 10;
      const costBrand = Math.round(litresBrand * brandPrice);
      return { name, coverage: brandCoverage, pricePerLitre: brandPrice, litres: litresBrand, cost: costBrand };
    });

    return { wallArea: netWallArea, litres, materialCost, brandEstimates };
  }, [rooms, estimatorInput, estimatorEstimate]);

  const estimatedBudget = useMemo(() => {
    if (typeof budgetMax === "number" && budgetMax > 0) return budgetMax;
    if (typeof budgetMin === "number" && budgetMin > 0) return budgetMin;
    if (attachedEstimate?.materialCost) {
      return Math.round(Math.max(attachedEstimate.materialCost * 2.2, attachedEstimate.materialCost + 200));
    }
    return Math.round(Math.max(estimate.materialCost * 2.2, estimate.materialCost + 200));
  }, [budgetMin, budgetMax, attachedEstimate, estimate.materialCost]);

  const escrowFeeEstimate = useMemo(() => {
    if (!useEscrow) return 0;
    return Math.max(10, Math.round(estimatedBudget * 0.025));
  }, [useEscrow, estimatedBudget]);

  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;
  const schemaStep1 = z.object({
    jobType: z.string().min(1, "Select a job type"),
    desc: z.string().min(10, "Add at least 10 characters"),
  });
  const schemaStep2 = z
    .object({
      budgetMin: z.number().min(0),
      budgetMax: z.number().min(0),
      postcode: z.string().regex(ukPostcode, "Enter a valid UK postcode (e.g. SW1A 1AA)"),
    })
    .refine(
      (v) => (typeof v.budgetMin === "number" && typeof v.budgetMax === "number" ? v.budgetMax >= v.budgetMin : false),
      { message: "Max must be greater than min", path: ["budgetMax"] }
    );
  const schemaStep3 = z.object({
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone"),
  });

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const r = schemaStep1.safeParse({ jobType, desc });
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const r = schemaStep2.safeParse({ budgetMin: budgetMin || 0, budgetMax: budgetMax || 0, postcode });
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }
    setErrors({});
    setStep(3);
  }

  function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setStep(4);
  }

  async function handleStep4(e: React.FormEvent) {
    e.preventDefault();
    const r = schemaStep3.safeParse({ email, phone });
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[i.path[0] as string] = i.message));
      setErrors(e);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { toast } = await import("sonner");
        toast.error("Please sign in to post a job");
        navigate("/login");
        return;
      }
      const token = session.access_token;

      const estimatePayload = attachedEstimate
        ? { ...attachedEstimate, brand: attachedEstimate.brand ?? selectedBrand }
        : { ...estimatorInput, ...estimate, brand: selectedBrand };

      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobType,
          title: desc || `${jobType} painting job`,
          description: desc,
          postcode,
          budgetMin: budgetMin || undefined,
          budgetMax: budgetMax || undefined,
          images: images.slice(0, 5),
          paintBrand: estimatePayload.brand,
          rooms: rooms.length > 0 ? rooms : undefined,
          estimatedMaterialCost: estimatePayload.materialCost,
          estimatedLitres: estimatePayload.litres,
          estimatedWallArea: estimatePayload.totalWallArea,
          useEscrow,
          customerEmail: email,
          customerPhone: phone,
        }),
      });

      if (!jobResponse.ok) {
        const error = await jobResponse.json();
        const { toast } = await import("sonner");
        toast.error(error.error || "Failed to post job");
        return;
      }

      const { toast } = await import("sonner");
      toast.success("Job posted successfully!");

      const qs = prePainter ? `?mode=quote&painter=${encodeURIComponent(prePainter)}` : "";
      navigate(`/post-job/confirmation${qs}`);
    } catch (error) {
      console.error("Error posting job:", error);
      const { toast } = await import("sonner");
      toast.error("Failed to post job. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "bg-foreground" : "bg-border"}`} />
            ))}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            {step === 1 && "Post a Job"}
            {step === 2 && "Set your budget"}
            {step === 3 && "Payment & escrow"}
            {step === 4 && "Your details"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {step === 1 && "Tell us about the painting work"}
            {step === 2 && "Set budget and location"}
            {step === 3 && "Choose how you'd like to pay"}
            {step === 4 && "Let's finalize your job"}
          </p>

          {Object.keys(errors).length > 0 && (
            <div className="mb-6 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {Object.values(errors)[0]}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Job type</label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="kitchen">Kitchen cabinets</SelectItem>
                    <SelectItem value="wallpaper">Wallpaper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Description</label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Share details for accurate quotes"
                  className="w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Upload photos</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFiles}
                  className="hidden"
                />
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

              <button type="submit" className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Budget min (£)</label>
                <input
                  type="number"
                  min={0}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : "")}
                  className={fieldClass}
                  placeholder="e.g. £500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Budget max (£)</label>
                <input
                  type="number"
                  min={0}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : "")}
                  className={fieldClass}
                  placeholder="e.g. £2,000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Postcode</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. SW1A 1AA"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                >
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
              <div className="border border-border rounded-lg p-4 bg-accent/20 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">Escrow protection</h3>
                    <p className="text-xs text-muted-foreground mt-1">Your funds are held securely by Stripe until you approve the work.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Enabled</span>
                    <Switch checked={useEscrow} onCheckedChange={setUseEscrow} />
                  </div>
                </div>

                {useEscrow && (
                  <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                    Escrow fee: £{escrowFeeEstimate.toLocaleString("en-GB")} (approx. 2.5%)
                  </div>
                )}
              </div>

              <div className="bg-accent/10 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  {useEscrow
                    ? `Your job total will be approx. £${Math.round(estimatedBudget).toLocaleString("en-GB")} + £${escrowFeeEstimate.toLocaleString("en-GB")} escrow fee.`
                    : "Payment will be arranged directly with the painter."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                >
                  Back
                </button>
                <button type="submit" className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <form onSubmit={handleStep4} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                  placeholder="+44 7700 000000"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Post Job
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need a painter?{" "}
            <a href="/find-painter" className="text-foreground font-medium hover:underline underline-offset-4">
              Browse painters
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export function PostJobConfirmation() {
  type PendingSignup = {
    jobId: string;
    email: string;
    phone?: string;
    postcode?: string;
    jobType?: string;
    painter?: string | null;
    createdAt?: string;
    status?: "pending" | "completed" | "dismissed";
  };

  const navigate = useNavigate();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const isQuote = mode === "quote";

  const [pending, setPending] = useState<PendingSignup | null>(() => {
    try {
      const raw = localStorage.getItem("paintbook:pendingCustomerSignup");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === "string") {
        return parsed as PendingSignup;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signupCompleted, setSignupCompleted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (pending) {
      setCustomerPhone(pending.phone || "");
      setCustomerLocation(pending.postcode || "");
    }
  }, [pending]);

  useEffect(() => {
    if (!pending?.email) {
      setShowSignupPrompt(false);
      return;
    }
    if (pending.status === "completed") {
      setSignupCompleted(true);
      setShowSignupPrompt(false);
    } else if (pending.status !== "dismissed") {
      setSignupCompleted(false);
      setShowSignupPrompt(true);
    } else {
      setSignupCompleted(false);
    }
  }, [pending?.email, pending?.status]);

  const jobSummary = pending
    ? `${pending.jobType || "paint"} job${pending.postcode ? ` near ${pending.postcode}` : ""}`
    : "";

  function handleDismissSignup() {
    if (!pending) return;
    const next = {
      ...pending,
      status: "dismissed",
      dismissedAt: new Date().toISOString(),
    } as PendingSignup;
    try {
      localStorage.setItem("paintbook:pendingCustomerSignup", JSON.stringify(next));
    } catch {}
    setPending(next);
    setShowSignupPrompt(false);
  }

  function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!pending?.email) return;
    setFormError(null);
    if (!fullName.trim()) {
      setFormError("Enter your full name.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords must match.");
      return;
    }

    supabase.auth.signUp({ email: pending.email, password });

    const profile = {
      name: fullName.trim(),
      phone: customerPhone.trim() || pending.phone || "",
      location: customerLocation.trim() || pending.postcode || "",
    };
    try {
      localStorage.setItem("paintbook:customerProfile", JSON.stringify(profile));
    } catch {}
    try {
      localStorage.setItem(
        "paintbook:customerMembership",
        JSON.stringify({
          plan: "Free",
          status: "active",
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {}

    const completed = {
      ...pending,
      status: "completed",
      completedAt: new Date().toISOString(),
    } as PendingSignup;
    try {
      localStorage.setItem("paintbook:pendingCustomerSignup", JSON.stringify(completed));
    } catch {}
    sessionStorage.setItem("paintbook:lastSignUpNotice", "customer");

    setPending(completed);
    setSignupCompleted(true);
    setShowSignupPrompt(false);
    setDialogOpen(false);

    toast({
      title: "Customer sign-up complete",
      description: "Your free dashboard is ready. Manage jobs, quotes, and payments in one place.",
    });
    navigate("/dashboard/customer");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold">
            {isQuote ? "Request sent" : "Your job is live"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isQuote
              ? "We've sent your job details to the painter. We'll notify you as soon as they respond."
              : "We've notified nearby painters. You'll receive messages and quotes shortly."}
          </p>

          {signupCompleted && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              Your customer account is ready. Head to your dashboard to manage your job.
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <button onClick={() => navigate("/find-painter")} className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors">
              Find A Painter
            </button>
            <button onClick={() => navigate("/estimator")} className="w-full border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors">
              View Estimator
            </button>
          </div>

          {showSignupPrompt && pending && (
            <div className="mt-8 rounded-lg border border-border p-4 text-left space-y-4">
              <h2 className="text-sm font-semibold">Create a free account</h2>
              <p className="text-xs text-muted-foreground">Set a password to manage your job, quotes, and messages in one dashboard.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDialogOpen(true)}
                  className="flex-1 bg-foreground text-background py-2 rounded text-xs font-medium hover:bg-foreground/90 transition-colors"
                >
                  Create account
                </button>
                <button
                  onClick={handleDismissSignup}
                  className="flex-1 border border-border py-2 rounded text-xs font-medium hover:bg-accent transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create your account</DialogTitle>
            <DialogDescription>Set up your free customer dashboard</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateAccount}>
            <div>
              <Label className="text-xs uppercase tracking-wider">Full name</Label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${fieldClass} mt-1`}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Phone</Label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={`${fieldClass} mt-1`}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Location</Label>
              <input
                type="text"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                className={`${fieldClass} mt-1`}
                placeholder="e.g. SW1A 1AA"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Password</Label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} mt-1`}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Confirm password</Label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${fieldClass} mt-1`}
                placeholder="Repeat password"
              />
            </div>
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="flex-1 border border-border py-2 rounded text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-foreground text-background py-2 rounded text-sm font-medium hover:bg-foreground/90 transition-colors">
                Create account
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
