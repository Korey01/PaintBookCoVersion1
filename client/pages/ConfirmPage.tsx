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
    // Supabase email confirmation embeds tokens in the URL hash or query string.
    // Just calling getSession() after the redirect is enough — Supabase client
    // exchanges the token automatically when it detects the URL parameters.
    (async () => {
      try {
        // Give Supabase a moment to process the URL hash
        await new Promise((r) => setTimeout(r, 500));
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus("error");
          return;
        }

        setStatus("success");
        // Redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } catch {
        setStatus("error");
      }
    })();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, system-ui, sans-serif" }}
    >
      <div
        className="bg-white border border-gray-100 p-10 text-center max-w-sm w-full"
        style={{ borderRadius: "8px" }}
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 text-[#2E75B6] animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-bold text-[#1B3A5C] mb-2">
              Confirming your email…
            </h1>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-[#1B3A5C] mb-2">
              Email confirmed!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your email address has been verified. Redirecting you to login…
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-[#2E75B6] hover:underline"
            >
              Go to login now →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-[#1B3A5C] mb-2">
              Confirmation failed
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              The confirmation link may have expired or already been used.
              Please request a new one or contact support.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-[#2E75B6] hover:underline"
            >
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
