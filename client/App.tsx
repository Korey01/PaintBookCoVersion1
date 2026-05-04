import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";

// ── Layout ──────────────────────────────────────────────────────────────────────
import Layout from "@/components/site/Layout";
const PublicLayout = lazy(() => import("@/components/layout/PublicLayout"));

// ── Standalone self-contained pages (own header/footer, no shared layout) ───────
const PostJob = lazy(() => import("./pages/PostJob"));
const PostJobConfirmation = lazy(() => import("./pages/PostJob").then(m => ({ default: m.PostJobConfirmation })));
const JobSessionPage = lazy(() => import("./pages/JobSessionPage"));
import LoginPage from "./pages/LoginPage";
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
import ConfirmPage from "./pages/ConfirmPage";

// ── Auth / protected pages ───────────────────────────────────────────────────────
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import KYCPainter from "./pages/KYCPainter";
import AdminDashboard from "./pages/AdminDashboard";
const AdminFallback = lazy(() => import("./pages/AdminFallback"));
const PainterDashboardPage = lazy(() => import("./pages/PainterDashboardPage"));

// ── Public layout pages ──────────────────────────────────────────────────────────
import HomePage from "./pages/HomePage";
const HowItWorksCustomers = lazy(() => import("./pages/HowItWorksCustomers"));
const HowItWorksPainters = lazy(() => import("./pages/HowItWorksPainters"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const JoinPainter = lazy(() => import("./pages/JoinPainter"));
const JoinPainterComplete = lazy(() => import("./pages/JoinPainter").then(m => ({ default: m.JoinPainterComplete })));

// ── Legacy layout pages (original animated Layout) ───────────────────────────────
const FindPainters = lazy(() => import("./pages/FindPainters"));
const PainterProfile = lazy(() => import("./pages/PainterProfile"));
const TrustSafety = lazy(() => import("./pages/TrustSafety"));
const PainterOnboarding = lazy(() => import("./pages/PainterOnboarding").then(m => ({ default: m.PainterOnboarding })));
const PaintVestimator = lazy(() => import("./pages/PaintVestimator"));

const queryClient = new QueryClient();

function LegacyLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        }>
          <BrowserRouter>
            <Routes>

              {/* ── New public pages (canonical brand Header + Footer) ── */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/how-it-works/customers" element={<HowItWorksCustomers />} />
                <Route path="/how-it-works/painters" element={<HowItWorksPainters />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />
                <Route path="/join-decorator" element={<JoinPainter />} />
                <Route path="/join-decorator/completed" element={<JoinPainterComplete />} />
                <Route path="/join-painter" element={<Navigate to="/join-decorator" replace />} />
                <Route path="/join-painter/completed" element={<Navigate to="/join-decorator/completed" replace />} />
              </Route>

              {/* ── Standalone pages (self-contained, no shared layout) ── */}
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/post-job/confirmation" element={<PostJobConfirmation />} />
              <Route path="/job/:token" element={<JobSessionPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/confirm" element={<ConfirmPage />} />
              <Route path="/auth/callback" element={<Navigate to="/confirm" replace />} />

              {/* ── Auth / protected pages ── */}
              <Route path="/kyc/painter" element={
                <ProtectedRoute><KYCPainter /></ProtectedRoute>
              } />
              <Route path="/confirm-kyc" element={<Navigate to="/dashboard/painter?tab=insurance" replace />} />
              <Route path="/admin-dashboard" element={
                <AdminRoute><AdminDashboard /></AdminRoute>
              } />
              <Route path="/admin-fallback" element={
                <AdminRoute><AdminFallback /></AdminRoute>
              } />
              <Route path="/dashboard/painter" element={
                <ProtectedRoute requiredRole="painter">
                  <RealtimeProvider>
                    <PainterDashboardPage />
                  </RealtimeProvider>
                </ProtectedRoute>
              } />

              {/* ── Legacy pages (original animated Layout) ── */}
              <Route element={<LegacyLayout />}>
                <Route path="/find-painters" element={<FindPainters />} />
                <Route path="/find-painter" element={<Navigate to="/find-painters" replace />} />
                <Route path="/trust-safety" element={<TrustSafety />} />
                <Route path="/painter/:id" element={<PainterProfile />} />
                <Route path="/vestimator" element={<PaintVestimator />} />
                <Route path="/painter-onboarding" element={<PainterOnboarding />} />
                <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
                <Route path="/painter-dashboard" element={<Navigate to="/dashboard/painter" replace />} />
              </Route>

              {/* ── 404 ── */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
