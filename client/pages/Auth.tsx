import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Mail, User2, Sparkles } from "lucide-react";

interface User {
  email: string;
  password: string;
  roles: ("painter"|"customer")[];
  verifiedEmail: boolean;
  mfaEnabled: boolean;
  activeRole?: "painter"|"customer";
}

export default function Auth(){
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const intent = params.get('intent'); // e.g., painter|customer

  const [role, setRole] = useState<"painter"|"customer">((intent as any)||"customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [code, setCode] = useState("");
  const [requireMfa, setRequireMfa] = useState(false);

  useEffect(()=>{
    // if already logged in, go to dashboard
    const u = JSON.parse(localStorage.getItem('paintbook:user')||'null');
    if(u && u.verifiedEmail){ navigate('/dashboard'); }
  },[]);

  function saveUser(u: User){
    localStorage.setItem('paintbook:user', JSON.stringify(u));
  }

  function onSignup(e: React.FormEvent){
    e.preventDefault();
    if(!email || !password || !agree) return;
    const u: User = { email, password, roles: [role], verifiedEmail: true, mfaEnabled: false, activeRole: role };
    saveUser(u);
    navigate('/dashboard');
  }

  function onLogin(e: React.FormEvent){
    e.preventDefault();
    const u: User = JSON.parse(localStorage.getItem('paintbook:user')||'null');
    if(!u || u.email !== email || u.password !== password){
      alert('Invalid credentials (mock)');
      return;
    }
    if(!u.verifiedEmail){
      navigate(`/verify-email?email=${encodeURIComponent(email)}&next=/dashboard`);
      return;
    }
    if(u.mfaEnabled){
      setRequireMfa(true);
      return;
    }
    u.activeRole = u.activeRole || (u.roles.includes('painter') ? 'painter' : 'customer');
    saveUser(u);
    navigate('/dashboard');
  }

  function onVerifyMfa(e: React.FormEvent){
    e.preventDefault();
    if(code.length < 6) return;
    const u: User = JSON.parse(localStorage.getItem('paintbook:user')||'null');
    if(!u) return;
    u.activeRole = u.activeRole || (u.roles.includes('painter') ? 'painter' : 'customer');
    saveUser(u);
    navigate('/dashboard');
  }

  function social(provider: string){
    const fakeEmail = `${provider}@example.com`;
    const u: User = { email: fakeEmail, password: 'oauth', roles: [role], verifiedEmail: true, mfaEnabled: role==='painter', activeRole: role };
    saveUser(u);
    navigate(role==='painter'?'/join-painter':'/customer-dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-10 grid gap-6 md:max-w-xl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5"/> Unified accounts for Painters & Customers</div>
        <h1 className="mt-3 text-2xl font-bold">Sign up or Log in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Security-first with email verification and optional 2FA.</p>
      </div>

      <Card className="border-muted/60">
        <CardContent className="p-6">
          <div className="grid gap-3">
            <div className="text-sm font-medium">Choose your role</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Button variant={role==='customer'?'default':'outline'} onClick={()=>setRole('customer')}><User2 className="mr-2 h-4 w-4"/> Customer</Button>
              <Button variant={role==='painter'?'default':'outline'} onClick={()=>setRole('painter')}><Badge className="mr-2">Pro</Badge> Painter</Button>
            </div>
          </div>

          <Tabs defaultValue="signup" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="signup" className="mt-4">
              <form className="grid gap-3" onSubmit={onSignup}>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 text-xs"><Checkbox id="agree" checked={agree} onCheckedChange={(v)=>setAgree(!!v)} /><Label htmlFor="agree">I agree to the <a className="underline" href="/terms">Terms</a> and <a className="underline" href="/privacy">Privacy Policy</a>.</Label></div>
                <Button type="submit">Create account</Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant="outline" onClick={()=>social('google')}>Google</Button>
                  <Button type="button" variant="outline" onClick={()=>social('apple')}>Apple</Button>
                  <Button type="button" variant="outline" onClick={()=>social('facebook')}>Facebook</Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="login" className="mt-4">
              {!requireMfa ? (
                <form className="grid gap-3" onSubmit={onLogin}>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} />
                  </div>
                  <div className="text-xs text-muted-foreground"><a href="#" onClick={(e)=>{e.preventDefault(); alert('Password reset email sent (mock).');}}>Forgot password?</a></div>
                  <Button type="submit">Log in</Button>
                </form>
              ) : (
                <form className="grid gap-3" onSubmit={onVerifyMfa}>
                  <div className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4"/> Enter 6‑digit code from your authenticator app</div>
                  <Input placeholder="123 456" value={code} onChange={(e)=>setCode(e.target.value)} />
                  <Button type="submit">Verify & continue</Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> GDPR‑friendly mock. No real data is sent.</div>
        </CardContent>
      </Card>
    </div>
  );
}
