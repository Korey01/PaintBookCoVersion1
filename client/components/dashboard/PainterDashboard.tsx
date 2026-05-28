// Required migration: ALTER TABLE painters ADD COLUMN IF NOT EXISTS profile_picture_url text;

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PaintBookChat } from "@/components/chat/PaintBookChat";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Briefcase,
  Image,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Download,
  Trash2,
  Upload,
  Shield,
  MessageSquare,
  X,
  Star,
  Camera,
} from "lucide-react";

function InsuranceUploadForm({ painter, onSuccess }: { painter: any, onSuccess: () => void }) {
  const [form, setForm] = useState({
    insurance_company: "",
    insurance_policy_number: "",
    insurance_policy_details: "",
    insurance_expiry_date: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState("")
  const [certificateSize, setCertificateSize] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // text-base (16px) prevents iOS Safari from auto-zooming on focus
  const fieldClass = "w-full border-b border-border bg-transparent text-base text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200"
  const labelClass = "block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1"

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(selected.type)) { setError("Only PDF, JPG and PNG files are accepted."); return }
    if (selected.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return }
    setError("")
    setFile(selected)
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError("Session expired. Please log in again."); setFile(null); setUploading(false); return }
      const fileExt = selected.name.split(".").pop()
      const path = `${painter.id}/${Date.now()}_insurance.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("painter-insurance")
        .upload(path, selected, { upsert: true })
      if (uploadError) { setError(`Upload failed: ${uploadError.message}`); setFile(null); setUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from("painter-insurance").getPublicUrl(path)
      setCertificateUrl(publicUrl)
      setCertificateSize(selected.size)
    } catch (err) { console.error("Insurance file upload error:", err); setError("Upload failed. Please try again."); setFile(null) }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!form.insurance_company) { setError("Insurance company is required."); return }
    if (!form.insurance_policy_number) { setError("Policy number is required."); return }
    if (!form.insurance_expiry_date) { setError("Expiry date is required."); return }
    if (!certificateUrl) { setError("Please upload your insurance certificate."); return }
    const expiry = new Date(form.insurance_expiry_date)
    if (expiry <= new Date()) { setError("Your insurance has expired. Please renew before applying."); return }
    setSubmitting(true)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError("Session expired. Please log in again."); setSubmitting(false); return }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-insurance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            insurance_company: form.insurance_company,
            insurance_policy_number: form.insurance_policy_number,
            insurance_policy_details: form.insurance_policy_details || "Not provided",
            insurance_expiry_date: form.insurance_expiry_date,
            insurance_certificate_url: certificateUrl,
            certificate_size_bytes: certificateSize,
          })
        }
      )
      const result = await res.json()
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || "Submission failed. Please try again.")
      }
    } catch (err) { console.error("Insurance submit error:", err); setError("An unexpected error occurred.") }
    setSubmitting(false)
  }

  return (
    <div className="space-y-5">
      <div className="border-l-2 border-amber-500/50 pl-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          You must hold valid public liability insurance of at least £2,000,000.
          Your certificate will be verified by our team before your account is activated.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <label className={labelClass}>Insurance Company *</label>
        <input type="text" value={form.insurance_company}
          onChange={e => setForm(f => ({ ...f, insurance_company: e.target.value }))}
          placeholder="e.g. Aviva, AXA" className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Policy Number *</label>
        <input type="text" value={form.insurance_policy_number}
          onChange={e => setForm(f => ({ ...f, insurance_policy_number: e.target.value }))}
          placeholder="e.g. PLI-123456" className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Policy Details</label>
        <textarea value={form.insurance_policy_details}
          onChange={e => setForm(f => ({ ...f, insurance_policy_details: e.target.value }))}
          placeholder="Coverage description (optional)" rows={2}
          className="w-full border-b border-border bg-transparent text-base text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200 resize-none" />
      </div>
      <div>
        <label className={labelClass}>Expiry Date *</label>
        <input type="date" value={form.insurance_expiry_date}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => setForm(f => ({ ...f, insurance_expiry_date: e.target.value }))}
          className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Certificate (PDF/JPG/PNG — max 5MB) *</label>
        {!file ? (
          <label className="block cursor-pointer mt-2">
            <div className="border border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/40 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload certificate</p>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
          </label>
        ) : (
          <div className="border border-border rounded-lg p-3 mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className={`text-xs mt-0.5 ${file.size > 5242880 ? "text-destructive" : "text-muted-foreground"}`}>
                {(file.size / 1048576).toFixed(2)} MB / 5 MB max
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {uploading ? (
                <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : certificateUrl ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : null}
              <button onClick={() => { setFile(null); setCertificateUrl("") }}
                className="text-muted-foreground hover:text-foreground text-xs min-h-[44px] px-2">Remove</button>
            </div>
          </div>
        )}
        {certificateUrl && !uploading && (
          <p className="text-xs text-green-400 mt-1">✓ Certificate uploaded successfully</p>
        )}
      </div>
      <button onClick={handleSubmit} disabled={submitting || uploading || !certificateUrl}
        className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]">
        {submitting ? (
          <><div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Submitting...</>
        ) : (
          <><Shield className="h-4 w-4" /> Submit Insurance</>
        )}
      </button>
    </div>
  )
}

class InsuranceBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-destructive/40 rounded-lg p-4">
          <p className="text-destructive text-sm">
            Insurance form failed to load. Please refresh the page and try again.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

function NotificationsTab({ painter, supabase }: { painter: any; supabase: any }) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("painter_id", painter.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    };
    if (painter?.id) load();
  }, [painter?.id]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("painter_id", painter.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors">
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="bg-accent/10 border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`border rounded-xl p-4 cursor-pointer transition-colors ${n.read ? "border-border bg-background" : "border-primary/30 bg-primary/5"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${n.read ? "text-foreground" : "text-primary"}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvailableJobsTab({
  painter,
  supabase,
  onTabChange,
}: {
  painter: any;
  supabase: any;
  onTabChange: (tab: string) => void;
}) {
  const navigate = useNavigate()
  const [jobs, setJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [passedJobs, setPassedJobs] = React.useState<string[]>([])
  const [chatting, setChatting] = React.useState<string | null>(null)
  const [chatError, setChatError] = React.useState("")

  React.useEffect(() => {
    if (painter?.is_active) loadJobs()
    else setLoading(false)
  }, [painter?.id])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("sessions")
        .select("id, job_type, postcode, rooms, job_description, has_structural_defects, created_at, status")
        .eq("status", "job_posted")
        .or("converted_to_transaction.is.null,converted_to_transaction.eq.false")
        .order("created_at", { ascending: false })
        .limit(20)
      setJobs((data || []).filter((j: any) => !passedJobs.includes(j.id)))
    } catch (err) {
      console.error("Failed to load jobs:", err)
    }
    setLoading(false)
  }

  const handlePass = (jobId: string) => {
    setPassedJobs(prev => [...prev, jobId])
    setJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const handleChat = async (job: any) => {
    setChatting(job.id)
    setChatError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setChatError("Session expired. Please log in again.")
        setChatting(null)
        return
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ session_id: job.id, painter_id: painter.id })
        }
      )
      const result = await res.json()
      if (result.success) {
        onTabChange("my-jobs")
      } else {
        setChatError(result.error || "Failed to start chat. Please try again.")
      }
    } catch {
      setChatError("Failed to start chat. Please try again.")
    }
    setChatting(null)
  }

  if (!painter?.is_active) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Available Jobs</h1>
          <p className="text-muted-foreground text-sm">Jobs near you looking for painters</p>
        </div>
        <div className="border border-border rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">🔒</div>
          <p className="font-medium">Complete your profile to unlock jobs</p>
          <p className="text-sm text-muted-foreground">
            You need KYC approval, insurance verification and account activation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Available Jobs</h1>
          <p className="text-muted-foreground text-sm">Jobs near you looking for painters</p>
        </div>
        <button onClick={loadJobs}
          className="text-sm border border-border px-3 py-1.5 rounded hover:bg-accent transition-colors">
          Refresh
        </button>
      </div>

      {chatError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center justify-between gap-2">
          <p className="text-sm text-destructive">{chatError}</p>
          <button onClick={() => setChatError("")} className="text-destructive/70 hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center space-y-2">
          <p className="font-medium">No jobs available right now</p>
          <p className="text-sm text-muted-foreground">
            New jobs near {painter.postcode} will appear here automatically.
          </p>
        </div>
      ) : jobs.map(job => (
        <div key={job.id} className="border border-border rounded-xl p-5 space-y-4 hover:border-foreground/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{job.job_type}</span>
                {job.has_structural_defects && (
                  <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded">
                    ⚠️ Structural issues
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                📍 {job.postcode?.split(" ")[0] || "Unknown area"}
              </p>
              <p className="text-sm text-muted-foreground">
                🏠 {job.rooms?.length || 0} room{(job.rooms?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(job.created_at).toLocaleDateString("en-GB")}
            </span>
          </div>
          {job.job_description && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3 line-clamp-2">
              {job.job_description.slice(0, 120)}{job.job_description.length > 120 ? "..." : ""}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleChat(job)}
              disabled={chatting === job.id}
              className="flex-1 bg-foreground text-background py-2.5 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {chatting === job.id ? (
                <><div className="h-3.5 w-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Connecting...</>
              ) : "💬 Chat with Customer"}
            </button>
            <button
              onClick={() => handlePass(job.id)}
              className="px-4 py-2.5 border border-border text-muted-foreground rounded-md text-sm hover:bg-accent transition-colors"
            >
              Pass
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}


function GalleryTab({ painter, supabase, onRefresh }: { painter: any, supabase: any, onRefresh: () => void }) {
  const [images, setImages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  const maxBytes = 104857600 // 100MB
  const usedBytes = painter?.gallery_size_bytes || 0

  React.useEffect(() => { loadImages() }, [painter?.id])

  const loadImages = async () => {
    if (!painter?.id) return
    setLoading(true)
    const { data } = await supabase
      .from("painter_gallery")
      .select("*")
      .eq("painter_id", painter.id)
      .order("uploaded_at", { ascending: false })
    setImages(data || [])
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const allowed = ["image/jpeg","image/png","image/webp"]
    const invalid = files.filter(f => !allowed.includes(f.type))
    if (invalid.length) { setError("Only JPG, PNG and WebP images are accepted"); return }
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (usedBytes + totalSize > maxBytes) { setError("Gallery full — delete some images first"); return }
    setUploading(true)
    setError("")
    let newUsedBytes = usedBytes
    try {
      for (const file of files) {
        try {
          const compressed = await compressImage(file)
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${painter.id}/${Date.now()}_${sanitizedName}`
          const { error: uploadErr } = await supabase.storage
            .from("painter-gallery")
            .upload(path, compressed, { upsert: false })
          if (uploadErr) { setError(`Upload failed: ${uploadErr.message} (${uploadErr.statusCode})`); setUploading(false); return }
          const { data: { publicUrl } } = supabase.storage.from("painter-gallery").getPublicUrl(path)
          await supabase.from("painter_gallery").insert({
            painter_id: painter.id,
            image_url: publicUrl,
            image_size_bytes: compressed.size,
            caption: "",
            job_type: "",
            uploaded_at: new Date().toISOString()
          })
          newUsedBytes += compressed.size
        } catch (err: any) {
          setError(err.message || `Upload failed`)
          setUploading(false)
          return
        }
      }
      await supabase.from("painters").update({
        gallery_size_bytes: newUsedBytes
      }).eq("id", painter.id)
      await loadImages()
      onRefresh()
    } catch (err: any) { setError(err.message || "Upload failed") }
    setUploading(false)
  }

  const handleDelete = async (img: any) => {
    try {
      const path = img.image_url.split("/painter-gallery/")[1]
      await supabase.storage.from("painter-gallery").remove([path])
      await supabase.from("painter_gallery").delete().eq("id", img.id)
      await supabase.from("painters").update({
        gallery_size_bytes: Math.max(0, usedBytes - (img.image_size_bytes || 0))
      }).eq("id", painter.id)
      setDeleteConfirmId(null)
      await loadImages()
      onRefresh()
    } catch (err: any) { setError(err.message) }
  }

  const handleCaption = async (id: string, caption: string) => {
    await supabase.from("painter_gallery").update({ caption }).eq("id", id)
  }

  const usedMB = (usedBytes / 1048576).toFixed(1)
  const usedPct = Math.min(100, (usedBytes / maxBytes) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Gallery</h1>
          <p className="text-muted-foreground text-sm">Showcase your best work</p>
        </div>
        <label className="cursor-pointer bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center gap-2">
          {uploading ? <><div className="h-3.5 w-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Uploading...</> : "Upload Images"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" disabled={uploading} multiple />
        </label>
      </div>

      {/* Storage bar */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Storage used</span>
          <span className={usedPct > 80 ? "text-amber-400" : "text-foreground"}>{usedMB} MB / 100 MB</span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${usedPct > 80 ? "bg-amber-500" : "bg-foreground"}`}
            style={{ width: `${usedPct}%` }} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-2">
          <p className="font-medium">No portfolio images yet</p>
          <p className="text-sm text-muted-foreground">Upload photos of your completed work to attract more customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map(img => (
            <div key={img.id} className="border border-border rounded-xl overflow-hidden">
              <div className="aspect-square bg-accent/20 relative">
                <img src={img.image_url} alt={img.caption || "Gallery"} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <input
                  defaultValue={img.caption || ""}
                  onBlur={e => handleCaption(img.id, e.target.value)}
                  placeholder="Add caption..."
                  className="w-full bg-transparent text-xs border-b border-border focus:outline-none focus:border-foreground py-1"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {img.image_size_bytes ? `${(img.image_size_bytes / 1024).toFixed(0)} KB` : ""}
                  </span>
                  {deleteConfirmId === img.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(img)}
                        className="text-xs text-white bg-destructive px-2 py-0.5 rounded hover:bg-destructive/90">
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirmId(null)}
                        className="text-xs text-muted-foreground hover:text-foreground px-1">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(img.id)}
                      className="text-xs text-destructive hover:text-destructive/70 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function compressImage(file: File, maxDimension = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img") as HTMLImageElement;
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDimension) { h = Math.round(h * maxDimension / w); w = maxDimension; }
        if (h > maxDimension) { w = Math.round(w * maxDimension / h); h = maxDimension; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.82);
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve(file);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function AvailabilityTab({ painter, supabase, onRefresh }: { painter: any, supabase: any, onRefresh: () => void }) {
  const today = new Date()
  const [year, setYear] = React.useState(today.getFullYear())
  const [month, setMonth] = React.useState(today.getMonth())
  const [available, setAvailable] = React.useState<Set<string>>(new Set())
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (painter?.available_from && painter?.available_to) {
      const dates = new Set<string>()
      const start = new Date(painter.available_from)
      const end = new Date(painter.available_to)
      const cur = new Date(start)
      while (cur <= end) {
        dates.add(cur.toISOString().split("T")[0])
        cur.setDate(cur.getDate() + 1)
      }
      setAvailable(dates)
    }
  }, [painter?.id])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = new Date(year, month).toLocaleString("en-GB", { month: "long", year: "numeric" })

  const toggleDay = (dateStr: string) => {
    setAvailable(prev => {
      const next = new Set(prev)
      if (next.has(dateStr)) next.delete(dateStr)
      else next.add(dateStr)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const sorted = Array.from(available).sort()
    await supabase.from("painters").update({
      available_from: sorted[0] || null,
      available_to: sorted[sorted.length - 1] || null,
    }).eq("id", painter.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onRefresh()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Availability</h1>
        <p className="text-muted-foreground text-sm">
          Your availability calendar — this is for admin reference when manually assigning jobs.
          You will receive all new job notifications automatically regardless of your availability settings.
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }}
          className="text-muted-foreground hover:text-foreground p-1">←</button>
        <span className="font-medium">{monthName}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }}
          className="text-muted-foreground hover:text-foreground p-1">→</button>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-xl p-4">
        <div className="grid grid-cols-7 mb-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
            const isAvailable = available.has(dateStr)
            const isToday = dateStr === today.toISOString().split("T")[0]
            const isPast = new Date(dateStr) < new Date(today.toISOString().split("T")[0])
            return (
              <button key={day}
                onClick={() => !isPast && toggleDay(dateStr)}
                disabled={isPast}
                className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors ${
                  isPast ? "text-muted-foreground/30 cursor-not-allowed"
                  : isAvailable ? "bg-green-600 text-white font-medium"
                  : isToday ? "border-2 border-foreground text-foreground"
                  : "hover:bg-accent text-foreground"
                }`}>
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-600" /> Available</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-foreground" /> Today</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-accent" /> Unavailable</div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50">
        {saving ? "Saving..." : saved ? "✓ Saved" : "Save Availability"}
      </button>
    </div>
  )
}

function MyJobsTab({ painter, user, supabase, highlightSessionId }: { painter: any, user: any, supabase: any, highlightSessionId?: string }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const [invoiceNavigating, setInvoiceNavigating] = React.useState<string | null>(null)
  const [passOnConfirm, setPassOnConfirm] = React.useState<string | null>(null)
  const [viewInvoiceJob, setViewInvoiceJob] = React.useState<{session: any, tx: any} | null>(null)
  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({})
  const highlightRef = React.useRef<HTMLDivElement | null>(null)

  // Scroll to highlighted job on load
  React.useEffect(() => {
    if (highlightSessionId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        setActiveChatId(highlightSessionId)
      }, 500)
    }
  }, [highlightSessionId, sessions])

  // Fetch unread counts from Stream
  React.useEffect(() => {
    const fetchUnread = async () => {
      const streamApiKey = import.meta.env.VITE_STREAM_API_KEY
      if (!streamApiKey || !sessions.length) return
      try {
        const { StreamChat } = await import("stream-chat")
        const client = StreamChat.getInstance(streamApiKey)
        if (!client.userID) return
        const counts: Record<string, number> = {}
        for (const s of sessions) {
          if (s.chat_channel_id) {
            const ch = client.channel("messaging", s.chat_channel_id)
            await ch.watch()
            counts[s.id] = ch.countUnread()
          }
        }
        setUnreadCounts(counts)
      } catch {}
    }
    fetchUnread()
  }, [sessions])
  const [passOnLoading, setPassOnLoading] = React.useState(false)

  const openChatWithInvoice = async (session: any) => {
    // Open chat in job pane and show invoice modal
    setActiveChatId(session.id)
    // Scroll to the job
    setTimeout(() => {
      document.getElementById(`job-${session.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  const handlePassOnJob = async (sessionId: string) => {
    setPassOnLoading(true)
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pass-on-job`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${authSession.access_token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            painter_id: painter.id,
            reason: "painter_passed",
          }),
        }
      )
      const result = await res.json()
      if (result.success) {
        setPassOnConfirm(null)
        await loadSessions()
      }
    } finally {
      setPassOnLoading(false)
    }
  }

  React.useEffect(() => {
    if (painter?.id) loadSessions()
  }, [painter?.id])

  const loadSessions = async () => {
    setLoading(true)
    const painterId = painter.user_id ?? painter.id
    const { data } = await supabase
      .from("sessions")
      .select("*, transactions(*)")
      .eq("painter_id", painterId)
      .order("updated_at", { ascending: false })
    setSessions(data || [])
    setLoading(false)
  }

  const [stageFilter, setStageFilter] = React.useState<string>("all")

  const activeStatuses = ["painter_contacted", "invoice_sent", "funded", "in_progress", "completion_requested"]
  const filteredSessions = stageFilter === "all" ? sessions
    : stageFilter === "negotiating" ? sessions.filter(s => ["painter_contacted", "invoice_sent"].includes(s.status))
    : stageFilter === "active" ? sessions.filter(s => ["funded", "in_progress", "completion_requested"].includes(s.status))
    : stageFilter === "completed" ? sessions.filter(s => s.status === "completed")
    : stageFilter === "cancelled" ? sessions.filter(s => ["cancelled", "disputed"].includes(s.status))
    : sessions
  const activeSessions = filteredSessions.filter(s => activeStatuses.includes(s.status))
  const pastSessions = filteredSessions.filter(s => !activeStatuses.includes(s.status))

  const statusLabel: Record<string, string> = {
    painter_contacted: "Awaiting invoice",
    invoice_sent: "Invoice sent",
    funded: "Escrow funded",
    in_progress: "In progress",
    completion_requested: "Completion requested",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
  }

  const statusColor: Record<string, string> = {
    painter_contacted: "text-blue-400 bg-blue-900/20 border-blue-800/40",
    invoice_sent: "text-amber-400 bg-amber-900/20 border-amber-800/40",
    funded: "text-green-400 bg-green-900/20 border-green-800/40",
    in_progress: "text-green-400 bg-green-900/20 border-green-800/40",
    completion_requested: "text-amber-400 bg-amber-900/20 border-amber-800/40",
    completed: "text-muted-foreground bg-muted border-border",
    cancelled: "text-destructive bg-destructive/10 border-destructive/20",
    disputed: "text-destructive bg-destructive/10 border-destructive/20",
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">My Jobs</h1>
          <p className="text-muted-foreground text-sm">Your active and past jobs</p>
        </div>
        <button onClick={loadSessions}
          className="text-sm border border-border px-3 py-1.5 rounded hover:bg-accent transition-colors">
          Refresh
        </button>
      </div>

      {/* Stage filter dropdown */}
      <div className="flex items-center gap-3">
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="border border-border bg-background text-sm rounded-md px-3 py-2 focus:outline-none focus:border-foreground"
        >
          <option value="all">All Jobs ({sessions.length})</option>
          <option value="negotiating">Negotiating ({sessions.filter(s => ["painter_contacted","invoice_sent"].includes(s.status)).length})</option>
          <option value="active">Active ({sessions.filter(s => ["funded","in_progress","completion_requested"].includes(s.status)).length})</option>
          <option value="completed">Completed ({sessions.filter(s => s.status === "completed").length})</option>
          <option value="cancelled">Cancelled & Disputed ({sessions.filter(s => ["cancelled","disputed"].includes(s.status)).length})</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="border border-border rounded-xl p-8 text-center space-y-2">
          <p className="font-medium">No jobs yet</p>
          <p className="text-sm text-muted-foreground">
            Accept a job from Available Jobs to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSessions.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Active</h3>
              <div className="space-y-4">
                {activeSessions.map(session => {
                  const tx = Array.isArray(session.transactions) ? session.transactions[0] : session.transactions
                  const isOpen = activeChatId === session.id
                  const isHighlighted = highlightSessionId === session.id
                  const unread = unreadCounts[session.id] || 0
                  const jobRef = `PBC-${session.id.slice(-6).toUpperCase()}`

                  // Action indicator
                  const actionNeeded =
                    session.status === "painter_contacted" ? { label: "Send Invoice", color: "text-blue-400 bg-blue-900/20 border-blue-800/40" } :
                    session.status === "funded" ? { label: "Start Job", color: "text-green-400 bg-green-900/20 border-green-800/40" } :
                    session.status === "completion_requested" ? { label: "Confirm Complete", color: "text-amber-400 bg-amber-900/20 border-amber-800/40" } :
                    session.status === "disputed" ? { label: "Dispute Active", color: "text-red-400 bg-red-900/20 border-red-800/40" } :
                    null

                  return (
                    <div
                      key={session.id}
                      ref={isHighlighted ? highlightRef : null}
                      className={`border rounded-xl overflow-hidden transition-all ${isHighlighted ? "border-primary shadow-lg shadow-primary/20" : "border-border"}`}
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium">{session.job_type}</p>
                              {unread > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                                  {unread > 9 ? "9+" : unread}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{jobRef}</p>
                            <p className="text-sm text-muted-foreground">📍 {session.postcode?.split(" ")[0]}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded border ${statusColor[session.status] || "text-muted-foreground bg-muted border-border"}`}>
                              {statusLabel[session.status] || session.status}
                            </span>
                            {actionNeeded && (
                              <span className={`block text-xs px-2 py-0.5 rounded border ${actionNeeded.color}`}>
                                ⚡ {actionNeeded.label}
                              </span>
                            )}
                            {tx?.amount && (
                              <p className="text-sm font-medium">£{Number(tx.amount).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        {session.chat_channel_id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveChatId(isOpen ? null : session.id)}
                              className="flex-1 flex items-center justify-center gap-2 border border-border text-sm py-2 rounded-md hover:bg-accent transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {isOpen ? "Hide Chat" : "Open Chat"}
                            </button>
                            {session.status === "painter_contacted" && (
                              <button
                                onClick={() => openChatWithInvoice(session)}
                                disabled={invoiceNavigating === session.id}
                                className="px-3 py-2 border border-border text-sm rounded-md hover:bg-accent transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {invoiceNavigating === session.id ? "..." : "📄 Invoice"}
                              </button>
                            )}
                          </div>
                        )}
                        {["painter_contacted", "invoice_sent"].includes(session.status) && (
                          passOnConfirm === session.id ? (
                            <div className="border border-amber-800/40 bg-amber-900/10 rounded-lg p-3 space-y-2">
                              <p className="text-xs text-muted-foreground">Are you sure? This job will return to the available queue.</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePassOnJob(session.id)}
                                  disabled={passOnLoading}
                                  className="flex-1 text-xs bg-amber-600 text-white py-1.5 rounded hover:bg-amber-700 transition-colors disabled:opacity-50"
                                >
                                  {passOnLoading ? "..." : "Confirm"}
                                </button>
                                <button
                                  onClick={() => setPassOnConfirm(null)}
                                  className="flex-1 text-xs border border-border text-muted-foreground py-1.5 rounded hover:bg-accent transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPassOnConfirm(session.id)}
                              className="w-full text-xs border border-border text-muted-foreground py-1.5 rounded hover:bg-accent transition-colors"
                            >
                              Pass on Job
                            </button>
                          )
                        )}
                      </div>
                      {isOpen && session.chat_channel_id && (
                        <div className="border-t border-border h-96">
                          <PaintBookChat
                            sessionId={session.id}
                            userId={user?.id}
                            userRole="painter"
                            jobStatus={session.status}
                            transactionId={tx?.id}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {pastSessions.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Past</h3>
              <div className="space-y-2">
                {pastSessions.map(session => {
                  const tx = Array.isArray(session.transactions) ? session.transactions[0] : session.transactions
                  return (
                    <div key={session.id}
                      onClick={() => tx?.invoice_html ? setViewInvoiceJob({ session, tx }) : null}
                      className={`border border-border rounded-lg p-4 flex items-center justify-between gap-3 ${tx?.invoice_html ? "cursor-pointer hover:bg-accent transition-colors" : ""}`}>
                      <div>
                        <p className="text-sm font-medium">{session.job_type}</p>
                        <p className="text-xs text-muted-foreground">
                          📍 {session.postcode?.split(" ")[0]} · {new Date(session.created_at).toLocaleDateString("en-GB")}
                        </p>
                        {tx?.invoice_html && <p className="text-xs text-primary mt-0.5">Click to view invoice</p>}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded border ${statusColor[session.status] || "text-muted-foreground bg-muted border-border"}`}>
                          {statusLabel[session.status] || session.status}
                        </span>
                        {tx?.amount && (
                          <p className="text-xs text-muted-foreground mt-1">£{Number(tx.amount).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {/* View Invoice Modal */}
      {viewInvoiceJob && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoiceJob(null)}>
          <div className="bg-background border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Invoice — {viewInvoiceJob.session.job_type}</h2>
              <button onClick={() => setViewInvoiceJob(null)} className="text-muted-foreground hover:text-foreground p-1">✕</button>
            </div>
            <div className="text-sm mb-4 pb-4 border-b border-border">
              <p className="text-muted-foreground">Status: <span className="text-foreground font-medium">{viewInvoiceJob.session.status}</span></p>
              <p className="text-muted-foreground">Amount: <span className="text-foreground font-medium">£{Number(viewInvoiceJob.tx?.amount || 0).toFixed(2)}</span></p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: viewInvoiceJob.tx?.invoice_html || "" }} />
            <button
              onClick={() => {
                const w = window.open("", "_blank");
                w?.document.write(viewInvoiceJob.tx?.invoice_html || "");
                w?.document.close();
                w?.print();
              }}
              className="mt-4 w-full border border-border py-2.5 rounded-md text-sm hover:bg-accent transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  )
}

function ReviewsTab({ painter, supabase }: { painter: any; supabase: any }) {
  const [reviews, setReviews] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => { if (painter?.id) load() }, [painter?.id])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, review_text, created_at")
      .eq("painter_id", painter.id)
      .order("created_at", { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Reviews</h1>
        {avg && (
          <div className="flex items-center gap-2 mt-1">
            <StarDisplay rating={Number(avg)} />
            <span className="text-sm font-medium">{avg} avg</span>
            <span className="text-xs text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">Reviews appear here once customers complete and rate jobs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <StarDisplay rating={r.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm">{r.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfilePictureUpload({ painter, supabase, onRefresh }: { painter: any; supabase: any; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [localUrl, setLocalUrl] = useState<string | null>(painter.profile_picture_url || null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG or WebP accepted."); return }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return }
    setError("")
    setUploading(true)
    try {
      const compressed = await compressImage(file, 400)
      const path = `${painter.id}/profile.jpg`
      const { error: uploadErr } = await supabase.storage
        .from("painter-profiles")
        .upload(path, compressed, { upsert: true })
      if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); setUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from("painter-profiles").getPublicUrl(path)
      await supabase.from("painters").update({ profile_picture_url: publicUrl }).eq("id", painter.id)
      setLocalUrl(publicUrl)
      onRefresh()
    } catch (err: any) {
      setError(err.message || "Upload failed.")
    }
    setUploading(false)
  }

  const initials = `${painter.first_name?.[0] || ""}${painter.last_name?.[0] || ""}`.toUpperCase()

  return (
    <div className="border border-border rounded-lg p-4 sm:p-6">
      <h3 className="font-semibold mb-3 sm:mb-4">Profile Picture</h3>
      <div className="flex items-center gap-4">
        {localUrl ? (
          <img src={localUrl} alt={painter.first_name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-foreground/50">{initials}</span>
          </div>
        )}
        <div className="space-y-2">
          <label className="cursor-pointer inline-flex items-center gap-2 border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-accent transition-colors min-h-[44px]">
            {uploading ? (
              <><div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><Camera className="h-4 w-4" /> Change Photo</>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP — max 5MB</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  )
}

const LOGO = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "registration", label: "Registration", icon: CheckCircle2 },
  { id: "available-jobs", label: "Available Jobs", icon: Briefcase },
  { id: "my-jobs", label: "My Jobs", icon: FileText },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "availability", label: "Availability", icon: Calendar },
  { id: "profile", label: "Profile", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const REGISTRATION_STEPS = [
  { number: 1, label: "Account Created", key: "account_created" },
  { number: 2, label: "Email Confirmed", key: "email_confirmed" },
  { number: 3, label: "Insurance Submitted", key: "insurance_submitted" },
  { number: 4, label: "Insurance Verified", key: "insurance_verified" },
  { number: 5, label: "KYC Verification", key: "kyc_status" },
  { number: 6, label: "Account Activated", key: "is_active" },
];

export function PainterDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "insurance") return "profile"
    if (tabParam === "progress") return "registration"
    if (tabParam === "jobs") return "my-jobs"
    const validTabs = ["overview","registration","available-jobs","my-jobs","gallery","availability","profile","notifications"]
    if (tabParam && validTabs.includes(tabParam)) return tabParam
    return "overview"
  });
  const [user, setUser] = useState<any>(null);
  const [painter, setPainter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline toast for account actions
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Delete account inline flow
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInputVal, setDeleteInputVal] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
      const { data: painterData } = await supabase
        .from("painters")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (painterData) {
        setPainter(painterData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleDownloadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { showToast("Session expired. Please log in again.", "error"); return }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-my-data`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        }
      )
      if (!res.ok) { showToast("Download failed. Please try again.", "error"); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `paintbookco-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      showToast("Download failed: " + (err.message || "Please try again."), "error")
    }
  }

  async function handleDeleteAccount() {
    if (deleteInputVal !== "DELETE") return
    setDeletingAccount(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { showToast("Session expired. Please log in again.", "error"); setDeletingAccount(false); return }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-my-account`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        }
      )
      const result = await res.json()
      if (result.success) {
        await supabase.auth.signOut()
        window.location.href = "/"
      } else {
        showToast(result.error || "Failed to delete account. Please contact support.", "error")
        setDeletingAccount(false)
        setShowDeleteConfirm(false)
        setDeleteInputVal("")
      }
    } catch (err: any) {
      showToast("Error: " + (err.message || "Please try again."), "error")
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !painter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-destructive font-medium mb-4">{error || "Failed to load painter profile"}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-foreground hover:text-muted-foreground"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <a href="/" className="flex-shrink-0">
            <img src={LOGO} alt="PaintBookCo" className="h-7 sm:h-8 object-contain max-w-[140px]" />
          </a>
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => {}}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Contact Us
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm max-w-sm ${
          toast.type === "error"
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-green-900/30 border-green-800/40 text-green-400"
        }`}>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="flex-shrink-0 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-x-hidden">
        {/* Sidebar — desktop only */}
        <aside className="w-56 border-r border-border hidden lg:flex flex-col bg-card/30 flex-shrink-0">
          <nav className="space-y-1 p-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${
                  activeTab === id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-w-0">
          {/* pb-20 reserves space above the mobile bottom tab bar */}
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:p-12 pb-24 lg:pb-12">

            {/* TAB 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-4">
                  {painter.profile_picture_url ? (
                    <img src={painter.profile_picture_url} alt={painter.first_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-foreground/60">{painter.first_name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-0.5">Overview</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {painter.first_name}</p>
                  </div>
                </div>

                {/* Insurance required banner */}
                {painter.kyc_status === "approved" && !painter.insurance_submitted_at && (
                  <div className="border border-amber-800/40 bg-amber-900/20 rounded-xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div>
                        <p className="font-semibold text-amber-400 mb-1 text-sm sm:text-base">
                          ✓ Identity Verified — Submit Insurance to Go Live
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your KYC has been approved. The next step is to submit
                          your public liability insurance certificate. Once verified
                          by our team, your account will be activated.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="w-full sm:w-auto flex-shrink-0 bg-amber-500 text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-amber-400 transition-colors whitespace-nowrap min-h-[44px]"
                      >
                        Submit Insurance →
                      </button>
                    </div>
                  </div>
                )}

                {/* Insurance under review banner */}
                {painter.kyc_status === "approved" && painter.insurance_submitted_at && !painter.insurance_verified && !painter.is_active && (
                  <div className="border border-blue-800/40 bg-blue-900/20 rounded-xl p-4 sm:p-5">
                    <p className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">
                      ✓ Insurance Submitted — Under Review
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Our team is verifying your insurance certificate.
                      You will receive an email when your account is activated.
                      This typically takes 1-2 working days.
                    </p>
                  </div>
                )}

                {/* Stats Grid — 2-col on mobile, 4-col on md+ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Total Earnings</p>
                    <p className="text-xl sm:text-2xl font-bold">£{painter.total_earnings || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Completed Jobs</p>
                    <p className="text-xl sm:text-2xl font-bold">{painter.completed_jobs || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Active Jobs</p>
                    <p className="text-xl sm:text-2xl font-bold">{painter.active_jobs || 0}</p>
                  </div>
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-card/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">Average Rating</p>
                    <p className="text-xl sm:text-2xl font-bold">{painter.avg_rating || 0}/5</p>
                  </div>
                </div>

                {/* Commission tier */}
                <div className="border border-border rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold mb-3 sm:mb-4">Commission Tier</h3>
                  <div className="flex gap-4 items-center mb-3 sm:mb-4">
                    <div
                      className={`px-3 sm:px-4 py-2 rounded text-sm font-medium ${
                        (painter.completed_jobs || 0) < 5
                          ? "bg-amber-500/20 text-amber-400"
                          : (painter.completed_jobs || 0) < 10
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {(painter.completed_jobs || 0) < 5
                        ? "0-5 jobs: 12%"
                        : (painter.completed_jobs || 0) < 10
                          ? "6-10 jobs: 10%"
                          : "11+ jobs: 8%"}
                    </div>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-foreground h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((painter.completed_jobs || 0) / 11) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Registration Progress */}
            {activeTab === "registration" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Registration Progress</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Complete your profile to start receiving jobs</p>
                </div>

                <div className="space-y-4">
                  {REGISTRATION_STEPS.map((step) => {
                    let isComplete = false;
                    if (step.key === "account_created") isComplete = true;
                    else if (step.key === "email_confirmed") isComplete = user?.email_confirmed_at !== null;
                    else if (step.key === "insurance_submitted") isComplete = painter?.insurance_submitted_at !== null;
                    else if (step.key === "insurance_verified") isComplete = painter?.insurance_verified === true;
                    else if (step.key === "kyc_status") isComplete = painter?.kyc_status === "approved";
                    else if (step.key === "is_active") isComplete = painter?.is_active === true;

                    return (
                      <div key={step.number} className="flex gap-3 sm:gap-4 items-start">
                        <div
                          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isComplete
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isComplete ? "✓" : step.number}
                        </div>
                        <div className="flex-1 pt-1.5 sm:pt-2">
                          <p className="font-medium text-sm sm:text-base">{step.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {isComplete ? "Completed ✓" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-accent/10 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Progress: {REGISTRATION_STEPS.filter((s) => {
                      if (s.key === "account_created") return true;
                      else if (s.key === "email_confirmed") return user?.email_confirmed_at !== null;
                      else if (s.key === "insurance_submitted") return painter?.insurance_submitted_at !== null;
                      else if (s.key === "insurance_verified") return painter?.insurance_verified === true;
                      else if (s.key === "kyc_status") return painter?.kyc_status === "approved";
                      else if (s.key === "is_active") return painter?.is_active === true;
                      return false;
                    }).length}/6 steps
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Available Jobs */}
            {activeTab === "available-jobs" && (
              <AvailableJobsTab
                painter={painter}
                supabase={supabase}
                onTabChange={setActiveTab}
              />
            )}

            {/* TAB 4: My Jobs */}
            {activeTab === "my-jobs" && (
              <MyJobsTab painter={painter} user={user} supabase={supabase} highlightSessionId={searchParams.get("highlight") || undefined} />
            )}

            {/* TAB 5: Gallery */}
            {activeTab === "gallery" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <GalleryTab painter={painter} supabase={supabase} onRefresh={loadDashboard} />
              </div>
            )}

            {/* TAB 6: Reviews */}
            {activeTab === "reviews" && (
              <ReviewsTab painter={painter} supabase={supabase} />
            )}

            {/* TAB 7: Availability */}
            {activeTab === "availability" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <AvailabilityTab painter={painter} supabase={supabase} onRefresh={loadDashboard} />
              </div>
            )}

            {/* TAB 7: Profile & Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Profile & Settings</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Profile Picture */}
                  <ProfilePictureUpload painter={painter} supabase={supabase} onRefresh={loadDashboard} />

                  {/* Personal Details */}
                  <div className="border border-border rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold mb-3 sm:mb-4">Personal Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                          First Name
                        </label>
                        <p className="text-sm">{painter.first_name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                          Last Name
                        </label>
                        <p className="text-sm">{painter.last_name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                          Email
                        </label>
                        <p className="text-sm">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Section */}
                  <div className="border border-border rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold mb-3 sm:mb-4">Insurance Details</h3>
                    {painter.insurance_verified ? (
                      <div className="border border-green-800/40 bg-green-900/20 rounded-lg p-4">
                        <p className="text-green-400 font-medium">✓ Insurance Verified</p>
                        <p className="text-sm text-muted-foreground mt-1">{painter.insurance_company} — {painter.insurance_policy_number}</p>
                        <p className="text-sm text-muted-foreground">Expires: {painter.insurance_expiry_date}</p>
                      </div>
                    ) : painter.insurance_submitted_at ? (
                      <div className="border border-amber-800/40 bg-amber-900/20 rounded-lg p-4">
                        <p className="text-amber-400 font-medium">⏳ Insurance Under Review</p>
                        <p className="text-sm text-muted-foreground mt-1">Submitted {new Date(painter.insurance_submitted_at).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Our team will verify within 1-2 working days.</p>
                      </div>
                    ) : (
                      <InsuranceBoundary>
                        <InsuranceUploadForm painter={painter} onSuccess={loadDashboard} />
                      </InsuranceBoundary>
                    )}
                  </div>

                  {/* Account Actions */}
                  <div className="border border-border rounded-lg p-4 sm:p-6">
                    <h3 className="font-semibold mb-3 sm:mb-4">Account Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={handleDownloadData}
                        className="w-full flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground p-3 rounded border border-border hover:bg-accent transition-colors min-h-[44px]">
                        <Download className="h-4 w-4" />
                        Download My Data
                      </button>

                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 p-3 rounded border border-destructive/20 transition-colors min-h-[44px]">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </button>
                      ) : (
                        <div className="space-y-3 border border-destructive/40 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">
                            Type <strong className="text-foreground">DELETE</strong> to confirm.
                            Your job history and compliance records will be retained as required by law.
                          </p>
                          <input
                            type="text"
                            value={deleteInputVal}
                            onChange={e => setDeleteInputVal(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="w-full border-b border-border bg-transparent text-sm py-2 focus:outline-none focus:border-destructive placeholder:text-muted-foreground/50"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={deleteInputVal !== "DELETE" || deletingAccount}
                              className="flex-1 bg-destructive text-white py-2 rounded text-sm font-medium disabled:opacity-50 min-h-[44px]"
                            >
                              {deletingAccount ? "Deleting..." : "Confirm Delete"}
                            </button>
                            <button
                              onClick={() => { setShowDeleteConfirm(false); setDeleteInputVal("") }}
                              className="flex-1 border border-border py-2 rounded text-sm min-h-[44px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: Notifications */}
            {activeTab === "notifications" && (
              <NotificationsTab painter={painter} supabase={supabase} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar — icons only, horizontal scroll */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex overflow-x-auto">
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-shrink-0 flex items-center justify-center px-3 min-w-[56px] min-h-[56px] transition-colors ${
                activeTab === id
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default PainterDashboard;
