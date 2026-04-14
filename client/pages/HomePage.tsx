import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, Lock, Handshake, CheckCircle } from "lucide-react";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Background video — painters at work */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <video
          className="h-full w-full object-cover scale-105"
          autoPlay
          muted
          loop
          playsInline
          src="https://cdn.builder.io/o/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F2ba0324a63604c4fb1cddfae4fa8a84d?alt=media&token=8b7a4306-e600-43b0-8a83-ff8152892c2d&apiKey=4d3ba4dca12d422aaa4ee4ceafe37a1f"
        />
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/62 to-black/80" />
      </div>

      {/* Subtle grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center pt-16 animate-editorial-up">
        <div className="editorial-label text-white/40 mb-8 tracking-[0.2em]">
          UK Painters &amp; Decorators Marketplace
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.02] tracking-[-0.03em] mb-8">
          Paint.{" "}
          <em className="not-italic text-primary">Book.</em>{" "}
          Done.
        </h1>

        <p className="text-lg sm:text-xl text-white/75 max-w-xl mx-auto mb-10 leading-[1.7]">
          Find KYC-verified painters near you. Pay securely via FCA-authorised
          escrow. Guaranteed quality.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/register/customer"
            className="text-base font-semibold text-primary-foreground bg-primary px-8 py-4 w-full sm:w-auto text-center transition-opacity hover:opacity-90"
          >
            Find a Painter
          </Link>
          <Link
            to="/join-painter"
            className="text-base font-semibold px-8 py-4 w-full sm:w-auto text-center border border-white/40 text-white hover:border-white/70 transition-colors"
          >
            Join as a Painter
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
          {[
            { icon: BadgeCheck, label: "ID Verified Painters" },
            { icon: ShieldCheck, label: "Fully Insured" },
            { icon: Lock, label: "Escrow Protected" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </span>
          ))}
        </div>

        <p className="mt-8 text-xs text-white/30 editorial-label tracking-[0.15em]">
          Free to post · No hidden fees · Pay only when satisfied
        </p>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Post your job",
    description:
      "Describe your painting job, set your budget, and choose your preferred start date. Free to post — no commitments.",
  },
  {
    number: "02",
    title: "Get matched",
    description:
      "We automatically match your job to KYC-verified painters in your area based on skills, availability, and reviews.",
  },
  {
    number: "03",
    title: "Pay securely, confirm completion",
    description:
      "Confirm your painter by paying into FCA-authorised escrow. Funds are only released when you're satisfied.",
  },
];

function HowItWorks() {
  return (
    <section className="section-warm py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="editorial-label text-primary mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Simple process
          </p>
          <h2 className="font-display text-foreground max-w-xl">
            From estimate to booking,<br />in three steps.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0 border border-border/50">
          {STEPS.map(({ number, title, description }, i) => (
            <div
              key={number}
              className="group flex flex-col p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border/50 last:border-0 hover:bg-muted/40 transition-colors duration-300"
            >
              <span className="editorial-label text-primary mb-6">{number}</span>
              <h3 className="font-display text-xl mb-3 font-normal text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-[1.7] mb-6 flex-1">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/how-it-works/customers"
            className="text-sm font-medium text-primary hover:underline link-smooth"
          >
            See the full process →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Trust Signals ─────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    icon: BadgeCheck,
    title: "KYC Verified Painters",
    description:
      "Every painter passes identity, address, and insurance verification before joining the platform.",
  },
  {
    icon: ShieldCheck,
    title: "FCA Authorised Escrow",
    description:
      "All payments held by Transpact, an FCA-authorised escrow provider (Ref: 546279). PaintBookCo never holds funds.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Your payment is locked in escrow until you confirm the job is complete. You stay in control at every stage.",
  },
  {
    icon: Handshake,
    title: "Dispute Protection",
    description:
      "If something goes wrong, raise a dispute through your dashboard. Funds are frozen until resolved.",
  },
];

function TrustSignals() {
  return (
    <section className="section-light py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="editorial-label text-primary mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Built on trust
          </p>
          <h2 className="font-display text-foreground max-w-xl">
            Why customers choose PaintBookCo
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="surface-card p-6 flex flex-col"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-4 bg-muted">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-[1.7]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── For Painters ──────────────────────────────────────────────────────────────

const PAINTER_BENEFITS = [
  {
    title: "No subscription fees",
    description: "Zero upfront costs. Commission only on completed jobs — and it reduces as you grow.",
  },
  {
    title: "Matched jobs sent to you",
    description: "No bidding wars. The first verified painter to accept gets the job.",
  },
  {
    title: "Secure, guaranteed payment",
    description: "Every job is backed by FCA-authorised escrow. You get paid when the job is done.",
  },
];

function ForPainters() {
  return (
    <section className="section-dark py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="editorial-label text-white/35 mb-4 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current" />
              For painters
            </p>
            <h2 className="font-display text-white mb-6">
              Grow your painting business
            </h2>
            <p className="text-white/55 mb-8 leading-[1.7]">
              Join thousands of professional painters who use PaintBookCo to fill
              their diary with matched, verified jobs — and get paid securely every time.
            </p>
            <Link
              to="/join-painter"
              className="inline-block text-base font-semibold text-primary-foreground bg-primary px-8 py-4 transition-opacity hover:opacity-90"
            >
              Join as a Painter
            </Link>
          </div>

          <div className="space-y-0 border border-white/10">
            {PAINTER_BENEFITS.map(({ title, description }, i) => (
              <div
                key={title}
                className="flex gap-5 p-6 border-b border-white/10 last:border-0"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white mb-1">{title}</h4>
                  <p className="text-sm text-white/55 leading-[1.7]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TrustSignals />
      <ForPainters />
    </>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(HomePage, {
      name: "HomePage",
      inputs: [],
    });
  })
  .catch(() => {});
