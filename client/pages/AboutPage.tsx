import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ShieldCheck, Scale, Star, Eye } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "Every interaction is built on verified identity, secure payments, and complete transparency. Trust is not assumed — it is earned and verified.",
  },
  {
    icon: Scale,
    title: "Fairness",
    description:
      "Our tiered commission model reduces as painters grow with us. The more you contribute, the less you pay.",
  },
  {
    icon: Star,
    title: "Quality",
    description:
      "Only verified, insured professionals are admitted to the platform. Every painter must pass identity and insurance checks before receiving any jobs.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No hidden fees, no surprises. Every charge, every process, every policy is published openly. What you see is what you get.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About | PaintBookCo";
  }, []);

  return (
    <div>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="editorial-label text-white/40 mb-4">About us</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-6 leading-[1.05]">
            Building trust between customers and professional painters
          </h1>
          <p className="text-lg text-white/65 leading-[1.7] max-w-2xl">
            PaintBookCo is a UK digital marketplace built exclusively for
            professional painters and decorators. We connect homeowners,
            landlords, property managers, and businesses with KYC-verified,
            insured painting professionals.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-light py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="editorial-label text-primary mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            Our mission
          </p>
          <p className="text-xl text-foreground leading-[1.7] mb-6">
            The painting and decorating industry has long suffered from a lack
            of trust, inconsistent quality, and unreliable payment practices.
            PaintBookCo was built to fix that — for both customers and painters.
          </p>
          <p className="text-muted-foreground leading-[1.7]">
            For customers: a marketplace where every painter is verified,
            insured, and rated — with payment held securely in escrow until the
            job is confirmed complete.
          </p>
          <p className="text-muted-foreground leading-[1.7] mt-4">
            For painters: a platform that delivers matched, ready-to-confirm
            jobs directly to their dashboard, with guaranteed secure payment
            and no subscription fees.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-warm py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="editorial-label text-primary mb-3 flex items-center justify-center gap-3">
              <span className="inline-block h-px w-8 bg-current" />
              What we stand for
            </p>
            <h2 className="font-display text-foreground">Our values</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card border border-border p-8">
                <div className="w-10 h-10 flex items-center justify-center mb-5 bg-muted">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-[1.7]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company details */}
      <section className="section-light py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="editorial-label text-primary mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current" />
            The company
          </p>
          <h2 className="font-display text-foreground mb-6">
            The PaintBook Company Ltd
          </h2>
          <div className="text-muted-foreground leading-[1.7] space-y-2">
            <p>Company Number: 16690724</p>
            <p>Registered in England and Wales</p>
            <p>FCA Authorised Escrow Partner: Transpact (Ref: 546279)</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-white mb-6">
            Ready to get started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/customer"
              className="inline-block text-base font-semibold text-primary-foreground bg-primary px-8 py-4 transition-opacity hover:opacity-90"
            >
              Find a Painter
            </Link>
            <Link
              to="/join-painter"
              className="inline-block text-base font-semibold text-white border border-white/30 px-8 py-4 hover:border-white/60 transition-colors"
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
  .then(({ Builder }) => {
    Builder.registerComponent(AboutPage, {
      name: "AboutPage",
      inputs: [],
    });
  })
  .catch(() => {});
