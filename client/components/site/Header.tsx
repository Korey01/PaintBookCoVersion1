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
  const { search, pathname } = loc;
  const isHome   = pathname === "/";
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
    { to: "/vestimator",    label: "Estimate" },
    { to: "/about",         label: "About" },
    { to: "/trust-safety",  label: "Trust & Safety" },
    ...(loggedIn ? [{ to: "/dashboard/painter", label: "Dashboard" }] : []),
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? (isHome ? 'rgba(17,16,9,0.96)' : 'rgba(251,247,240,0.97)')
            : isHome
              ? 'linear-gradient(to bottom, rgba(17,16,9,0.7) 0%, transparent 100%)'
              : 'rgba(251,247,240,0.97)',
          borderBottom: scrolled
            ? (isHome ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(180,150,100,0.18)')
            : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo — left */}
          <Link
            to="/"
            aria-label="PaintBookco home"
            className="flex-shrink-0 transition-opacity duration-200 hover:opacity-75"
          >
            <img
              src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png"
              alt="PaintBookCo"
              className="h-7 w-auto transition-all duration-300"
              style={{ filter: isHome ? "brightness(0) invert(1)" : "none" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </Link>

          {/* Nav — center (desktop) */}
          <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-8 md:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium pb-0.5 transition-colors duration-200 ${
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`
                }
                style={{ color: isHome ? '#F5F0E8' : '#1A1A14' }}
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
              className="md:hidden p-2 transition-colors"
              style={{ color: isHome ? 'rgba(245,240,232,0.7)' : 'rgba(26,26,20,0.7)' }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Join as a Decorator */}
            <Link
              to="/join-painter"
              className="hidden lg:inline-flex text-sm font-medium transition-colors duration-200"
              style={{ color: isHome ? 'rgba(245,240,232,0.55)' : 'rgba(26,26,20,0.55)' }}
            >
              Join as a Decorator
            </Link>

            {/* Post a Job — primary CTA */}
            <Link
              to="/post-job"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#D85A30', color: '#F5F0E8', borderRadius: '4px' }}
            >
              Post a Job
            </Link>

            {loggedIn && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: isHome ? 'rgba(245,240,232,0.4)' : 'rgba(26,26,20,0.4)' }}
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
                src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png"
                alt="PaintBookCo"
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
              <Link to="/join-decorator" onClick={() => setMobileOpen(false)}>
                Join as a Decorator
              </Link>
            </Button>
            {loggedIn ? (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 text-sm text-foreground/50 hover:text-foreground py-2 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            ) : (
              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Painter/Decorator Login
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
