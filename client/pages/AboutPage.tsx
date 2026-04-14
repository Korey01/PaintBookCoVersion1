import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ShieldCheck, Scale, Star, Eye, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

const VALUES = [
  { icon: ShieldCheck, title: "Trust", description: "Every interaction is built on verified identity, secure payments, and complete transparency. Trust is not assumed — it is earned and verified." },
  { icon: Scale, title: "Fairness", description: "Our tiered commission model reduces as painters grow with us. The more you contribute, the less you pay." },
  { icon: Star, title: "Quality", description: "Only verified, insured professionals are admitted to the platform. Every painter must pass identity and insurance checks before receiving any jobs." },
  { icon: Eye, title: "Transparency", description: "No hidden fees, no surprises. Every charge, every process, every policy is published openly. What you see is what you get." },
];

export default function AboutPage() {
  useEffect(() => { document.title = "About | PaintBookCo"; }, []);

  const missionRef = useScrollAnimation();
  const valuesRef = useScrollAnimationList();
  const companyRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  return (
    <div>
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <p className="editorial-label text-white/35 mb-8 animate-editorial-up" style={{ animationFillMode: "both" }}>
            About us
          </p>
          <h1 className="font-display text-white mb-8 max-w-2xl animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            Building trust between customers and professional painters
          </h1>
          <p className="text-lg text-white/50 leading-[1.8] max-w-2xl animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            PaintBookCo is a UK digital marketplace built exclusively for
            professional painters and decorators. We connect homeowners,
            landlords, property managers, and businesses with KYC-verified,
            insured painting professionals.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-light py-28 px-6">
        <div ref={missionRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-primary mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Our mission
          </p>
          <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.2] mb-8">
            The painting and decorating industry has long suffered from a lack
            of trust, inconsistent quality, and unreliable payment practices.
            PaintBookCo was built to fix that.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 mt-10">
            <div className="border-l-2 border-primary/30 pl-6">
              <p className="text-sm font-semibold text-foreground mb-2">For customers</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                A marketplace where every painter is verified, insured, and rated
                — with payment held securely in escrow until the job is confirmed complete.
              </p>
            </div>
            <div className="border-l-2 border-primary/30 pl-6">
              <p className="text-sm font-semibold text-foreground mb-2">For painters</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                A platform that delivers matched, ready-to-confirm jobs directly
                to their dashboard, with guaranteed secure payment and no subscription fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-warm py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div ref={useScrollAnimation()} className="scroll-animate mb-16">
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

      {/* Company details */}
      <section className="section-light py-20 px-6">
        <div ref={companyRef} className="mx-auto max-w-3xl scroll-animate">
          <p className="editorial-label text-primary mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            The company
          </p>
          <h2 className="font-display text-foreground mb-6">The PaintBook Company Ltd</h2>
          <div className="text-muted-foreground text-sm leading-[2] space-y-1">
            <p>Company Number: 16690724</p>
            <p>Registered in England and Wales</p>
            <p>FCA Authorised Escrow Partner: Transpact (Ref: 546279)</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark py-28 px-6 text-center">
        <div ref={ctaRef} className="mx-auto max-w-xl scroll-animate">
          <h2 className="font-display text-white mb-8">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register/customer" className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-8 py-4 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]">
              Find a Painter <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link to="/join-painter" className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-medium px-8 py-4 hover:border-white/50 transition-all duration-200">
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
