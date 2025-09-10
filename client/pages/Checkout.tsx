import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CreditCard, Lock, Sparkles } from "lucide-react";

export default function Checkout(){
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const mode = params.get("mode") || "subscription"; // subscription | booking
  const plan = params.get("plan") || "Starter";
  const painter = params.get("painter") || "";
  const amountParam = Number(params.get("amount") || "");

  const amount = useMemo(()=>{
    if (mode === "subscription") {
      if (plan === 'Customer Plus') return 5;
      return plan.toLowerCase() === "premium" ? 35 : plan.toLowerCase() === "professional" ? 20 : 10;
    }
    if (amountParam && amountParam > 0) return amountParam;
    const jobs = JSON.parse(localStorage.getItem('paintbook:jobs')||'[]');
    const last = jobs[jobs.length-1] || {};
    const base = Number(last.budgetMax || last.budgetMin || 500);
    const pct = 0.3 + Math.random()*0.1; // 30–40%
    return Math.round(base * pct);
  }, [mode, plan, amountParam]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);

  function submit(e: React.FormEvent){
    e.preventDefault();
    if(!name || !email || card.length < 12 || !expiry || cvc.length < 3) return;
    setProcessing(true);
    setTimeout(()=>{
      const ref = `pay_${Date.now()}`;
      const rec = { ref, mode, plan, painter, amount, name, email, createdAt: new Date().toISOString(), provider: "stripe", status: "succeeded" };
      const list = JSON.parse(localStorage.getItem("paintbook:payments")||"[]");
      list.unshift(rec);
      localStorage.setItem("paintbook:payments", JSON.stringify(list));
      if(mode === "subscription"){
        const prof = JSON.parse(localStorage.getItem('paintbook:joinPainter')||'{}');
        localStorage.setItem('paintbook:joinPainter', JSON.stringify({ ...prof, subscription: { plan, status: 'active', startedAt: new Date().toISOString(), ref } }));
      }
      setProcessing(false);
      navigate(`/checkout/confirmation?ref=${ref}`);
    }, 900);
  }

  return (
    <div className="container mx-auto px-4 py-10 grid gap-6 md:max-w-2xl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5"/> Powered by Stripe</div>
        <h1 className="mt-3 text-2xl font-bold">{mode === 'subscription' ? `Subscribe to ${plan}` : `Secure deposit for booking`}</h1>
        {mode === 'booking' && (
          <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/> Escrow protected: deposit held until job completion.</p>
        )}
      </div>

      <Card className="border-muted/60">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-xl font-extrabold">£{amount}</div>
          </div>
          {mode === 'subscription' && (
            <div className="mt-1 text-xs text-muted-foreground">Plan: {plan} · Billed monthly · Cancel anytime</div>
          )}
          {mode === 'booking' && painter && (
            <div className="mt-1 text-xs text-muted-foreground">Booking painter: <Badge variant="secondary">{painter}</Badge></div>
          )}

          <form className="mt-6 grid gap-3" onSubmit={submit}>
            <div>
              <Label>Cardholder name</Label>
              <Input placeholder="Jane Doe" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="jane@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Card number</Label>
              <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                <CreditCard className="h-4 w-4 text-muted-foreground"/>
                <Input placeholder="4242 4242 4242 4242" value={card} onChange={(e)=>setCard(e.target.value)} className="border-0 focus-visible:ring-0"/>
              </div>
              <div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5"/> Securely processed by Stripe</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" value={expiry} onChange={(e)=>setExpiry(e.target.value)} />
              </div>
              <div>
                <Label>CVC</Label>
                <Input placeholder="123" value={cvc} onChange={(e)=>setCvc(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={processing}>{processing ? 'Processing…' : (mode==='subscription' ? 'Start subscription' : 'Pay deposit')}</Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">This is a mock checkout for demo purposes. No real charges are made.</p>
    </div>
  );
}
