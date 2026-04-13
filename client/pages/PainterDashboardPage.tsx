/**
 * PainterDashboardPage — protected page wrapper for the painter dashboard.
 *
 * Auth guard: redirects to /login if there is no active Supabase session.
 * Renders the full PainterDashboard component (client/components/dashboard/).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PainterDashboard from "@/components/dashboard/PainterDashboard";
import { Loader2 } from "lucide-react";

export default function PainterDashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login", { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#2E75B6]" />
      </div>
    );
  }

  return <PainterDashboard />;
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(PainterDashboardPage, {
      name: "PainterDashboardPage",
      inputs: [],
    });
  })
  .catch(() => {});
