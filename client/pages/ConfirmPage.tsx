import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LOGO = "https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setStatus("success");
        setMessage("Your email has been confirmed successfully. Your PaintBookCo account is now active.");
        // Sign out so they go through proper login flow
        await supabase.auth.signOut();
      } else if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      setStatus("error");
      setMessage("Verification timed out. Please try logging in.");
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <header className="px-6 py-5 border-b border-border">
        <Link to="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain max-w-[140px]" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center space-y-4 max-w-sm">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Confirming your email…</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <h1 className="text-2xl font-semibold">Account Confirmed!</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
              <p className="text-sm text-muted-foreground">
                You can now sign in and complete your identity verification to start receiving jobs.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors text-center mt-2"
              >
                Sign in to PaintBookCo →
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <h1 className="text-xl font-semibold">Verification failed</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Link to="/login" className="text-sm font-medium text-foreground underline">
                Go to login
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
