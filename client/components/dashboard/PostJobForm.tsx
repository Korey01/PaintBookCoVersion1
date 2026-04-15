import { useState, useEffect } from "react";
import { supabase, MaterialsArrangement } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Loader2 } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const JOB_TYPES = [
  "Interior Painting",
  "Exterior Painting",
  "Wallpapering",
  "Feature Wall",
  "TV / Media Wall",
  "Commercial Painting",
  "Full Interior Refurbishment",
  "Full Exterior Refurbishment",
  "New Build Decoration",
  "Landlord Refresh",
  "Specialist / Other",
];

const MATERIALS_OPTIONS: {
  value: MaterialsArrangement;
  label: string;
  description: string;
}[] = [
  {
    value: "customer_provides",
    label: "I provide materials",
    description: "You purchase and supply all paint and materials.",
  },
  {
    value: "painter_purchases",
    label: "Painter purchases on my behalf",
    description: "Painter buys materials; cost is added to the job total.",
  },
  {
    value: "platform",
    label: "Via PaintBookCo platform",
    description:
      "Materials ordered through PaintBookCo; cost included in payment.",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface PostJobFormProps {
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PostJobForm({ onSuccess }: PostJobFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vestimator
  const [usedVestimator, setUsedVestimator] = useState(false);
  const [vestimatorEstimate, setVestimatorEstimate] = useState<number | null>(null);
  const [vestimatorAvailable, setVestimatorAvailable] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [materials, setMaterials] = useState<MaterialsArrangement>("customer_provides");

  // Silently check for vestimator_results table
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("vestimator_results")
        .select("estimated_cost")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setVestimatorAvailable(true);
        setVestimatorEstimate(data[0].estimated_cost ?? null);
      } else if (!error) {
        // Table exists but no results
        setVestimatorAvailable(true);
      }
      // If error (table doesn't exist) => vestimatorAvailable stays false
    })();
  }, []);

  function handleVestimatorToggle(checked: boolean) {
    setUsedVestimator(checked);
    if (checked && vestimatorEstimate != null) {
      setBudget(String(vestimatorEstimate));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Job title is required."); return; }
    if (!type) { setError("Please select a job type."); return; }
    if (!address.trim()) { setError("Property address is required."); return; }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be signed in to post a job.");

      const { error: insertError } = await supabase.from("jobs").insert({
        customer_id: session.user.id,
        title: title.trim(),
        type,
        description: description.trim() || null,
        property_address: address.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget ? parseFloat(budget) : null,
        materials_arrangement: materials,
        vestimator_estimate: usedVestimator ? vestimatorEstimate : null,
        status: "pending_match",
      });

      if (insertError) throw new Error(insertError.message);

      // Geocode the job postcode for matching engine
      const postcodeMatch = address.trim().match(/[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}/i);
      if (postcodeMatch) {
        const { data: newJob } = await supabase
          .from("jobs")
          .select("id")
          .eq("customer_id", session.user.id)
          .eq("status", "pending_match")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (newJob) {
          try {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocode-postcode`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${session.access_token}`,
                  "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                  postcode: postcodeMatch[0],
                  job_id: newJob.id,
                }),
              }
            );
          } catch (geoErr) {
            console.error("Geocoding failed:", geoErr);
          }
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError((err as Error).message ?? "Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-4 text-center"
        style={{ fontFamily: "Arial, system-ui, sans-serif" }}
      >
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h3 className="text-xl font-semibold" style={{ color: "#1B3A5C" }}>
          Job Posted Successfully!
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          We're matching you with verified painters in your area. You'll be
          notified as soon as a painter accepts your job.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto"
      style={{ fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <h2 className="text-xl font-semibold mb-6" style={{ color: "#1B3A5C" }}>
        Post a New Job
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. Living room repaint — 3-bed semi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Job type */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Job Type <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={setType} value={type}>
            <SelectTrigger>
              <SelectValue placeholder="Select job type…" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the work required, room sizes, surface conditions, colour preferences…"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
          />
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Property Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Street, City, Postcode"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Preferred Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Preferred End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Paint Vestimator integration */}
        {vestimatorAvailable && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-1">
              <Label className="text-sm font-semibold" style={{ color: "#2E75B6" }}>
                Did you use our Paint Vestimator?
              </Label>
              <Switch
                checked={usedVestimator}
                onCheckedChange={handleVestimatorToggle}
              />
            </div>
            {usedVestimator && vestimatorEstimate != null && (
              <div className="mt-2 text-sm text-blue-700">
                Estimated value from Vestimator:{" "}
                <strong>
                  £
                  {vestimatorEstimate.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
                <span className="text-blue-500 ml-2">(pre-filled below)</span>
              </div>
            )}
          </div>
        )}

        {/* Budget */}
        <div>
          <Label htmlFor="budget" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Budget Estimate (£)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              £
            </span>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="pl-7"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        {/* Materials arrangement */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Materials Arrangement
          </Label>
          <RadioGroup
            value={materials}
            onValueChange={(v) => setMaterials(v as MaterialsArrangement)}
            className="flex flex-col gap-3"
          >
            {MATERIALS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={opt.value}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  materials === opt.value
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={opt.value}
                  id={opt.value}
                  className="mt-0.5 flex-shrink-0"
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#1B3A5C" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 text-white font-semibold py-2.5"
          style={{ backgroundColor: "#1B3A5C" }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting job…
            </span>
          ) : (
            "Post Job"
          )}
        </Button>
      </div>
    </form>
  );
}
