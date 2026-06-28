import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const LOGO = "https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png";

const NAV_LINKS = [
  { to: "/vestimator", label: "Vestimator" },
  { to: "/find-painters", label: "Find Painters" },
  { to: "/about", label: "About" },
  { to: "/trust-safety", label: "Trust & Safety" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const { user, role, signOut } = useAuth();

  useEffect(() => {
    setScrolled(window.scrollY > 60);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const transparent = isHome && !scrolled;
  const dashboardTo = role === "admin" ? "/admin-dashboard" : "/dashboard/painter";
  const dashboardLabel = role === "admin" ? "Admin" : "My Dashboard";

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
              src={LOGO}
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
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardTo}
                  className={[
                    "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 border transition-all duration-200",
                    transparent
                      ? "border-white/60 text-white/90 hover:border-white hover:text-white"
                      : "border-border text-foreground hover:bg-accent",
                  ].join(" ")}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {dashboardLabel}
                </Link>
                <button
                  onClick={signOut}
                  className={[
                    "text-sm transition-colors duration-200 px-2 py-1.5",
                    transparent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/join-painter"
                  className={[
                    "text-sm font-medium px-4 py-2 border transition-all duration-200 hover:scale-[1.02]",
                    transparent
                      ? "border-white/60 text-white/90 hover:border-white hover:text-white"
                      : "border-border text-foreground hover:bg-accent",
                  ].join(" ")}
                >
                  Join as a Decorator
                </Link>
                <Link
                  to="/post-job"
                  className={[
                    "text-sm font-medium px-5 py-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]",
                    transparent
                      ? "bg-white text-foreground"
                      : "bg-foreground text-background hover:bg-foreground/90",
                  ].join(" ")}
                >
                  Post a Job
                </Link>
              </>
            )}
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
            <img src={LOGO} alt="PaintBookCo" className="h-20 w-auto" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-6 py-8 flex-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="py-4 text-base font-medium text-foreground border-b border-border/50 hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-6 pb-6 space-y-3">
          {user ? (
            <>
              <Link
                to={dashboardTo}
                className="flex items-center justify-center gap-2 bg-foreground text-background font-medium py-4 w-full hover:bg-foreground/85 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {dashboardLabel}
              </Link>
              <button
                onClick={signOut}
                className="block w-full text-center border border-border text-foreground font-medium py-4 hover:bg-accent transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/post-job"
                className="block text-center bg-foreground text-background font-medium py-4 w-full hover:bg-foreground/85 transition-colors"
              >
                Post a Job
              </Link>
              <Link
                to="/join-painter"
                className="block text-center border border-border text-foreground font-medium py-4 w-full hover:bg-accent transition-colors"
              >
                Join as a Decorator
              </Link>
              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Painter Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

