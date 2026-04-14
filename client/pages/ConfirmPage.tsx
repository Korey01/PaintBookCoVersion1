/**
 * ConfirmPage — handles Supabase email confirmation and password reset callbacks.
 *
 * Supabase automatically parses the #access_token fragment from the confirmation
 * link and fires an onAuthStateChange event (SIGNED_IN or PASSWORD_RECOVERY).
 * We listen for SIGNED_IN, then route the user to the correct dashboard based on
 * whether they have a record in the painters table.
 *
 * Supabase dashboard setup reminder:
 *   Authentication → URL Configuration:
 *     Site URL:      https://paintbook-app.netlify.app
 *     Redirect URLs: https://paintbook-app.netlify.app/confirm
 *                    https://paintbook-app.netlify.app/dashboard/customer
 *                    https://paintbook-app.netlify.app/dashboard/painter
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800";

async function redirectByRole(userId: string, navigate: ReturnType<typeof useNavigate>) {
  const { data: painterRecord } = await supabase
    .from("painters")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  navigate(painterRecord ? "/dashboard/painter" : "/dashboard/customer", { replace: true });
}

export default function ConfirmPage() {
  useEffect(() => { document.title = "Confirming Email | PaintBookCo"; }, []);

  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Supabase fires SIGNED_IN after automatically parsing the confirmation token
    // from the URL fragment (#access_token=...) that Supabase appended to the link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setStatus("success");
        // Brief pause so the success message is visible before redirect
        setTimeout(() => redirectByRole(session.user.id, navigate), 2000);
      }
    });

    // Also check if the user already has an active session on load
    // (e.g. they landed here after already confirming in another tab)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setStatus("success");
        setTimeout(() => redirectByRole(session.user.id, navigate), 2000);
      }
    });

    // If no SIGNED_IN event fires within 12 seconds, show an error
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, 12000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-sm text-center animate-editorial-up" style={{ animationFillMode: "both" }}>
        <Link to="/" aria-label="PaintBookCo home" className="inline-block mb-16">
          <img src={LOGO} alt="PaintBookCo" className="h-8 w-auto mx-auto" />
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
              Welcome to PaintBookCo. Taking you to your dashboard…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-6" />
            <h1 className="font-display text-xl text-foreground mb-3">Confirmation failed</h1>
            <p className="text-sm text-muted-foreground leading-[1.8] mb-8">
              The confirmation link may have expired or already been used. Please request a new one.
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
