import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ShieldCheck, Scale, Star, Eye, Lock, Banknote, MapPin, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

const DIFFERENTIATORS = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals Only",
    body: "Every painter on PaintBookCo has passed our rigorous KYC verification process — identity checks, address verification, public liability insurance confirmation, and portfolio validation. No exceptions. If a painter isn't verified, they aren't on our platform.",
  },
  {
    icon: Lock,
    title: "Secure Payments, Always",
    body: "All payments on PaintBookCo are processed through Transpact, our FCA-authorised escrow partner. Your money is held securely until you confirm the job is complete — not a moment before. You are always in control.",
  },
  {
    icon: Banknote,
    title: "No Subscriptions. No Hidden Fees.",
    body: "Painters pay nothing to join and nothing to receive job notifications. We operate on a simple commission model — we only earn when a job is successfully completed. Our success is directly tied to yours.",
  },
  {
    icon: MapPin,
    title: "Built for the UK",
    body: "PaintBookCo is designed specifically for the UK market, operating under UK law, with UK-regulated payment infrastructure, and UK-based data storage. Every aspect of the platform has been built with UK consumers and tradespeople in mind.",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description: "Every interaction on PaintBookCo is built on verified identity, secure payments, and transparent processes. Trust is not assumed — it is earned and verified.",
  },
  {
    icon: Scale,
    title: "Fairness",
    description: "We charge a tiered commission that reduces as painters grow with us. The more jobs you complete through PaintBookCo, the less commission you pay. We grow together.",
  },
  {
    icon: Star,
    title: "Quality",
    description: "We do not compromise on the standard of painters admitted to our platform. A verified PaintBookCo painter is a professional you can rely on.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "No hidden fees. No surprise charges. No ambiguity about where your money goes or how our platform works.",
  },
];

