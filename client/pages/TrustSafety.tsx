import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, BadgeCheck, Star, Shield, HardHat, PaintRoller } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection, { AnimatedItem } from "@/components/site/AnimatedSection";

export default function TrustSafety() {
  useEffect(() => { document.title = "Trust & Safety | PaintBook"; }, []);

  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fe373f3566e7b48a3aa37582912b385f7?format=webp&width=1600"
          alt="Professional painter smoothing a wall while wearing safety gear"
          className="h-[480px] w-full object-cover brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-16 px-6 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-medium text-primary mb-4">
                <ShieldCheck className="h-3.5 w-3.5" /> Trust & Safety
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-[1.1] max-w-2xl">
                Your Paint Job,<br />Protected.
              </h1>
              <p className="mt-5 text-white/70 text-lg max-w-xl leading-relaxed">
                At PaintBook, trust and safety are built into every job — for both painters and customers.
              </p>
              <Button asChild size="lg" className="mt-8">
                <a href="#learn">How PaintBook Keeps You Safe</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section id="learn" className="section-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 space-y-6">

          {/* Escrow */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 bg-primary/10 p-3 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-3">Your Money Held Securely Until the Job is Complete.</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>When you book a painter, 100% of your payment is securely held in escrow.</li>
                    <li>Escrow is optional — you can opt in per job and you cover any escrow service fees.</li>
                    <li>Funds are only released to the painter once you confirm the job is satisfactorily completed.</li>
                    <li>Protected via Stripe (FCA-regulated payment partner) for maximum peace of mind.</li>
                  </ul>
                  <div className="mt-5 grid gap-3 text-xs text-muted-foreground md:grid-cols-2">
                    <div className="bg-muted/50 border border-border/40 p-4">
                      <strong className="text-foreground">Customer benefit:</strong> pay once, approve when happy — your money stays protected until completion.
                    </div>
                    <div className="bg-primary/5 border border-primary/10 p-4">
                      <strong className="text-foreground">Painter benefit:</strong> guaranteed funds in escrow eliminates late or missed payments.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Funds Flow */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8">
              <h2 className="text-xl font-semibold mb-6">How funds flow</h2>
              <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                {[
                  { label: "Customer", sub: "Pays securely" },
                  null,
                  { label: "Escrow", sub: "Held via Stripe (FCA-regulated)" },
                  null,
                  { label: "Painter", sub: "Released on approval" },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} className="text-center text-muted-foreground font-light text-2xl">→</div>
                  ) : (
                    <div key={item.label} className="border border-border/50 p-5 text-center">
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{item.sub}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* Verified Painters */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 bg-primary/10 p-3 text-primary">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Work with Verified Professionals.</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Every painter uploads original job photos which are automatically filtered to prevent stock or online images.</li>
                    <li>Painters undergo identity and insurance checks before receiving the Verified Painter badge.</li>
                    <li>Tiered subscription badges show painter experience level.</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Reviews */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 bg-primary/10 p-3 text-primary">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Real Reviews from Real Jobs.</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>Reviews and ratings are tied to actual completed jobs — no fake reviews allowed.</li>
                    <li>Top-rated painters are rewarded with badges and higher visibility.</li>
                    <li>Customers can report fraudulent reviews easily.</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Data Privacy */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 bg-foreground/8 p-3 text-foreground">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Your Data, Your Privacy.</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>PaintBook uses GDPR-compliant tools to protect personal and financial information.</li>
                    <li>All payment details are encrypted and never stored in plain text.</li>
                    <li>Customers can request full data deletion at any time.</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Dispute Resolution */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 bg-primary/10 p-3 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Quick, Fair and Transparent Dispute Resolution.</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li>If there's an issue with a painter or job, customers can lodge a complaint directly from their dashboard.</li>
                    <li>PaintBook mediates disputes and, if necessary, holds funds in escrow until a fair resolution is reached.</li>
                    <li>Dedicated Dispute Officers review each case within 48 hours.</li>
                  </ul>
                  <div className="mt-5">
                    <Button asChild variant="outline" size="sm"><Link to="/disputes">Open Dispute</Link></Button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Safety Tips */}
          <AnimatedSection variant="fade-up">
            <div className="border border-border/50 p-8">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 bg-primary/10 p-3 text-primary">
                  <HardHat className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Stay Safe on PaintBook</h2>
                  <p className="text-sm text-muted-foreground mb-5">Follow these simple steps to make every job safe, transparent and successful.</p>
                  <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                    {[
                      { icon: PaintRoller, text: "Use Escrow for all payments — never pay cash outside the platform." },
                      { icon: BadgeCheck, text: "Verify painter profiles and look for the Verified Painter badge." },
                      { icon: Shield, text: "Agree on scope in writing before confirming." },
                      { icon: ShieldCheck, text: "Communicate in‑app so messages are tracked for resolution." },
                      { icon: Lock, text: "Report concerns immediately from your dashboard." },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-dark">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="scale-up" className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-normal text-white mb-4">
              PaintBook brings peace of mind to every paint job.
            </h2>
            <p className="text-white/55 mb-8">
              Whether you're a customer or painter, our platform protects you from start to finish.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button asChild size="lg"><Link to="/login">Join PaintBook Safely</Link></Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10"><Link to="/find-painter">Explore Verified Painters</Link></Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
