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
            <Route path="/post-job" element={<Placeholder />} />
            <Route path="/estimator" element={<Placeholder />} />
            <Route path="/join-painter" element={<Placeholder />} />
            <Route path="/dashboard" element={<Placeholder />} />
            <Route path="/help" element={<Placeholder />} />
            <Route path="/privacy" element={<Placeholder />} />
            <Route path="/terms" element={<Placeholder />} />
            <Route path="/cookies" element={<Placeholder />} />
            <Route path="/painter/:id" element={<Placeholder />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
