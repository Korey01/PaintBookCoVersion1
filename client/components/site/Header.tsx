import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LogIn, LogOut, Menu } from "lucide-react";
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
    <header className={`sticky top-0 z-40 w-full transition-all ${scrolled ? "backdrop-blur bg-background/70 border-b" : "bg-transparent"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="PaintBookco home">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F23ef8c15575b454ba7eb57dbb05e2918?format=webp&width=800"
            alt="PaintBookco logo"
            className="h-12 w-auto sm:h-14 drop-shadow-md contrast-110 saturate-110"
          />
          <span className="sr-only">PaintBookco</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/find-painter" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Find a Painter</NavLink>
          <NavLink to="/post-job" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Post a Job</NavLink>
          <NavLink to="/vestimator" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Vestimator</NavLink>
                    <NavLink to="/about" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>About</NavLink>
          <NavLink to="/trust-safety" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Trust & Safety</NavLink>
          {loggedIn && (
            <NavLink to={`/dashboard${search || ""}`} className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Dashboard</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="md:hidden" onClick={()=>setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5"/>
          </Button>
          {!loggedIn && (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth"><LogIn className="mr-2 h-4 w-4"/> Log in / Sign up</Link>
            </Button>
          )}
          {loggedIn ? (
            <Button className="shadow-md" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/> Log out
            </Button>
          ) : (
            <Button asChild className="shadow-md">
              <Link to="/join-painter"><span className="sr-only">Join as Painter</span><span>Join as Painter</span></Link>
            </Button>
          )}
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] p-4">
          <nav className="grid gap-3 text-sm">
            <Link to="/find-painter" onClick={()=>setMobileOpen(false)}>Find a Painter</Link>
            <Link to="/post-job" onClick={()=>setMobileOpen(false)}>Post a Job</Link>
            <Link to="/vestimator" onClick={()=>setMobileOpen(false)}>Vestimator</Link>
                        <Link to="/trust-safety" onClick={()=>setMobileOpen(false)}>Trust & Safety</Link>
            {loggedIn && <Link to={`/dashboard${search||""}`} onClick={()=>setMobileOpen(false)}>Dashboard</Link>}
            {loggedIn ? (
              <Button variant="outline" onClick={()=>{ setMobileOpen(false); handleLogout(); }} className="mt-2">
                <LogOut className="mr-2 h-4 w-4"/> Log out
              </Button>
            ) : (
              <>
                <Button asChild className="mt-2" variant="ghost"><Link to="/auth" onClick={()=>setMobileOpen(false)}><LogIn className="mr-2 h-4 w-4"/> Log in / Sign up</Link></Button>
                <Button asChild className="mt-2"><Link to="/join-painter" onClick={()=>setMobileOpen(false)}>Join as Painter</Link></Button>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
