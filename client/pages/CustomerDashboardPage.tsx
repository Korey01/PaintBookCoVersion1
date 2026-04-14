/**
 * CustomerDashboardPage — renders the customer dashboard.
 * Auth + role guard is handled by ProtectedRoute in App.tsx.
 */
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default function CustomerDashboardPage() {
  return <CustomerDashboard />;
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(CustomerDashboardPage, { name: "CustomerDashboardPage", inputs: [] }); })
  .catch(() => {});
