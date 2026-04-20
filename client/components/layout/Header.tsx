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
    setScrolled(window.scrollY > 60);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const transparent = isHome && !scrolled;

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          transparent
            ? "bg-transparent border-b border-transparent"
            : "bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-[0_1px_0_0_hsl(var(--border)/0.5)]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link
            to="/"
            aria-label="PaintBookCo home"
            className="flex-shrink-0 transition-opacity duration-200 hover:opacity-75"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200"
              alt="PaintBookCo"
              className={`h-20 w-auto transition-all duration-300 ${transparent ? "brightness-[10]" : ""}`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={[
                  "nav-underline text-sm font-medium transition-colors duration-300",
                  transparent
                    ? "text-white/80 hover:text-white nav-underline-light"
                    : "text-foreground/70 hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className={[
                "text-sm font-medium transition-colors duration-300",
                transparent ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground",
              ].join(" ")}
            >
              Log In
            </Link>
            <Link
              to="/register/customer"
              className={[
                "text-sm font-medium px-5 py-2.5 transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]",
                transparent
                  ? "bg-white text-foreground"
                  : "bg-foreground text-background",
              ].join(" ")}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={[
              "md:hidden p-2 transition-colors duration-200",
              transparent ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground",
            ].join(" ")}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={[
          "fixed inset-0 z-[60] bg-background flex flex-col transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/" aria-label="PaintBookCo home">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200"
              alt="PaintBookCo"
              className="h-20 w-auto"
            />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-6 py-8">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="py-4 text-base font-medium text-foreground border-b border-border/50 hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            to="/login"
            className="py-4 text-base font-medium text-foreground border-b border-border/50 hover:text-primary transition-colors"
          >
            Log In
          </Link>
        </nav>

        <div className="px-6 mt-auto pb-10">
          <Link
            to="/register/customer"
            className="block text-center bg-foreground text-background font-medium py-4 w-full hover:bg-foreground/85 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(Header, { name: "PublicHeader", inputs: [] }); })
  .catch(() => {});
