import { Link } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

const CUSTOMER_FEATURES = [
  "No fees to post a job",
  "No platform fees on payments",
  "Pay only the agreed job value",
  "PaintBookCo covers the escrow fee",
  "Full dispute protection included",
];

const COMMISSION_TIERS = [
  { range: "Jobs 1 – 5", rate: "12%" },
  { range: "Jobs 6 – 10", rate: "10%" },
  { range: "Jobs 11+", rate: "8%" },
];

const PAINTER_FEATURES = [
  "No subscription fees",
  "No listing fees",
  "Commission only on completed jobs",
  "The more you work, the less you pay",
  "Secure guaranteed payment via escrow",
];

export default function PricingPage() {
  useEffect(() => { document.title = "Pricing | PaintBookCo"; }, []);

  const heroRef = useScrollAnimation();
  const cardsRef = useScrollAnimationList();
  const faqRef = useScrollAnimation();

  return (
    <div>
      <div className="h-16" />

      {/* Hero */}
      <section className="section-light py-28 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="editorial-label text-primary mb-6 animate-editorial-up flex items-center justify-center gap-3" style={{ animationFillMode: "both" }}>
            <span className="inline-block h-px w-8 bg-current" />
            Simple, transparent pricing
          </p>
          <h1 className="font-display text-foreground mb-6 animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            No surprises. Ever.
          </h1>
          <p className="text-lg text-muted-foreground leading-[1.8] animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Customers pay nothing extra. Painters pay commission only when they get paid.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="section-warm py-20 px-6">
        <div ref={cardsRef} className="mx-auto max-w-5xl grid md:grid-cols-2 gap-px bg-border/50 scroll-stagger">
          {/* Customers */}
          <div className="scroll-animate bg-background p-12 flex flex-col">
            <p className="editorial-label text-primary mb-4">For customers</p>
            <h2 className="font-display text-2xl text-foreground mb-2">Free for customers</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-[1.7]">
              Post jobs, get matched, pay via escrow — no fees charged to you.
            </p>
            <div className="flex items-baseline gap-2 mb-10">
              <span className="font-display text-6xl text-foreground">£0</span>
              <span className="text-muted-foreground text-sm">platform fee</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {CUSTOMER_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register/customer"
              className="group inline-flex items-center justify-center gap-2 bg-foreground text-background font-medium py-4 px-8 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01]"
            >
              Post a Job Free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Painters */}
          <div className="scroll-animate bg-foreground p-12 flex flex-col relative">
            <div className="absolute top-6 right-6 editorial-label text-foreground bg-primary px-3 py-1">
              Most popular
            </div>
            <p className="editorial-label text-white/35 mb-4">For painters</p>
            <h2 className="font-display text-2xl text-white mb-2">Commission only</h2>
            <p className="text-sm text-white/50 mb-8 leading-[1.7]">
              No upfront costs. Pay only when you get paid — and less as you grow.
            </p>
            <div className="mb-8 border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Completed jobs</th>
                    <th className="text-right px-5 py-3 text-white/40 font-medium">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TIERS.map(({ range, rate }, i) => (
                    <tr key={range} className={i < COMMISSION_TIERS.length - 1 ? "border-b border-white/10" : ""}>
                      <td className="px-5 py-3 text-white/70">{range}</td>
                      <td className="px-5 py-3 text-right font-semibold text-white">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {PAINTER_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/60">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/join-decorator"
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-4 px-8 transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
            >
              Join as a Decorator
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ nudge */}
      <section className="section-light py-20 px-6">
        <div ref={faqRef} className="mx-auto max-w-xl text-center scroll-animate">
          <h2 className="font-display text-foreground mb-3">Questions about pricing?</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-[1.7]">
            Visit our Help page for answers, or get in touch directly.
          </p>
          <div className="flex gap-6 justify-center">
            <Link to="/help" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">Help &amp; FAQ →</Link>
            <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">Contact us →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

  .catch(() => {});
