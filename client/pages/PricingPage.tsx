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
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-4">
            Simple, transparent pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1B3A5C] mb-4">
            No surprises. Ever.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Customers pay nothing extra. Painters pay commission only when they
            get paid.
          </p>
        </div>
      </section>

      {/* Pricing columns */}
      <section className="py-16 px-6" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* For Customers */}
          <div
            className="bg-white border border-gray-100 p-10 flex flex-col"
            style={{ borderRadius: "8px" }}
          >
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-3">
                For customers
              </p>
              <h2 className="text-3xl font-bold text-[#1B3A5C] mb-2">
                Free for customers
              </h2>
              <p className="text-gray-500 text-sm">
                Post jobs, get matched, pay via escrow — no fees charged to you.
              </p>
            </div>

            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-bold text-[#1B3A5C]">£0</span>
              <span className="text-gray-400 text-sm pb-2">platform fee</span>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
              {CUSTOMER_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#2E75B6] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register/customer"
              className="block text-center text-white font-semibold py-3 px-6 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
            >
              Post a Job
            </Link>
          </div>

          {/* For Painters */}
          <div
            className="border-2 p-10 flex flex-col relative"
            style={{ borderColor: "#2E75B6", borderRadius: "8px" }}
          >
            <div
              className="absolute -top-3 left-8 text-xs font-semibold text-white px-3 py-1"
              style={{ backgroundColor: "#2E75B6", borderRadius: "4px" }}
            >
              Most popular
            </div>

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-3">
                For painters
              </p>
              <h2 className="text-3xl font-bold text-[#1B3A5C] mb-2">
                Commission only
              </h2>
              <p className="text-gray-500 text-sm">
                No upfront costs. Pay only when you get paid — and less as you grow.
              </p>
            </div>

            {/* Commission table */}
            <div
              className="mb-8 border border-gray-100 overflow-hidden"
              style={{ borderRadius: "8px" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      Completed jobs
                    </th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">
                      Commission rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TIERS.map(({ range, rate }, i) => (
                    <tr
                      key={range}
                      className={i < COMMISSION_TIERS.length - 1 ? "border-b border-gray-100" : ""}
                    >
                      <td className="px-4 py-3 text-gray-700">{range}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#1B3A5C]">
                        {rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
              {PAINTER_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#2E75B6] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/join-painter"
              className="block text-center text-white font-semibold py-3 px-6 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
            >
              Join as a Painter
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">
            Questions about pricing?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Visit our Help page for answers, or get in touch directly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/help"
              className="text-sm font-medium text-[#2E75B6] hover:underline"
            >
              Help &amp; FAQ →
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-[#2E75B6] hover:underline"
            >
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
