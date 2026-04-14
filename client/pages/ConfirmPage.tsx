import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  useEffect(() => { document.title = "Confirming Email | PaintBookCo"; }, []);

  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 500));
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) { setStatus("error"); return; }

        setStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      } catch {
        setStatus("error");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm text-center animate-editorial-up" style={{ animationFillMode: "both" }}>
        <Link to="/" aria-label="PaintBookCo home" className="inline-block mb-16">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800" alt="PaintBookCo" className="h-8 w-auto mx-auto" />
        </Link>

        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-6" />
            <h1 className="font-display text-xl text-foreground mb-3">Confirming your email…</h1>
            <p className="text-sm text-muted-foreground leading-[1.8]">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-6" />
            <h1 className="font-display text-xl text-foreground mb-3">Email confirmed!</h1>
            <p className="text-sm text-muted-foreground leading-[1.8] mb-8">
              Your email address has been verified. Redirecting you to login…
            </p>
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Go to login now →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-6" />
            <h1 className="font-display text-xl text-foreground mb-3">Confirmation failed</h1>
            <p className="text-sm text-muted-foreground leading-[1.8] mb-8">
              The confirmation link may have expired or already been used.
              Please request a new one or contact support.
            </p>
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(ConfirmPage, { name: "ConfirmPage", inputs: [] }); })
  .catch(() => {});
