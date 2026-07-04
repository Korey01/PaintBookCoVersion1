import React, { useState, useRef } from "react";

// Sanitize storage path to prevent path traversal
const sanitizeStoragePath = (p: string) => p.replace(/\.\.[\/\\]/g, '').replace(/^\/+/, '');


interface DisputeModalProps {
  transactionId: string;
  sessionId: string;
  raisedBy: "customer" | "painter";
  customerToken?: string;
  onClose: () => void;
  onSuccess: () => void;
  supabase: any;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";

export function DisputeModal({
  transactionId,
  sessionId,
  raisedBy,
  customerToken,
  onClose,
  onSuccess,
  supabase,
}: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        setError(`${f.name} exceeds 50MB limit`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please describe the reason for your dispute.");
      return;
    }
    if (reason.trim().length < 20) {
      setError("Please provide more detail (at least 20 characters).");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload media files to Supabase storage
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const path = sanitizeStoragePath(`disputes/${sessionId}/${Date.now()}-${file.name}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("paintbookco-uploads")
          .upload(path, file, { upsert: false });
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("paintbookco-uploads")
            .getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }

      const fullReason = reason.trim() + (uploadedUrls.length > 0
        ? `\n\nAttachments: ${uploadedUrls.join(", ")}`
        : "");

      const body: Record<string, string> = {
        transaction_id: transactionId,
        raised_by: raisedBy,
        reason: fullReason,
      };
      if (customerToken) body.customer_token = customerToken;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/raise-dispute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(body),
        }
      );

      const result = await res.json();
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to raise dispute.");
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl max-w-lg w-full p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Raise a Dispute</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Our team will review and contact both parties within 24 hours. The job will be paused until resolved.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">✕</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for dispute *</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Please describe the issue in detail. What went wrong? What outcome are you looking for?"
            rows={5}
            className="w-full border border-border bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{reason.length} characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Evidence (optional)</label>
          <p className="text-xs text-muted-foreground">Upload photos or videos up to 50MB each. Max 5 files.</p>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent/20 transition-colors"
          >
            <p className="text-sm text-muted-foreground">📎 Click to attach photos or videos</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, MP4, MOV, WebM up to 50MB</p>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{file.type.startsWith("video") ? "🎥" : "🖼️"}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive text-sm ml-2">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !reason.trim()}
            className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {uploading ? "Submitting..." : "Raise Dispute"}
          </button>
        </div>
      </div>
    </div>
  );
}
