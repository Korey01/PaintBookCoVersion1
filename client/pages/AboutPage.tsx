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
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section
        className="py-24 px-6"
        style={{ backgroundColor: "#1B3A5C" }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
            About us
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Building trust between customers and professional painters
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
            PaintBookCo is a UK digital marketplace built exclusively for
            professional painters and decorators. We connect homeowners,
            landlords, property managers, and businesses with KYC-verified,
            insured painting professionals.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-4">
            Our mission
          </p>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            The painting and decorating industry has long suffered from a lack
            of trust, inconsistent quality, and unreliable payment practices.
            PaintBookCo was built to fix that — for both customers and painters.
          </p>
          <p className="text-gray-600 leading-relaxed">
            For customers: a marketplace where every painter is verified,
            insured, and rated — with payment held securely in escrow until the
            job is confirmed complete.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            For painters: a platform that delivers matched, ready-to-confirm
            jobs directly to their dashboard, with guaranteed secure payment
            and no subscription fees.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-3">
              What we stand for
            </p>
            <h2 className="text-3xl font-bold text-[#1B3A5C]">Our values</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white p-8 border border-gray-100"
                style={{ borderRadius: "8px" }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-5"
                  style={{ backgroundColor: "#EBF3FC", borderRadius: "8px" }}
                >
                  <Icon className="h-5 w-5 text-[#2E75B6]" />
                </div>
                <h3 className="text-lg font-bold text-[#1B3A5C] mb-3">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The team */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-4">
            The team
          </p>
          <h2 className="text-3xl font-bold text-[#1B3A5C] mb-6">
            Founded by people who understand both sides
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            PaintBookCo was founded by professionals with deep experience in
            financial services, compliance, and technology. We built this
            platform because we saw first-hand how broken the existing process
            was — for both the customer hiring a painter and the painter trying
            to run a business.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            The PaintBook Company Ltd is incorporated in England and Wales
            (Company Number: 16690724), and operates under a strict data
            protection and compliance framework registered with the ICO
            (Registration No. ZC118117).
          </p>

          <div
            className="p-6 border border-gray-100"
            style={{ borderRadius: "8px", backgroundColor: "#f8fafc" }}
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-[#1B3A5C]">The PaintBook Company Ltd</strong>
              <br />
              Company Number: 16690724
              <br />
              Registered in England and Wales
              <br />
              1, 1 Fenman Mews, Walkden, Manchester, UK. M28 3YU
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-center"
        style={{ backgroundColor: "#1B3A5C" }}
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Join the platform built for professionals
          </h2>
          <p className="text-white/60 mb-8">
            Whether you are a customer looking for a reliable painter or a
            painter looking to grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/customer"
              className="inline-block text-base font-semibold text-white px-8 py-4 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
            >
              Find a Painter
            </Link>
            <Link
              to="/join-painter"
              className="inline-block text-base font-semibold text-white px-8 py-4 border-2 border-white/40 hover:border-white transition-colors"
              style={{ borderRadius: "8px" }}
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
