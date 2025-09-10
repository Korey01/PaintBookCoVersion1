import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, BadgeCheck, Star, Shield, HardHat, PaintRoller } from "lucide-react";

export default function TrustSafety(){
  useEffect(()=>{ document.title = "Trust & Safety | PaintBook"; },[]);
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5"/> Trust & Safety
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Your Paint Job, Protected.</h1>
            <p className="mt-3 text-muted-foreground">At PaintBook, trust and safety are built into every job — for both painters and customers.</p>
            <Button asChild size="lg" className="mt-6">
              <Link to="#learn">Learn How PaintBook Keeps You Safe</Link>
            </Button>
          </div>
        </div>
      </section>

      <div id="learn" className="container mx-auto grid gap-8 px-4 py-10 md:py-14">
        {/* Escrow Deposit Protection */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700"><Lock className="h-5 w-5"/></div>
              <div>
                <div className="text-lg font-semibold">Your Money Held Securely Until the Job is Complete.</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>When you book a painter, 100% of your payment is securely held in escrow.</li>
                  <li>Funds are only released to the painter once you confirm the job is satisfactorily completed.</li>
                  <li>Protected via Stripe (FCA-regulated payment partner) for maximum peace of mind.</li>
                </ul>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                  <div className="rounded-md bg-blue-50 p-3"><strong>Customer benefit:</strong> pay once, approve when happy — your money stays protected until completion.</div>
                  <div className="rounded-md bg-green-50 p-3"><strong>Painter benefit:</strong> guaranteed funds in escrow eliminates late or missed payments.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funds Flow Infographic */}
        <Card>
          <CardContent className="p-6">
            <div className="text-lg font-semibold">How funds flow</div>
            <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <div className="rounded-lg border bg-card p-4 text-center">
                <div className="text-sm font-medium">Customer</div>
                <div className="mt-1 text-xs text-muted-foreground">Pays securely</div>
              </div>
              <div className="text-center">→</div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <div className="text-sm font-medium">Escrow</div>
                <div className="mt-1 text-xs text-muted-foreground">Escrow via Stripe (FCA-regulated payment partner)</div>
              </div>
              <div className="text-center">→</div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <div className="text-sm font-medium">Painter</div>
                <div className="mt-1 text-xs text-muted-foreground">Released on approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Painters & Portfolios */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-700"><BadgeCheck className="h-5 w-5"/></div>
              <div>
                <div className="text-lg font-semibold">Work with Verified Professionals.</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Every painter uploads original job photos which are automatically filtered to prevent stock or online images.</li>
                  <li>Painters undergo identity and insurance checks before receiving the <span className="inline-flex items-center gap-1"><Badge variant="outline">Verified Painter</Badge></span> badge.</li>
                  <li>Tiered subscription badges show painter experience level.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparent Reviews & Ratings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700"><Star className="h-5 w-5"/></div>
              <div>
                <div className="text-lg font-semibold">Real Reviews from Real Jobs.</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Reviews and ratings are tied to actual completed jobs — no fake reviews allowed.</li>
                  <li>Top-rated painters are rewarded with badges and higher visibility.</li>
                  <li>Customers can report fraudulent reviews easily.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Privacy & GDPR Compliance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-sky-100 p-2 text-sky-700"><Shield className="h-5 w-5"/></div>
              <div>
                <div className="text-lg font-semibold">Your Data, Your Privacy.</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>PaintBook uses GDPR-compliant tools to protect personal and financial information.</li>
                  <li>All payment details are encrypted and never stored in plain text.</li>
                  <li>Customers can request full data deletion at any time.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaint & Dispute Resolution */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700"><ShieldCheck className="h-5 w-5"/></div>
              <div>
                <div className="text-lg font-semibold">Quick, Fair and Transparent Dispute Resolution.</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>If there’s an issue with a painter or job, customers can lodge a complaint directly from their dashboard.</li>
                  <li>PaintBook mediates disputes and, if necessary, holds funds in escrow until a fair resolution is reached.</li>
                  <li>Dedicated Dispute Officers review each case within 48 hours.</li>
                </ul>
                <div className="mt-3 text-sm">
                  <Button asChild variant="secondary"><Link to="/disputes">Open Dispute</Link></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700"><HardHat className="h-5 w-5"/></div>
              <div>
                <div className="text-lg font-semibold">Stay Safe on PaintBook</div>
                <p className="mt-2 text-sm text-muted-foreground">PaintBook is built to protect painters and customers alike. Follow these simple steps to make every job safe, transparent and successful.</p>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <li className="flex items-start gap-2"><PaintRoller className="mt-0.5 h-4 w-4 text-emerald-600"/> Use Escrow for all payments — never pay cash outside the platform.</li>
                  <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600"/> Verify painter profiles and look for the Verified Painter badge.</li>
                  <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-emerald-600"/> Agree on scope in writing before confirming.</li>
                  <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600"/> Communicate in‑app so messages are tracked for resolution.</li>
                  <li className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 text-emerald-600"/> Report concerns immediately from your dashboard.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      <section className="bg-blue-50">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold">PaintBook brings peace of mind to every paint job.</h2>
          <p className="mt-2 text-sm text-muted-foreground">Whether you’re a customer or painter, our platform protects you from start to finish.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild><Link to="/auth">Join PaintBook Safely</Link></Button>
            <Button asChild variant="secondary"><Link to="/find-painter">Explore Verified Painters</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
