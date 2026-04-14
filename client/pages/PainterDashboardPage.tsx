/**
 * PainterDashboardPage — protected wrapper for the painter dashboard.
 * Auth guard is handled by ProtectedRoute (redirects to /login if no session).
 */
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PainterDashboard from "@/components/dashboard/PainterDashboard";

export default function PainterDashboardPage() {
  return (
    <ProtectedRoute>
      <PainterDashboard />
    </ProtectedRoute>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(PainterDashboardPage, { name: "PainterDashboardPage", inputs: [] }); })
  .catch(() => {});
