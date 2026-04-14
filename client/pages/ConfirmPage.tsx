import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  useEffect(() => {
    document.title = "Confirming Email | PaintBookCo";
  }, []);

  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 500));
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus("error");
          return;
        }

        setStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      } catch {
        setStatus("error");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="bg-card border border-border p-10 text-center max-w-sm w-full">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-display text-lg text-foreground mb-2">
              Confirming your email…
            </h1>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-lg text-foreground mb-2">
              Email confirmed!
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-[1.7]">
              Your email address has been verified. Redirecting you to login…
            </p>
            <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline">
              Go to login now →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-lg text-foreground mb-2">
              Confirmation failed
            </h1>
            <p className="text-sm text-muted-foreground mb-6 leading-[1.7]">
              The confirmation link may have expired or already been used.
              Please request a new one or contact support.
            </p>
            <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline">
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
  .then(({ Builder }) => {
    Builder.registerComponent(ConfirmPage, {
      name: "ConfirmPage",
      inputs: [],
    });
  })
  .catch(() => {});
