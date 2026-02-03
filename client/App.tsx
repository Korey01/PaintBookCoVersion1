import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import Layout from "@/components/site/Layout";
import FindPainters from "./pages/FindPainters";
import Placeholder from "./pages/Placeholder";
import Estimator from "./pages/Estimator";
import PostJob, { PostJobConfirmation } from "./pages/PostJob";
import PainterProfile from "./pages/PainterProfile";
import JoinPainter, { JoinPainterComplete } from "./pages/JoinPainter";
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
import AuthPage from "./pages/AuthPage";
import PainterDashboard from "./pages/PainterDashboard";
import B2BFindPainter from "./pages/B2BFindPainter";
import B2BConsultation from "./pages/B2BConsultation";
import B2BConfirmation from "./pages/B2BConfirmation";
import B2BConsultationConfirmation from "./pages/B2BConsultationConfirmation";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/find-painter" element={<FindPainters />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/post-job/confirmation" element={<PostJobConfirmation />} />
            <Route path="/vestimator" element={<Vestimator />} />
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
            <Route path="/join-painter" element={<JoinPainter />} />
            <Route path="/join-painter/completed" element={<JoinPainterComplete />} />
            <Route path="/painter-onboarding" element={<PainterOnboarding />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
            <Route path="/dashboard/painter" element={<Dashboard />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/help" element={<Support />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/account" element={<Account />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/estimates/saved" element={<Estimates />} />
            <Route path="/about" element={<About />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="/visualizer" element={<PaintVisualizer />} />
            <Route path="/escrow-demo/customer" element={<EscrowCustomerDemo />} />
            <Route path="/escrow-demo/painter" element={<EscrowPainterDemo />} />
            <Route path="/painter/:id" element={<PainterProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth-new" element={<AuthPage />} />
            <Route path="/painter-dashboard" element={<PainterDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />

            {/* B2B Commercial Routes */}
            <Route path="/b2b/find-painter" element={<B2BFindPainter />} />
            <Route path="/b2b/consultation" element={<B2BConsultation />} />
            <Route path="/b2b/confirmation" element={<B2BConfirmation />} />
            <Route path="/b2b/consultation-confirmation" element={<B2BConsultationConfirmation />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
