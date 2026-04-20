import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";

// ── Legacy layout + pages ──────────────────────────────────────────────────────
import Layout from "@/components/site/Layout";
import Index from "./pages/Index";
import FindPainters from "./pages/FindPainters";
import Estimator from "./pages/Estimator";
import PostJob, { PostJobConfirmation } from "./pages/PostJob";
import PainterProfile from "./pages/PainterProfile";
import Checkout from "./pages/Checkout";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import TrustSafety from "./pages/TrustSafety";
import EscrowCustomerDemo from "./pages/EscrowCustomerDemo";
import EscrowPainterDemo from "./pages/EscrowPainterDemo";
import PaintVisualizer from "./pages/PaintVisualizer";
import VerifyEmail from "./pages/VerifyEmail";
import DashboardRouter from "./pages/DashboardRouter";
import Disputes from "./pages/Disputes";
import PaymentHistory from "./pages/PaymentHistory";
import Account from "./pages/Account";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import Estimates from "./pages/Estimates";
import Admin from "./pages/Admin";
import { PainterOnboarding } from "./pages/PainterOnboarding";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFallback from "./pages/AdminFallback";
import AuthPage from "./pages/AuthPage";
import B2BFindPainter from "./pages/B2BFindPainter";
import B2BConsultation from "./pages/B2BConsultation";
import B2BConfirmation from "./pages/B2BConfirmation";
import B2BConsultationConfirmation from "./pages/B2BConsultationConfirmation";
import CommercialTestimonials from "./pages/CommercialTestimonials";
import JoinPainter, { JoinPainterComplete } from "./pages/JoinPainter";

// ── New public layout + pages ──────────────────────────────────────────────────
import PublicLayout from "@/components/layout/PublicLayout";
import HomePage from "./pages/HomePage";
import HowItWorksCustomers from "./pages/HowItWorksCustomers";
import HowItWorksPainters from "./pages/HowItWorksPainters";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterCustomer from "./pages/RegisterCustomer";
import LoginPage from "./pages/LoginPage";
import ResetPassword from "./pages/ResetPassword";
import ConfirmPage from "./pages/ConfirmPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import PainterDashboardPage from "./pages/PainterDashboardPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PostJobPage from "./pages/PostJobPage";
import ChatPage from "./pages/ChatPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmCompletionPage from "./pages/ConfirmCompletionPage";
import ChooseRole from "./pages/ChooseRole";
;
import AdminRoute from "@/components/auth/AdminRoute";
import KYCPainter from "./pages/KYCPainter";
import KYCCustomer from "./pages/KYCCustomer";
import PaintVestimator from "./pages/PaintVestimator";

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
          <Route path="/confirm-kyc" element={<Navigate to="/dashboard/painter" replace />} />
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
            <Route path="/post-job" element={<PostJob />} />
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
        </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
