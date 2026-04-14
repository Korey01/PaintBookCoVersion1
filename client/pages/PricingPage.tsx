import { Link } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

const CUSTOMER_FEATURES = [
  "No fees to post a job",
  "No platform fees",
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
  useEffect(() => {
    document.title = "Pricing | PaintBookCo";
  }, []);

  return (
    <div>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section className="section-light py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="editorial-label text-primary mb-4 flex items-center justify-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Simple, transparent pricing
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
            No surprises. Ever.
          </h1>
          <p className="text-lg text-muted-foreground leading-[1.7]">
            Customers pay nothing extra. Painters pay commission only when they
            get paid.
          </p>
        </div>
      </section>

      {/* Pricing columns */}
      <section className="section-warm py-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* For Customers */}
          <div className="bg-card border border-border p-10 flex flex-col">
            <div className="mb-8">
              <p className="editorial-label text-primary mb-3">For customers</p>
              <h2 className="font-display text-3xl text-foreground mb-2">
                Free for customers
              </h2>
              <p className="text-muted-foreground text-sm">
                Post jobs, get matched, pay via escrow — no fees charged to you.
              </p>
            </div>

            <div className="flex items-end gap-1 mb-8">
              <span className="font-display text-5xl text-foreground">£0</span>
              <span className="text-muted-foreground text-sm pb-2">platform fee</span>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
              {CUSTOMER_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register/customer"
              className="block text-center text-primary-foreground bg-primary font-semibold py-3 px-6 transition-opacity hover:opacity-90"
            >
              Post a Job
            </Link>
          </div>

          {/* For Painters */}
          <div className="border-2 border-primary p-10 flex flex-col relative bg-card">
            <div className="absolute -top-3 left-8 text-xs font-semibold text-primary-foreground bg-primary px-3 py-1">
              Most popular
            </div>

            <div className="mb-8">
              <p className="editorial-label text-primary mb-3">For painters</p>
              <h2 className="font-display text-3xl text-foreground mb-2">
                Commission only
              </h2>
              <p className="text-muted-foreground text-sm">
                No upfront costs. Pay only when you get paid — and less as you grow.
              </p>
            </div>

            {/* Commission table */}
            <div className="mb-8 border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Completed jobs
                    </th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                      Commission rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TIERS.map(({ range, rate }, i) => (
                    <tr
                      key={range}
                      className={i < COMMISSION_TIERS.length - 1 ? "border-b border-border" : ""}
                    >
                      <td className="px-4 py-3 text-foreground">{range}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
              {PAINTER_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/join-painter"
              className="block text-center text-primary-foreground bg-primary font-semibold py-3 px-6 transition-opacity hover:opacity-90"
            >
              Join as a Painter
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-light py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-xl text-foreground mb-3">
            Questions about pricing?
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-[1.7]">
            Visit our Help page for answers, or get in touch directly.
          </p>
          <div className="flex gap-6 justify-center">
            <Link to="/help" className="text-sm font-medium text-primary hover:underline">
              Help &amp; FAQ →
            </Link>
            <Link to="/contact" className="text-sm font-medium text-primary hover:underline">
              Contact us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(PricingPage, {
      name: "PricingPage",
      inputs: [],
    });
  })
  .catch(() => {});
