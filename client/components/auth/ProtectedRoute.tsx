/**
 * ProtectedRoute — auth guard with role-based protection and KYC status.
 *
 * Behaviour:
 *  • loading  → spinner (waits for both session AND role to resolve)
 *  • no user  → redirect to /login
 *  • wrong role → redirect to the user's correct dashboard
 *  • pending KYC → redirect to KYC page
 *  • correct  → render children
 */
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "painter" | "customer";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading, kycStatus, painterProfile, customerProfile } = useAuth();

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

  // Role fully resolved — redirect if on the wrong dashboard
  if (requiredRole && role !== null && role !== requiredRole) {
    return (
      <Navigate
        to={role === "painter" ? "/dashboard/painter" : "/dashboard/customer"}
        replace
      />
    );
  }

  // If role is still null (still resolving) keep showing spinner
  if (requiredRole && role === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Check KYC status for painters
  if (role === "painter" && painterProfile?.kyc_status === "pending") {
    return <Navigate to="/kyc/painter" replace />;
  }

  // Check KYC status for customers
  if (role === "customer" && customerProfile?.kyc_status === "pending") {
    return <Navigate to="/kyc/customer" replace />;
  }

  return <>{children}</>;
}
