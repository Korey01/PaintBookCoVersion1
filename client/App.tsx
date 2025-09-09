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
import Dashboard from "./pages/Dashboard";

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
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/join-painter" element={<JoinPainter />} />
            <Route path="/join-painter/completed" element={<JoinPainterComplete />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/help" element={<Placeholder />} />
            <Route path="/privacy" element={<Placeholder />} />
            <Route path="/terms" element={<Placeholder />} />
            <Route path="/cookies" element={<Placeholder />} />
            <Route path="/painter/:id" element={<PainterProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