export default function AboutPage() {
  useEffect(() => { document.title = "About | PaintBookCo"; }, []);

  const whoRef = useScrollAnimation();
  const diffHeaderRef = useScrollAnimation();
  const diffGridRef = useScrollAnimationList();
  const howRef = useScrollAnimation();
  const commitRef = useScrollAnimation();
  const valuesHeaderRef = useScrollAnimation();
  const valuesRef = useScrollAnimationList();
  const teamRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  return (
    <div>
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <p className="editorial-label text-white/35 mb-8 animate-editorial-up" style={{ animationFillMode: "both" }}>
            About PaintBookCo
          </p>
          <h1 className="font-display text-white mb-8 max-w-2xl animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            Building trust between customers and professional painters
          </h1>
          <p className="text-lg text-white/50 leading-[1.8] max-w-2xl animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            PaintBookCo is a UK digital marketplace built exclusively for professional painters and decorators — making the process of finding, booking, and paying for quality painting work simpler, safer, and more transparent than ever before.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-light py-28 px-6">
        <div ref={whoRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-primary mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Who we are
          </p>
          <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.2] mb-8">
            We connect homeowners, landlords, property managers, and businesses with KYC-verified, insured painting professionals.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 mt-10">
            <div className="border-l-2 border-primary/30 pl-6">
              <p className="text-sm font-semibold text-foreground mb-2">For customers</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                Know exactly who is coming to your property. Every painter is verified, insured, and rated — with payment held securely in escrow until you confirm the job is complete.
              </p>
            </div>
            <div className="border-l-2 border-primary/30 pl-6">
              <p className="text-sm font-semibold text-foreground mb-2">For painters</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                A platform that values your craft, pays you fairly, and protects you from unreliable clients. Matched jobs delivered directly to your dashboard, with no subscription fees.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-[1.8] mt-8 border-t border-border/50 pt-8">
            We are built on a single belief: that both customers and painters deserve better.
          </p>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="section-warm py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div ref={diffHeaderRef} className="scroll-animate mb-16">
            <p className="editorial-label text-primary mb-4 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current" />
              What makes us different
            </p>
            <h2 className="font-display text-foreground max-w-xl">Four things that set PaintBookCo apart</h2>
          </div>
          <div ref={diffGridRef} className="grid sm:grid-cols-2 gap-px bg-border/50 scroll-stagger">
            {DIFFERENTIATORS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="scroll-animate bg-background p-10">
                <div className="w-10 h-10 flex items-center justify-center mb-6 bg-muted">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-[1.8]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-light py-28 px-6">
        <div ref={howRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-primary mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            How it works
          </p>
          <h2 className="font-display text-foreground mb-12">Simple from start to finish</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="border-l-2 border-primary/30 pl-6">
              <p className="text-sm font-semibold text-foreground mb-3">For customers</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                Post your job, get matched with verified local painters, review profiles and ratings, confirm your booking, and pay securely through escrow. Your payment is only released when you are satisfied with the work.
              </p>
            </div>
            <div className="border-l-2 border-primary/30 pl-6">
              <p className="text-sm font-semibold text-foreground mb-3">For painters</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                Register, complete verification, and start receiving job notifications matched to your skills, location, and availability. No bidding wars. No subscription fees. Just quality jobs delivered to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment to Quality */}
      <section className="section-dark py-28 px-6">
        <div ref={commitRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-white/35 mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Our commitment to quality
          </p>
          <h2 className="font-display text-white mb-8">We stand behind every job</h2>
          <p className="text-white/60 leading-[1.9] text-sm">
            PaintBookCo is not just a directory. We are an active participant in every job on our platform. We monitor job progress, facilitate secure payments, and provide a structured dispute resolution process if anything goes wrong. If a painter's work falls short, we step in — offering a remediation window and, where necessary, arranging a replacement painter to complete the job.
          </p>
          <p className="text-white/60 leading-[1.9] text-sm mt-6">
            We hold every painter on our platform to a professional standard, and we stand behind every job booked through PaintBookCo.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-warm py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div ref={valuesHeaderRef} className="scroll-animate mb-16">
            <p className="editorial-label text-primary mb-4 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current" />
              What we stand for
            </p>
            <h2 className="font-display text-foreground">Our values</h2>
          </div>
          <div ref={valuesRef} className="grid sm:grid-cols-2 gap-px bg-border/50 scroll-stagger">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="scroll-animate bg-background p-10">
                <div className="w-10 h-10 flex items-center justify-center mb-6 bg-muted">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-[1.8]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="section-light py-28 px-6">
        <div ref={teamRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-primary mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            The team
          </p>
          <h2 className="font-display text-foreground mb-8">The team behind PaintBookCo</h2>
          <p className="text-sm text-muted-foreground leading-[1.9] mb-8">
            PaintBookCo was founded by professionals with deep experience in financial services, compliance, and technology. Our founding team combines expertise in Anti-Money Laundering, financial crime compliance, data analytics, and platform development — giving PaintBookCo a level of operational rigour and trust infrastructure rarely seen in the trades marketplace sector.
          </p>
          <p className="text-sm text-muted-foreground leading-[1.9] mb-10">
            We are incorporated in England and Wales and operate in full compliance with UK GDPR, the ICO, and applicable UK consumer protection law.
          </p>
          <div className="border-t border-border/50 pt-8 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">The PaintBook Company Ltd</p>
            <p>Company Number: 16690724</p>
            <p>Registered in England and Wales</p>
            <p>FCA Authorised Escrow Partner: Transpact (Ref: 546279)</p>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="section-dark py-28 px-6">
        <div ref={ctaRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-white/35 mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Join us
          </p>
          <h2 className="font-display text-white mb-8 max-w-xl">
            Whether you are a homeowner, a landlord, or a professional painter — PaintBookCo was built for you.
          </h2>
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div className="border-l-2 border-white/15 pl-6">
              <p className="text-sm font-medium text-white mb-2">For customers</p>
              <p className="text-sm text-white/50 leading-[1.8]">Post your first job today and get matched with a verified painter in your area.</p>
            </div>
            <div className="border-l-2 border-white/15 pl-6">
              <p className="text-sm font-medium text-white mb-2">For painters</p>
              <p className="text-sm text-white/50 leading-[1.8]">Apply to join our verified network and start receiving matched job notifications.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register/customer"
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-8 py-4 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            >
              Find a Painter <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/join-painter"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-medium px-8 py-4 hover:border-white/50 transition-all duration-200"
            >
              Join as a Painter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(AboutPage, { name: "AboutPage", inputs: [] }); })
  .catch(() => {});
