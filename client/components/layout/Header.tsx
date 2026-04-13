import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/how-it-works/customers", label: "How It Works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent on homepage until scrolled; always white elsewhere
  const headerBg =
    isHome && !scrolled
      ? "bg-transparent"
      : "bg-white shadow-sm border-b border-gray-100";

  const textColor = isHome && !scrolled ? "text-white" : "text-gray-700";
  const hoverColor = isHome && !scrolled ? "hover:text-white/80" : "hover:text-[#1B3A5C]";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
        style={{ fontFamily: "Arial, system-ui, sans-serif" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Wordmark */}
          <Link
            to="/"
            className={`text-xl font-bold tracking-tight transition-colors ${
              isHome && !scrolled ? "text-white" : "text-[#1B3A5C]"
            }`}
          >
            PaintBookCo
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTAs — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
            >
              Log In
            </Link>
            <Link
              to="/register/customer"
              className="text-sm font-semibold text-white px-5 py-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded transition-colors ${textColor}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div
            className="flex items-center justify-between h-16 px-6 border-b border-gray-100"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-bold text-[#1B3A5C]"
            >
              PaintBookCo
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            className="flex flex-col px-6 py-8 gap-0"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-base font-medium text-gray-700 border-b border-gray-100 hover:text-[#1B3A5C] transition-colors"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="py-4 text-base font-medium text-gray-700 border-b border-gray-100 hover:text-[#1B3A5C] transition-colors"
            >
              Log In
            </Link>
          </nav>

          <div className="px-6 mt-auto pb-8">
            <Link
              to="/register/customer"
              onClick={() => setMobileOpen(false)}
              className="block text-center text-white font-semibold py-3 w-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(Header, {
      name: "PublicHeader",
      inputs: [],
    });
  })
  .catch(() => {});
