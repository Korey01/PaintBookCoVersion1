import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Paintbrush, Search, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  function goToFind(params: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    if (params.location) q.set("location", params.location);
    if (params.type) q.set("type", params.type);
    setOpen(false);
    setQuery("");
    navigate(`/find-painter?${q.toString()}`);
  }

  function handleLogout() {
    localStorage.removeItem("paintbook:user");
    navigate("/auth");
  }

  return (
    <header className={`sticky top-0 z-40 w-full transition-all ${scrolled ? "backdrop-blur bg-background/70 border-b" : "bg-transparent"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label="PaintBookco home">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Ff85a8b4281414a85bdd042d944e0b3d9?format=webp&width=480"
            alt="PaintBookco logo"
            className="h-12 w-auto sm:h-14"
          />
          <span className="sr-only">PaintBookco</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/find-painter" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Find a Painter</NavLink>
          <NavLink to="/post-job" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Post a Job</NavLink>
          <NavLink to="/estimator" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Paint Estimator</NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>About</NavLink>
          <NavLink to="/trust-safety" className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Trust & Safety</NavLink>
          <NavLink to={`/dashboard${search || ""}`} className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "text-primary" : "text-foreground/80"}`}>Dashboard</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setOpen(true)}>
            <Search className="mr-2 h-4 w-4"/> Search
          </Button>
          {loggedIn ? (
            <Button className="shadow-md" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/> Log out
            </Button>
          ) : (
            <Button asChild className="shadow-md">
              <Link to="/join-painter"><LogIn className="mr-2 h-4 w-4"/> Join as Painter</Link>
            </Button>
          )}
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search by postcode/city or job type..."
          onValueChange={(v) => setQuery(v)}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {query && (
            <CommandGroup heading="Search">
              <CommandItem onSelect={() => goToFind({ location: query })}>
                Find painters in "{query}"
              </CommandItem>
            </CommandGroup>
          )}
          <CommandSeparator />
          <CommandGroup heading="Popular job types">
            <CommandItem onSelect={() => goToFind({ type: "interior" })}>Interior painting</CommandItem>
            <CommandItem onSelect={() => goToFind({ type: "exterior" })}>Exterior painting</CommandItem>
            <CommandItem onSelect={() => goToFind({ type: "kitchen" })}>Kitchen cabinets</CommandItem>
            <CommandItem onSelect={() => goToFind({ type: "wallpaper" })}>Wallpaper</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
