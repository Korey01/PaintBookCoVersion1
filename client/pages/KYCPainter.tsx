import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800";

export default function KYCPainter() {
  const navigate = useNavigate();
  const { user, painterProfile, submitKYC } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !painterProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show status if already submitted
  if (painterProfile.kyc_status !== "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 py-5 border-b border-border">
          <a href="/">
            <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
          </a>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-6">
            {painterProfile.kyc_status === "submitted" && (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-amber-600" />
                </div>
                <h2 className="text-2xl font-semibold">Verification Pending</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thank you for submitting your documents. Our team is reviewing
                  your application. We'll notify you via email once verified.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Typically takes 1-3 business days.
                </p>
              </>
            )}

            {painterProfile.kyc_status === "approved" && (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold">Verified!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your account has been verified. You can now browse jobs and
                  submit quotes on the marketplace.
                </p>
                <button
                  onClick={() => navigate("/dashboard/painter")}
                  className="mt-6 w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              </>
            )}

            {painterProfile.kyc_status === "rejected" && (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold">Application Rejected</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {painterProfile.kyc_rejection_reason || "Your application could not be verified."}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Please contact support for more information.
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Document upload form
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, image)
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Create a unique filename
      const fileName = `kyc/${user.id}/${Date.now()}_${file.name}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      setDocumentUrl(urlData.publicUrl);
      setUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!documentUrl) {
      setError("Please upload a document to verify");
      return;
    }

    setLoading(true);
    const { error: submitError } = await submitKYC("painter", documentUrl);
    setLoading(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    // Refresh page to show pending status
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <a href="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="animate-editorial-up" style={{ animationFillMode: "both" }}>
            <p className="editorial-label mb-2">Painter Verification</p>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Verify Your Identity</h1>
            <p className="text-muted-foreground">
              To start receiving jobs, we need to verify your identity. Please upload a
              government-issued ID or relevant business documentation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Document upload area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                {documentUrl ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <p className="text-sm font-medium">Document uploaded</p>
                  </>
                ) : uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF or image (JPG, PNG) • Max 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Information */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-sm">What documentation do we accept?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Passport or Driving License</li>
                <li>✓ Business Registration (sole trader/limited company)</li>
                <li>✓ Professional Insurance Certificate</li>
                <li>✓ DBS Check (enhanced disclosure)</li>
              </ul>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              By submitting these documents, you confirm that you are providing accurate
              information and agree to our verification process. All documents will be
              securely stored and treated according to our{" "}
              <a href="/privacy" className="text-foreground hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || uploading || !documentUrl}
              className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
