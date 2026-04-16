import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";

// ── Legacy layout + pages ──────────────────────────────────────────────────────
import Layout from "@/components/site/Layout";
import Index from "./pages/Index";
import FindPainters from "./pages/FindPainters";
import Placeholder from "./pages/Placeholder";
import Estimator from "./pages/Estimator";
import PostJob, { PostJobConfirmation } from "./pages/PostJob";
import PainterProfile from "./pages/PainterProfile";
import Checkout from "./pages/Checkout";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import Dashboard from "./pages/Dashboard";
import TrustSafety from "./pages/TrustSafety";
import EscrowCustomerDemo from "./pages/EscrowCustomerDemo";
import EscrowPainterDemo from "./pages/EscrowPainterDemo";
import PaintVisualizer from "./pages/PaintVisualizer";
import Vestimator from "./pages/Vestimator";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import CustomerDashboard from "./pages/CustomerDashboard";
import DashboardRouter from "./pages/DashboardRouter";
import Disputes from "./pages/Disputes";
import PaymentHistory from "./pages/PaymentHistory";
import About from "./pages/About";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Account from "./pages/Account";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import Estimates from "./pages/Estimates";
import Admin from "./pages/Admin";
import { PainterOnboarding } from "./pages/PainterOnboarding";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFallback from "./pages/AdminFallback";
import AuthPage from "./pages/AuthPage";
import PainterDashboard from "./pages/PainterDashboard";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
      <RealtimeProvider>
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
            <Route path="/join-painter" element={<JoinPainter />} />
            <Route path="/join-painter/completed" element={<JoinPainterComplete />} />
          </Route>

          {/* ── Auth pages (no shared layout — self-contained) ── */}
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/kyc/painter" element={<KYCPainter />} />
          <Route path="/kyc/customer" element={<KYCCustomer />} />
          <Route path="/vestimator" element={<PaintVestimator />} />

          {/* ── Dashboard pages — role-protected ── */}
          <Route path="/dashboard/customer" element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/painter" element={
            <ProtectedRoute requiredRole="painter">
              <PainterDashboardPage />
            </ProtectedRoute>
          } />

          {/* ── Legacy pages (original animated Layout) ── */}
          <Route element={<LegacyLayout />}>
            <Route path="/legacy" element={<Index />} />
            <Route path="/find-painter" element={<FindPainters />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/post-job/confirmation" element={<PostJobConfirmation />} />
            <Route path="/vestimator" element={<Vestimator />} />
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
            <Route path="/painter-onboarding" element={<PainterOnboarding />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-fallback" element={<AdminFallback />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/account" element={<Account />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/estimates/saved" element={<Estimates />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="/visualizer" element={<PaintVisualizer />} />
            <Route path="/escrow-demo/customer" element={<EscrowCustomerDemo />} />
            <Route path="/escrow-demo/painter" element={<EscrowPainterDemo />} />
            <Route path="/painter/:id" element={<PainterProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth-new" element={<AuthPage />} />
            <Route path="/painter-dashboard" element={<PainterDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
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
      </RealtimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
