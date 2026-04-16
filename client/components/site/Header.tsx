import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn]     = useState(false);
  const loc      = useLocation();
  const { search } = loc;
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setLoggedIn(!!session?.user); }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const navLinks = [
    { to: "/vestimator",   label: "Estimate" },
    { to: "/find-painter", label: "Find Painters" },
    { to: "/about",        label: "About" },
    { to: "/trust-safety", label: "Trust & Safety" },
    ...(loggedIn ? [{ to: `/dashboard${search || ""}`, label: "Dashboard" }] : []),
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-[0_1px_0_0_hsl(var(--border)/0.5)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo — left */}
          <Link
            to="/"
            aria-label="PaintBookco home"
            className="flex-shrink-0 transition-opacity duration-200 hover:opacity-75"
          >
            <img
              src="/logo.png"
              alt="PaintBookco"
              className="h-7 w-auto"
            />
          </Link>

          {/* Nav — center (desktop) */}
          <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-8 md:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-underline text-sm font-medium pb-0.5 transition-colors duration-200 ${
                    isActive
                      ? "text-foreground active"
                      : "text-foreground/60 hover:text-foreground"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTAs — right */}
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Join as Painter */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex text-foreground/70 hover:text-foreground"
            >
              <Link to="/join-painter">Join as Painter</Link>
            </Button>

            {/* Post a Job — primary CTA */}
            <Button
              asChild
              variant="default"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link to="/post-job">Post a Job</Link>
            </Button>

            {loggedIn && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't sit under fixed header */}
      <div className="h-16" />

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full max-w-xs p-0 border-l border-border/40">
          <div className="flex items-center justify-between px-6 h-16 border-b border-border/40">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <img
                src="/logo.png"
                alt="PaintBookco"
                className="h-6 w-auto"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8 gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-base font-medium text-foreground/70 hover:text-foreground border-b border-border/30 transition-colors duration-200 last:border-0"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-6 space-y-3">
            <Button asChild variant="default" size="lg" className="w-full">
              <Link to="/post-job" onClick={() => setMobileOpen(false)}>
                Post a Job
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/join-painter" onClick={() => setMobileOpen(false)}>
                Join as Painter
              </Link>
            </Button>
            {loggedIn && (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 text-sm text-foreground/50 hover:text-foreground py-2 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
