import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, Lock, Handshake, CheckCircle, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

// ── Shared label ──────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="editorial-label text-primary mb-4 flex items-center gap-3">
      <span className="inline-block h-px w-8 bg-current" />
      {children}
    </p>
  );
}

const VIDEO_SRC =
  "https://cdn.builder.io/o/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F2ba0324a63604c4fb1cddfae4fa8a84d?alt=media&token=8b7a4306-e600-43b0-8a83-ff8152892c2d&apiKey=4d3ba4dca12d422aaa4ee4ceafe37a1f";

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[hsl(var(--section-dark-bg))]">
      {/* Background video */}
      <video
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover scale-105"
        autoPlay
        muted
        loop
        playsInline
        src={VIDEO_SRC}
      />
      {/* Dark scrim — keeps text legible over the video */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/45" />

      <div className="relative z-10 mx-auto max-w-4xl text-center pt-16">
        {/* Eyebrow — clip-reveal on load */}
        <p
          className="editorial-label text-white/35 mb-10 tracking-[0.2em] animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          UK Painters &amp; Decorators Marketplace
        </p>

        {/* Headline — staggered word slide-up */}
        <h1
          className="font-display text-[clamp(2.8rem,8vw,6rem)] text-white leading-[1.0] tracking-[-0.03em] mb-8"
          style={{ animationFillMode: "both" }}
        >
          {["Paint.", "Book.", "Done."].map((word, i) => (
            <span
              key={word}
              className="inline-block animate-editorial-up"
              style={{
                animationDelay: `${0.2 + i * 0.15}s`,
                animationFillMode: "both",
                marginRight: "0.25em",
                color: i === 1 ? "hsl(var(--primary))" : undefined,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Sub-copy */}
        <p
          className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto leading-[1.7] mb-12 animate-editorial-up"
          style={{ animationDelay: "0.65s", animationFillMode: "both" }}
        >
          Find KYC-verified painters near you. Pay securely via FCA-authorised
          escrow. Guaranteed quality on every job.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-editorial-up"
          style={{ animationDelay: "0.8s", animationFillMode: "both" }}
        >
          <Link
            to="/register/customer"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-base px-8 py-4 w-full sm:w-auto justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_hsl(18_88%_52%_/_0.4)]"
          >
            Find a Painter
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/join-painter"
            className="inline-flex items-center gap-2 border border-white/25 text-white/80 font-medium text-base px-8 py-4 w-full sm:w-auto justify-center hover:border-white/50 hover:text-white transition-all duration-200"
          >
            Join as a Painter
          </Link>
        </div>

        {/* Trust row */}
        <div
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/40 animate-fade-in"
          style={{ animationDelay: "1s", animationFillMode: "both" }}
        >
          {[
            { icon: BadgeCheck, label: "ID Verified Painters" },
            { icon: ShieldCheck, label: "Fully Insured" },
            { icon: Lock, label: "Escrow Protected" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary/70" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1.4s", animationFillMode: "both" }}>
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent animate-scroll-bounce" />
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
const STEPS = [
  { number: "01", title: "Post your job", description: "Describe your painting job, set your budget, and choose your preferred start date. Free to post — no commitments." },
  { number: "02", title: "Get matched", description: "Our system matches your job to KYC-verified painters in your area based on skills, availability, and reviews." },
  { number: "03", title: "Pay securely", description: "Confirm your painter by paying into FCA-authorised escrow. Funds release only when you confirm the work is complete." },
];

function HowItWorks() {
  const ref = useScrollAnimationList();
  return (
    <section className="section-warm py-28 sm:py-36 px-6">
      <div className="mx-auto max-w-6xl">
        <div ref={useScrollAnimation()} className="scroll-animate mb-20">
          <Label>Simple process</Label>
          <h2 className="font-display text-foreground max-w-lg">
            From estimate to booking, in three steps.
          </h2>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-0 border border-border/50 scroll-stagger">
          {STEPS.map(({ number, title, description }, i) => (
            <div
              key={number}
              className="scroll-animate group flex flex-col p-10 border-b md:border-b-0 md:border-r border-border/50 last:border-0 hover:bg-background transition-colors duration-300"
            >
              <span className="editorial-label text-primary mb-8">{number}</span>
              <h3 className="font-display text-xl font-normal text-foreground mb-4">{title}</h3>
              <p className="text-sm text-muted-foreground leading-[1.8] flex-1">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 scroll-animate" ref={useScrollAnimation()}>
          <Link to="/how-it-works/customers" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 group">
            See the full process
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Trust Signals ─────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: BadgeCheck, title: "KYC Verified Painters", description: "Every painter passes identity, address, and insurance verification before joining." },
  { icon: ShieldCheck, title: "FCA Authorised Escrow", description: "All payments held by Transpact (FCA Ref: 546279). PaintBookCo never holds your funds." },
  { icon: Lock, title: "Secure Payments", description: "Your payment is locked in escrow until you confirm the job is complete." },
  { icon: Handshake, title: "Dispute Protection", description: "If something goes wrong, raise a dispute — funds are frozen until resolved." },
];

function TrustSignals() {
  const ref = useScrollAnimationList();
  return (
    <section className="section-light py-28 sm:py-36 px-6">
      <div className="mx-auto max-w-6xl">
        <div ref={useScrollAnimation()} className="scroll-animate mb-20">
          <Label>Built on trust</Label>
          <h2 className="font-display text-foreground max-w-lg">
            Why customers choose PaintBookCo
          </h2>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-stagger">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="scroll-animate surface-card p-8 flex flex-col"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-6 bg-muted">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-3">{title}</h3>
              <p className="text-xs text-muted-foreground leading-[1.8]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── For Painters ──────────────────────────────────────────────────────────────
const PAINTER_BENEFITS = [
  { title: "No subscription fees", description: "Zero upfront costs. Commission only on completed jobs — and it reduces as you grow." },
  { title: "Matched jobs sent to you", description: "No bidding wars. The first verified painter to accept gets the job." },
  { title: "Secure, guaranteed payment", description: "Every job is backed by FCA-authorised escrow. You get paid when the job is done." },
];

function ForPainters() {
  const ref = useScrollAnimation();
  return (
    <section className="section-dark py-28 sm:py-36 px-6">
      <div ref={ref} className="mx-auto max-w-6xl scroll-animate">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <Label>
              <span className="text-white/35">For painters</span>
            </Label>
            <h2 className="font-display text-white mb-8">
              Grow your painting business
            </h2>
            <p className="text-white/50 leading-[1.8] mb-10 max-w-md">
              Join thousands of professional painters who use PaintBookCo to
              fill their diary with matched, verified jobs — and get paid
              securely every time.
            </p>
            <Link
              to="/join-painter"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-8 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_hsl(18_88%_52%_/_0.4)] group"
            >
              Join as a Painter
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="space-y-0 border border-white/8">
            {PAINTER_BENEFITS.map(({ title, description }) => (
              <div key={title} className="flex gap-5 p-8 border-b border-white/8 last:border-0 hover:bg-white/[0.03] transition-colors duration-200">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-white mb-1.5">{title}</h4>
                  <p className="text-sm text-white/45 leading-[1.7]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Band ──────────────────────────────────────────────────────────────────
function CTABand() {
  const ref = useScrollAnimation();
  return (
    <section className="section-warm py-28 sm:py-36 px-6">
      <div ref={ref} className="mx-auto max-w-3xl text-center scroll-animate">
        <Label>Ready to begin</Label>
        <h2 className="font-display text-foreground mb-6">
          Your perfect painter is one click away.
        </h2>
        <p className="text-muted-foreground leading-[1.8] mb-10 max-w-md mx-auto">
          Post your job for free. No commitment. Verified painters send
          quotes — you choose the best fit.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register/customer"
            className="group inline-flex items-center gap-2 bg-foreground text-background font-medium px-8 py-4 w-full sm:w-auto justify-center transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.02]"
          >
            Post a Job Free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/how-it-works/customers"
            className="inline-flex items-center gap-2 border border-foreground/30 text-foreground font-medium px-8 py-4 w-full sm:w-auto justify-center hover:border-foreground/60 transition-all duration-200"
          >
            Learn how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  useEffect(() => { document.title = "PaintBookCo | Hire Verified Painters"; }, []);
  return (
    <>
      <Hero />
      <HowItWorks />
      <TrustSignals />
      <ForPainters />
      <CTABand />
    </>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(HomePage, { name: "HomePage", inputs: [] }); })
  .catch(() => {});
