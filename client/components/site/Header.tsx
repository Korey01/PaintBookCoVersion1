import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LogOut, Menu, Paintbrush2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const { search } = loc;
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("paintbook:user") || "null");
    setLoggedIn(!!u);
  }, [loc.pathname, loc.search, loc.hash]);

  function handleLogout() {
    localStorage.removeItem("paintbook:user");
    navigate("/auth");
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Animated paint-stripe accent bar at very top */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(42 96% 52%) 35%, hsl(var(--secondary)) 65%, hsl(var(--accent)) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 4s linear infinite",
        }}
      />

      {/* Main nav bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-background/85 border-b border-border/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold tracking-tight group"
            aria-label="PaintBookco home"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800"
              alt="PaintBookco logo"
              className="h-[2.1rem] w-auto sm:h-[2.45rem] drop-shadow-md contrast-110 saturate-110 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="sr-only">PaintBookco</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {[
              { to: "/vestimator", label: "Estimate" },
              { to: "/about", label: "About" },
              { to: "/trust-safety", label: "Trust & Safety" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative text-sm font-semibold transition-colors duration-200 group ${
                    isActive ? "text-primary" : "text-foreground/75 hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {/* Animated underline — brush-stroke style */}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-[2.5px] rounded-full bg-primary transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {loggedIn && (
              <NavLink
                to={`/dashboard${search || ""}`}
                className={({ isActive }) =>
                  `relative text-sm font-semibold transition-colors duration-200 group ${
                    isActive ? "text-primary" : "text-foreground/75 hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Dashboard
                    <span
                      className={`absolute -bottom-0.5 left-0 h-[2.5px] rounded-full bg-primary transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            )}
          </nav>

          {/* Desktop CTAs */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Join as Painter — outline secondary */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex"
            >
              <Link to="/join-painter">
                <Paintbrush2 className="h-3.5 w-3.5" />
                Join as Painter
              </Link>
            </Button>

            {/* Post a Job — gradient paint button */}
            <Button
              asChild
              variant="paint"
              size="sm"
              className="hidden sm:inline-flex rounded-full"
            >
              <Link to="/post-job">Post a Job</Link>
            </Button>

            {loggedIn && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="hidden sm:inline-flex"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
          {/* Sheet header accent */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
            }}
          />
          <div className="p-6">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="mb-6 block"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800"
                alt="PaintBookco logo"
                className="h-[2.1rem] w-auto"
              />
            </Link>

            <nav className="flex flex-col gap-1 text-sm">
              {[
                { to: "/vestimator", label: "Estimate" },
                { to: "/about", label: "About" },
                { to: "/trust-safety", label: "Trust & Safety" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-foreground/80 transition-all hover:bg-primary/8 hover:text-primary"
                >
                  {label}
                </Link>
              ))}

              {loggedIn && (
                <Link
                  to={`/dashboard${search || ""}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold text-foreground/80 transition-all hover:bg-primary/8 hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <Button asChild variant="paint" className="w-full rounded-full">
                <Link to="/post-job" onClick={() => setMobileOpen(false)}>
                  Post a Job
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/join-painter" onClick={() => setMobileOpen(false)}>
                  <Paintbrush2 className="h-4 w-4" />
                  Join as Painter
                </Link>
              </Button>
            </div>

            {loggedIn && (
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="mt-3 w-full"
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
