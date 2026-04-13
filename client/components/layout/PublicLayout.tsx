import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "@/components/site/CookieConsent";

/**
 * PublicLayout — wraps all new public-facing pages with the
 * canonical Header, Footer, and CookieConsent banner.
 *
 * Used in App.tsx as a nested route layout element:
 *   <Route element={<PublicLayout />}>
 *     <Route path="/pricing" element={<PricingPage />} />
 *     ...
 *   </Route>
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
