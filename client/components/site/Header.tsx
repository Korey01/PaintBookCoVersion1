import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Paintbrush, Search, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full transition-all ${scrolled ? "backdrop-blur bg-background/70 border-b" : "bg-transparent"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Paintbrush className="h-5 w-5" />
          </span>
          <span className="text-xl">PaintBook</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/find-painter" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Find a Painter</NavLink>
          <NavLink to="/post-job" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Post a Job</NavLink>
          <NavLink to="/estimator" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Paint Estimator</NavLink>
          <NavLink to={`/dashboard${search || ""}`} className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Dashboard</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate("/find-painter")}> <Search className="mr-2 h-4 w-4"/> Search</Button>
          <Button asChild className="shadow-md">
            <Link to="/join-painter"><LogIn className="mr-2 h-4 w-4"/> Join as Painter</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
