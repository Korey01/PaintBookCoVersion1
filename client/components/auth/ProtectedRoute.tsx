/**
 * ProtectedRoute — auth guard with optional role-based protection.
 *
 * Behaviour:
 *  • loading  → spinner (waits for both session AND role to resolve)
 *  • no user  → redirect to /login
 *  • wrong role → redirect to the user's correct dashboard
 *  • correct  → render children
 */
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "painter" | "customer";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

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

  // User is on the wrong dashboard — silently redirect them to the right one
  if (requiredRole && role && role !== requiredRole) {
    return (
      <Navigate
        to={role === "painter" ? "/dashboard/painter" : "/dashboard/customer"}
        replace
      />
    );
  }

  return <>{children}</>;
}
