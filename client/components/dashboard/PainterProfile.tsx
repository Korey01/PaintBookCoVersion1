import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera, Upload, Trash2, AlertTriangle, Lock,
  Loader2, CheckCircle2, GripVertical,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

// ── Constants ─────────────────────────────────────────────────

const SPECIALISMS = [
  "Interior Painting", "Exterior Painting", "Wallpapering",
  "Feature Wall", "TV / Media Wall", "Commercial Painting",
  "Full Interior Refurbishment", "Full Exterior Refurbishment",
  "New Build Decoration", "Landlord Refresh", "Specialist / Other",
];

// ── Types ─────────────────────────────────────────────────────

interface PainterRecord {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  bio: string | null;
  specialisms: string[];
  service_radius_km: number;
  insurance_expiry: string | null;
  insurance_insurer: string | null;
  insurance_policy_no: string | null;
  bank_account_holder: string | null;
  bank_sort_code: string | null;
  bank_account_number: string | null;
  transpact_seller_id: string | null;
}

interface PainterProfileProps {
  painter: PainterRecord;
  onSaved: (updated: Partial<PainterRecord>) => void;
}

// ── Component ─────────────────────────────────────────────────

export default function PainterProfile({ painter, onSaved }: PainterProfileProps) {
  // Profile fields
  const [firstName,   setFirstName]   = useState(painter.first_name ?? "");
  const [lastName,    setLastName]    = useState(painter.last_name ?? "");
  const [phone,       setPhone]       = useState(painter.phone ?? "");
  const [bio,         setBio]         = useState(painter.bio ?? "");
  const [specialisms, setSpecialisms] = useState<string[]>(painter.specialisms ?? []);
  const [radius,      setRadius]      = useState(painter.service_radius_km ?? 10);

  // Insurance
  const [insurer,      setInsurer]      = useState(painter.insurance_insurer ?? "");
  const [policyNo,     setPolicyNo]     = useState(painter.insurance_policy_no ?? "");
  const [insuranceExp, setInsuranceExp] = useState(painter.insurance_expiry ?? "");

  // Bank details
  const [bankHolder,  setBankHolder]  = useState(painter.bank_account_holder ?? "");
  const [sortCode,    setSortCode]    = useState(painter.bank_sort_code ?? "");
  const [accountNo,   setAccountNo]   = useState(painter.bank_account_number ?? "");

  // Portfolio
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [uploading,      setUploading]    = useState(false);

  // Insurance cert
  const [certUploading, setCertUploading] = useState(false);
  const [certUrl,       setCertUrl]       = useState<string | null>(null);

  // Profile photo
  const [photoUrl,     setPhotoUrl]     = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const portfolioRef = useRef<HTMLInputElement>(null);
  const certRef      = useRef<HTMLInputElement>(null);
  const photoRef     = useRef<HTMLInputElement>(null);

  // Insurance expiry warning
  const insuranceWarning = insuranceExp
    ? differenceInDays(parseISO(insuranceExp), new Date()) <= 30
    : false;

  // ── Helpers ─────────────────────────────────────────────────

  function toggleSpecialism(s: string) {
    setSpecialisms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    setSaved(false);
  }

  function formatSortCode(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    return digits.replace(/(\d{2})(?=\d)/g, "$1-").slice(0, 8);
  }

  // ── Photo upload ─────────────────────────────────────────────

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const path = `${painter.user_id}/profile.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("painter-portfolios").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("painter-portfolios").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    }
    setPhotoUploading(false);
  }

  // ── Portfolio upload ──────────────────────────────────────────

  async function uploadPortfolioImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (portfolioUrls.length + files.length > 10) {
      setError("Maximum 10 portfolio images allowed.");
      return;
    }
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of files) {
      const path = `${painter.user_id}/portfolio/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("painter-portfolios").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("painter-portfolios").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }
    setPortfolioUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
    setSaved(false);
  }

  function removePortfolioImage(url: string) {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
    setSaved(false);
  }

  // ── Insurance cert upload ─────────────────────────────────────

  async function uploadCert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertUploading(true);
    const path = `${painter.user_id}/insurance-cert.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("painter-insurance").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("painter-insurance").getPublicUrl(path);
      setCertUrl(data.publicUrl);
    }
    setCertUploading(false);
  }

  // ── Save ──────────────────────────────────────────────────────

  async function saveProfile() {
    setError(null);
    setSaving(true);
    try {
      const updates: Partial<PainterRecord> = {
        first_name: firstName.trim() || null,
        last_name:  lastName.trim()  || null,
        phone:      phone.trim()     || null,
        bio:        bio.trim()       || null,
        specialisms,
        service_radius_km: radius,
        insurance_insurer:   insurer.trim()   || null,
        insurance_policy_no: policyNo.trim()  || null,
        insurance_expiry:    insuranceExp      || null,
        bank_account_holder: bankHolder.trim() || null,
        bank_sort_code:      sortCode          || null,
        bank_account_number: accountNo.trim()  || null,
      };

      const { error: updateError } = await supabase
        .from("painters")
        .update(updates)
        .eq("id", painter.id);

      if (updateError) throw new Error(updateError.message);
      setSaved(true);
      onSaved(updates);
    } catch (err) {
      setError((err as Error).message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }} className="max-w-2xl">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Profile Photo ──────────────────────────────────── */}
      <Section title="Profile Photo">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            <Button size="sm" variant="outline" onClick={() => photoRef.current?.click()} disabled={photoUploading} className="text-xs gap-1.5 border-gray-300">
              {photoUploading ? <><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</> : <><Upload className="h-3 w-3" /> Upload Photo</>}
            </Button>
            <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
          </div>
        </div>
      </Section>

      {/* ── Personal Info ──────────────────────────────────── */}
      <Section title="Personal Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <Input value={firstName} onChange={(e) => { setFirstName(e.target.value); setSaved(false); }} placeholder="John" />
          </Field>
          <Field label="Last Name">
            <Input value={lastName} onChange={(e) => { setLastName(e.target.value); setSaved(false); }} placeholder="Smith" />
          </Field>
        </div>
        <Field label="Phone Number">
          <Input value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} placeholder="+44 7700 900000" />
        </Field>
        <Field label={`Bio / Description (${bio.length}/500)`}>
          <Textarea
            value={bio}
            onChange={(e) => { if (e.target.value.length <= 500) { setBio(e.target.value); setSaved(false); } }}
            rows={4}
            placeholder="Tell customers about your experience, specialisms, and approach to work…"
            className="resize-none"
          />
        </Field>
      </Section>

      {/* ── Specialisms ────────────────────────────────────── */}
      <Section title="Specialisms">
        <div className="grid grid-cols-2 gap-2">
          {SPECIALISMS.map((s) => (
            <label key={s} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${specialisms.includes(s) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <input type="checkbox" checked={specialisms.includes(s)} onChange={() => toggleSpecialism(s)} className="flex-shrink-0" />
              <span className="text-xs text-gray-700">{s}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Service Radius ─────────────────────────────────── */}
      <Section title="Service Radius">
        <div className="flex items-center gap-4">
          <input
            type="range" min={5} max={50} step={5} value={radius}
            onChange={(e) => { setRadius(Number(e.target.value)); setSaved(false); }}
            className="flex-1"
          />
          <span className="text-sm font-bold w-16 text-right" style={{ color: "#1B3A5C" }}>
            {radius} km
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Affects which jobs our matching engine sends to you. 5 km minimum, 50 km maximum.
        </p>
      </Section>

      {/* ── Portfolio ──────────────────────────────────────── */}
      <Section title={`Portfolio (${portfolioUrls.length}/10)`}>
        {portfolioUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {portfolioUrls.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePortfolioImage(url)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {portfolioUrls.length < 10 && (
          <>
            <input ref={portfolioRef} type="file" accept="image/*" multiple className="hidden" onChange={uploadPortfolioImages} />
            <Button size="sm" variant="outline" onClick={() => portfolioRef.current?.click()} disabled={uploading} className="text-xs gap-1.5 border-gray-300">
              {uploading ? <><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</> : <><Upload className="h-3 w-3" /> Upload Images</>}
            </Button>
          </>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Upload images of your completed work. Maximum 10 images. All images must be genuine work completed by you.
        </p>
      </Section>

      {/* ── Insurance ──────────────────────────────────────── */}
      <Section title="Insurance">
        {insuranceWarning && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-3 text-xs text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
            Your insurance expires soon. Update your certificate to keep your account active.
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Insurer Name">
            <Input value={insurer} onChange={(e) => { setInsurer(e.target.value); setSaved(false); }} placeholder="Aviva, AXA, etc." />
          </Field>
          <Field label="Policy Number">
            <Input value={policyNo} onChange={(e) => { setPolicyNo(e.target.value); setSaved(false); }} placeholder="POL-123456" />
          </Field>
        </div>
        <Field label="Expiry Date">
          <Input type="date" value={insuranceExp} onChange={(e) => { setInsuranceExp(e.target.value); setSaved(false); }} />
        </Field>
        <div className="mt-2">
          <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={uploadCert} />
          <Button size="sm" variant="outline" onClick={() => certRef.current?.click()} disabled={certUploading} className="text-xs gap-1.5 border-gray-300">
            {certUploading ? <><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</> : <><Upload className="h-3 w-3" /> Upload Certificate</>}
          </Button>
          {certUrl && <span className="text-xs text-green-600 ml-2">Certificate uploaded ✓</span>}
        </div>
      </Section>

      {/* ── Bank Details ────────────────────────────────────── */}
      <Section title="Bank Details">
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-3 text-xs text-gray-600">
          <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
          Your bank details are encrypted and only used for Transpact payouts.
        </div>
        <Field label="Account Holder Name">
          <Input value={bankHolder} onChange={(e) => { setBankHolder(e.target.value); setSaved(false); }} placeholder="John Smith" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sort Code (XX-XX-XX)">
            <Input
              value={sortCode}
              onChange={(e) => { setSortCode(formatSortCode(e.target.value)); setSaved(false); }}
              placeholder="00-00-00"
              maxLength={8}
            />
          </Field>
          <Field label="Account Number (8 digits)">
            <Input
              value={accountNo}
              onChange={(e) => { setAccountNo(e.target.value.replace(/\D/g, "").slice(0, 8)); setSaved(false); }}
              placeholder="12345678"
              maxLength={8}
            />
          </Field>
        </div>
        {painter.transpact_seller_id ? (
          <Field label="Transpact Seller ID">
            <Input value={painter.transpact_seller_id} readOnly className="bg-gray-50 text-gray-500" />
          </Field>
        ) : (
          <p className="text-xs text-gray-400 mt-2">
            Transpact Seller ID will appear here once Transpact onboarding is complete.
          </p>
        )}
      </Section>

      {/* ── Save button ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-2">
        <Button onClick={saveProfile} disabled={saving} className="text-white" style={{ backgroundColor: "#1B3A5C" }}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving…</> : "Save Profile"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-gray-100 last:border-0">
      <h3 className="text-sm font-semibold mb-3" style={{ color: "#1B3A5C" }}>{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
