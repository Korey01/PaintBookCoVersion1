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

// ── Legacy layout + pages ──────────────────────────────────────────────────────
import Layout from "@/components/site/Layout";
const Index = lazy(() => import("./pages/Index"));
const FindPainters = lazy(() => import("./pages/FindPainters"));
const Estimator = lazy(() => import("./pages/Estimator"));
const PostJob = lazy(() => import("./pages/PostJob"));
const PostJobConfirmation = lazy(() => import("./pages/PostJob").then(m => ({ default: m.PostJobConfirmation })));
const PainterProfile = lazy(() => import("./pages/PainterProfile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutConfirmation = lazy(() => import("./pages/CheckoutConfirmation"));
const TrustSafety = lazy(() => import("./pages/TrustSafety"));
const EscrowCustomerDemo = lazy(() => import("./pages/EscrowCustomerDemo"));
const EscrowPainterDemo = lazy(() => import("./pages/EscrowPainterDemo"));
const PaintVisualizer = lazy(() => import("./pages/PaintVisualizer"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
const Disputes = lazy(() => import("./pages/Disputes"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const Account = lazy(() => import("./pages/Account"));
const Messages = lazy(() => import("./pages/Messages"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Estimates = lazy(() => import("./pages/Estimates"));
const Admin = lazy(() => import("./pages/Admin"));
const PainterOnboarding = lazy(() => import("./pages/PainterOnboarding").then(m => ({ default: m.PainterOnboarding })));
import AdminDashboard from "./pages/AdminDashboard";
const AdminFallback = lazy(() => import("./pages/AdminFallback"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const B2BFindPainter = lazy(() => import("./pages/B2BFindPainter"));
const B2BConsultation = lazy(() => import("./pages/B2BConsultation"));
const B2BConfirmation = lazy(() => import("./pages/B2BConfirmation"));
const B2BConsultationConfirmation = lazy(() => import("./pages/B2BConsultationConfirmation"));
const CommercialTestimonials = lazy(() => import("./pages/CommercialTestimonials"));
const JoinPainter = lazy(() => import("./pages/JoinPainter"));
const JoinPainterComplete = lazy(() => import("./pages/JoinPainter").then(m => ({ default: m.JoinPainterComplete })));

// ── New public layout + pages ──────────────────────────────────────────────────
const PublicLayout = lazy(() => import("@/components/layout/PublicLayout"));
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
const RegisterCustomer = lazy(() => import("./pages/RegisterCustomer"));
import LoginPage from "./pages/LoginPage";
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
import ConfirmPage from "./pages/ConfirmPage";
const CustomerDashboardPage = lazy(() => import("./pages/CustomerDashboardPage"));
const PainterDashboardPage = lazy(() => import("./pages/PainterDashboardPage"));
import ProtectedRoute from "@/components/auth/ProtectedRoute"
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const ConfirmCompletionPage = lazy(() => import("./pages/ConfirmCompletionPage"));
const ChooseRole = lazy(() => import("./pages/ChooseRole"));
;
import AdminRoute from "@/components/auth/AdminRoute";
import KYCPainter from "./pages/KYCPainter";
const KYCCustomer = lazy(() => import("./pages/KYCCustomer"));
const PaintVestimator = lazy(() => import("./pages/PaintVestimator"));

const queryClient = new QueryClient();

// Wrapper so the legacy Layout (which takes children) works as a route element
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
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/join-decorator" element={<JoinPainter />} />
            <Route path="/join-decorator/completed" element={<JoinPainterComplete />} />
            <Route path="/join-painter" element={<Navigate to="/join-decorator" replace />} />
            <Route path="/join-painter/completed" element={<Navigate to="/join-decorator/completed" replace />} />
          </Route>

          {/* ── Auth pages (no shared layout — self-contained) ── */}
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/auth/callback" element={<Navigate to="/confirm" replace />} />
          <Route path="/kyc/painter" element={
            <ProtectedRoute><KYCPainter /></ProtectedRoute>
          } />
          <Route path="/confirm-kyc" element={<Navigate to="/dashboard/painter?tab=insurance" replace />} />
          <Route path="/kyc/customer" element={
            <ProtectedRoute><KYCCustomer /></ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin-fallback" element={
            <AdminRoute><AdminFallback /></AdminRoute>
          } />
          <Route path="/vestimator" element={<PaintVestimator />} />

          {/* ── Dashboard pages — role-protected ── */}
          <Route path="/dashboard/customer" element={
            <ProtectedRoute requiredRole="customer">
              <RealtimeProvider>
                <CustomerDashboardPage />
              </RealtimeProvider>
            </ProtectedRoute>
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
            <Route path="/legacy" element={<Index />} />
            <Route path="/find-painter" element={<FindPainters />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/post-job/confirmation" element={<PostJobConfirmation />} />
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
            <Route path="/painter-onboarding" element={<PainterOnboarding />} />

            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
            <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/estimates/saved" element={<ProtectedRoute><Estimates /></ProtectedRoute>} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="/visualizer" element={<PaintVisualizer />} />
            <Route path="/escrow-demo/customer" element={<EscrowCustomerDemo />} />
            <Route path="/escrow-demo/painter" element={<EscrowPainterDemo />} />
            <Route path="/painter/:id" element={<PainterProfile />} />
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/auth-new" element={<AuthPage />} />
            <Route path="/painter-dashboard" element={<Navigate to="/dashboard/painter" replace />} />
            <Route path="/customer-dashboard" element={<Navigate to="/dashboard/customer" replace />} />
            {/* B2B routes */}
            <Route path="/b2b/find-painter" element={<B2BFindPainter />} />
            <Route path="/b2b/consultation" element={<B2BConsultation />} />
            <Route path="/b2b/confirmation" element={<B2BConfirmation />} />
            <Route path="/b2b/consultation-confirmation" element={<B2BConsultationConfirmation />} />
            <Route path="/commercial-painting-projects/testimonials" element={<CommercialTestimonials />} />
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
