import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "@/components/site/CookieConsent";

export default function PublicLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // Smooth page fade transition on route change
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 300ms ease-out, transform 300ms ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main ref={mainRef} className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
