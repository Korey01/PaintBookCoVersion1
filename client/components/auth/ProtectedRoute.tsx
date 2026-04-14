/**
 * ProtectedRoute — wraps any page that requires an authenticated session.
 *
 * • Shows a spinner while the auth state is being resolved.
 * • Redirects to /login (replacing history) if there is no active session.
 * • Renders children once the user is confirmed.
 *
 * Usage:
 *   <Route path="/dashboard/customer" element={
 *     <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
 *   } />
 */
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
