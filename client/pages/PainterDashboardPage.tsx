/**
 * PainterDashboardPage — renders the painter dashboard.
 * Auth + role guard is handled by ProtectedRoute in App.tsx.
 */
import PainterDashboard from "@/components/dashboard/PainterDashboard";

export default function PainterDashboardPage() {
  return <PainterDashboard />;
}

  .catch(() => {});
