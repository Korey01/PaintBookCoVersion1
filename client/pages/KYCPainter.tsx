import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KYCPainter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [painterId, setPainterId] = useState<string>("");

  useEffect(() => {
    loadPainterStatus();
  }, []);

  const loadPainterStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    const { data: painter } = await supabase
      .from("painters")
      .select("id, kyc_status, kyc_rejection_reason")
      .eq("user_id", user.id)
      .single();

    if (!painter) { navigate("/login"); return; }

    setKycStatus(painter.kyc_status);
    setRejectionReason(painter.kyc_rejection_reason || "");
    setPainterId(painter.id);
    setPageLoading(false);

    // Auto-navigate if KYC already approved
    if (painter.kyc_status === "approved") {
      navigate("/dashboard/painter", { replace: true });
    }
  };

  const handleStartKYC = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-kyc`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({})
        }
      );

      const result = await res.json();

      if (result.verification_url) {
        setKycStatus("submitted");
        window.open(result.verification_url, "_blank");
      } else {
        setError(result.error || "Failed to start verification. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <header className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
        <a href="/">
          <img src="/logo.png" alt="PaintBookCo" className="h-8 object-contain max-w-[140px]" />
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-md w-full space-y-8">

          {/* Status: Pending — show start button */}
          {kycStatus === "pending" && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold mb-2">Verify Your Identity</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To protect our customers and maintain platform integrity, 
                  all painters must complete identity verification before 
                  receiving jobs.
                </p>
              </div>
              <div className="bg-accent/30 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium">What you'll need:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ A valid photo ID (passport, driving licence)</li>
                  <li>✓ A smartphone or webcam for a selfie</li>
                  <li>✓ Good lighting</li>
                  <li>✓ 3-5 minutes</li>
                </ul>
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              <button
                onClick={handleStartKYC}
                disabled={loading}
                className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Starting verification...</>
                ) : (
                  <><ShieldCheck className="h-4 w-4" /> Start Identity Verification</>
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                Identity verification is powered by Didit. Your ID documents are processed directly by Didit and are not stored by PaintBookCo. See Didit's Privacy Policy at didit.me/privacy
              </p>
            </div>
          )}

          {/* Status: Submitted — under review */}
          {kycStatus === "submitted" && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold mb-2">Verification In Progress</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your identity verification is being processed. 
                  This typically takes a few minutes but can take up to 
                  1 business day.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  We'll send you an email as soon as your verification 
                  is complete. You can close this page.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/painter?tab=insurance")}
                className="w-full border border-border py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* Status: Approved */}
          {kycStatus === "approved" && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold mb-2">Identity Verified ✓</h1>
                <p className="text-muted-foreground text-sm">
                  Your identity has been successfully verified.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/painter?tab=insurance")}
                className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Status: Rejected */}
          {kycStatus === "rejected" && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold mb-2">Verification Unsuccessful</h1>
                {rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                    <p className="text-red-800 text-sm">{rejectionReason}</p>
                  </div>
                )}
              </div>
              <div className="bg-accent/30 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium">Common reasons for rejection:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Document was blurry or partially obscured</li>
                  <li>• Selfie did not match the ID photo</li>
                  <li>• Document was expired</li>
                  <li>• Poor lighting during verification</li>
                </ul>
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              <button
                onClick={handleStartKYC}
                disabled={loading}
                className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Starting verification...</>
                ) : (
                  <><ShieldCheck className="h-4 w-4" /> Retry Verification</>
                )}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
