import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, Lock, Handshake, CheckCircle } from "lucide-react";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center justify-center px-6"
      style={{ backgroundColor: "#1B3A5C" }}
    >
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center pt-16">
        <div
          className="inline-block text-xs font-semibold uppercase tracking-widest text-white/50 mb-6 px-3 py-1 border border-white/20 rounded-full"
          style={{ fontFamily: "Arial, system-ui, sans-serif" }}
        >
          UK Painters &amp; Decorators Marketplace
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          style={{ fontFamily: "Arial, system-ui, sans-serif" }}
        >
          Paint.{" "}
          <span style={{ color: "#2E75B6" }}>Book.</span>{" "}
          Done.
        </h1>

        <p
          className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "Arial, system-ui, sans-serif" }}
        >
          Find KYC-verified painters near you. Pay securely via FCA-authorised
          escrow. Guaranteed quality.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register/customer"
            className="text-base font-semibold text-white px-8 py-4 w-full sm:w-auto text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
          >
            Find a Painter
          </Link>
          <Link
            to="/join-painter"
            className="text-base font-semibold px-8 py-4 w-full sm:w-auto text-center border-2 border-white/40 text-white hover:border-white transition-colors"
            style={{ borderRadius: "8px" }}
          >
            Join as a Painter
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/35" style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
          Free to post · No hidden fees · Pay only when satisfied
        </p>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, white)",
        }}
      />
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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-3"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
          >
            Simple process
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#1B3A5C]"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
          >
            How it works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ number, title, description }) => (
            <div
              key={number}
              className="p-8 border border-gray-100 hover:shadow-md transition-shadow"
              style={{ borderRadius: "8px" }}
            >
              <div
                className="text-4xl font-bold mb-4"
                style={{ color: "#2E75B6", fontFamily: "Arial, system-ui, sans-serif" }}
              >
                {number}
              </div>
              <h3
                className="text-lg font-bold text-[#1B3A5C] mb-3"
                style={{ fontFamily: "Arial, system-ui, sans-serif" }}
              >
                {title}
              </h3>
              <p
                className="text-gray-600 text-sm leading-relaxed"
                style={{ fontFamily: "Arial, system-ui, sans-serif" }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/how-it-works/customers"
            className="text-sm font-medium text-[#2E75B6] hover:underline"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
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
    <section className="py-24 px-6" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-3"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
          >
            Built on trust
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#1B3A5C]"
            style={{ fontFamily: "Arial, system-ui, sans-serif" }}
          >
            Why customers choose PaintBookCo
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white p-6 border border-gray-100 hover:shadow-md transition-shadow"
              style={{ borderRadius: "8px" }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-4"
                style={{ backgroundColor: "#EBF3FC", borderRadius: "8px" }}
              >
                <Icon className="h-5 w-5 text-[#2E75B6]" />
              </div>
              <h3
                className="text-sm font-bold text-[#1B3A5C] mb-2"
                style={{ fontFamily: "Arial, system-ui, sans-serif" }}
              >
                {title}
              </h3>
              <p
                className="text-xs text-gray-500 leading-relaxed"
                style={{ fontFamily: "Arial, system-ui, sans-serif" }}
              >
                {description}
              </p>
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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-3"
              style={{ fontFamily: "Arial, system-ui, sans-serif" }}
            >
              For painters
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1B3A5C] mb-6"
              style={{ fontFamily: "Arial, system-ui, sans-serif" }}
            >
              Grow your painting business
            </h2>
            <p
              className="text-gray-600 mb-8 leading-relaxed"
              style={{ fontFamily: "Arial, system-ui, sans-serif" }}
            >
              Join thousands of professional painters who use PaintBookCo to fill
              their diary with matched, verified jobs — and get paid securely every time.
            </p>
            <Link
              to="/join-painter"
              className="inline-block text-base font-semibold text-white px-8 py-4 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
            >
              Join as a Painter
            </Link>
          </div>

          <div className="space-y-5">
            {PAINTER_BENEFITS.map(({ title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-[#2E75B6]" />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[#1B3A5C] mb-1"
                    style={{ fontFamily: "Arial, system-ui, sans-serif" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm text-gray-500 leading-relaxed"
                    style={{ fontFamily: "Arial, system-ui, sans-serif" }}
                  >
                    {description}
                  </p>
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
