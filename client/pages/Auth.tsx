import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ShieldCheck, Sparkles } from "lucide-react";
import { authenticate, setActiveUser, type AccountRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const intent = (params.get("intent") as AccountRole | null) || null;

  const [role, setRole] = useState<AccountRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = (localStorage.getItem("paintbook:lastLoginRole") as AccountRole | null) || intent;
    if (storedRole === "customer" || storedRole === "painter") {
      setRole(storedRole);
    }
  }, [intent]);

  useEffect(() => {
    const active = localStorage.getItem("paintbook:user");
    if (!active) return;
    try {
      const parsed = JSON.parse(active);
      if (parsed?.verifiedEmail) {
        navigate(parsed.activeRole === "painter" ? "/dashboard" : "/dashboard/customer", { replace: true });
      }
    } catch {
      /* ignore */
    }
  }, [navigate]);

  const roleLabel = useMemo(
    () => (role === "customer" ? "customer" : "painter/decorator"),
    [role],
  );

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    const result = authenticate(email, password);
    if (result.status === "not_found") {
      setError("No account found for this email. Complete a job or painter workflow to create one.");
      return;
    }
    if (result.status === "invalid_password") {
      setError("Incorrect password. Try again.");
      return;
    }

    const account = result.account;
    if (!account.roles.includes(role)) {
      setError(`This account is not registered as a ${roleLabel}.`);
      return;
    }

    setActiveUser(account, role);
    toast({
      title: "Welcome back",
      description:
        role === "customer"
          ? "Your customer dashboard is ready with your latest jobs and messages."
          : "Head to your painter dashboard to keep growing your business.",
    });
    navigate(role === "customer" ? "/dashboard/customer" : "/dashboard", { replace: true });
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-10 md:max-w-xl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Secure login for all roles
        </div>
        <h1 className="mt-3 text-2xl font-bold">Log in to PaintBook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customers create accounts automatically after posting a job or contacting a painter. Painters & decorators join via the dedicated onboarding workflow.
        </p>
      </div>

      <Card className="border-muted/60">
        <CardContent className="p-6">
          <div className="text-sm font-medium">I am logging in as</div>
          <ToggleGroup
            type="single"
            value={role}
            onValueChange={(value) => {
              if (value === "customer" || value === "painter") {
                setRole(value);
                localStorage.setItem("paintbook:lastLoginRole", value);
              }
            }}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <ToggleGroupItem value="customer" className="px-4 py-1 text-sm">
              Customer
            </ToggleGroupItem>
            <ToggleGroupItem value="painter" className="px-4 py-1 text-sm">
              Painter / decorator
            </ToggleGroupItem>
          </ToggleGroup>

          <form className="mt-6 grid gap-4" onSubmit={onLogin}>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11">Log in</Button>
          </form>

          <div className="mt-6 grid gap-2 rounded-lg bg-secondary/70 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> How sign-up works now
            </div>
            <p>
              • Customers finish a quick sign-up after posting a job or requesting a quote. We’ll prompt for any missing details to create your free dashboard.
            </p>
            <p>
              • Painters & decorators should use the <a className="underline" href="/join-painter">join workflow</a> to create their professional profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
