/**
 * CustomerDashboardPage — protected wrapper for the customer dashboard.
 * Auth guard is handled by ProtectedRoute (redirects to /login if no session).
 */
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute>
      <CustomerDashboard />
    </ProtectedRoute>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(CustomerDashboardPage, { name: "CustomerDashboardPage", inputs: [] }); })
  .catch(() => {});
