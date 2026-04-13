import { Link } from "react-router-dom";
import { useEffect } from "react";
import { UserCheck, Bell, ThumbsUp, Paintbrush, Banknote } from "lucide-react";

const STEPS = [
  {
    icon: UserCheck,
    number: "01",
    title: "Register and verify",
    description:
      "Complete your registration and pass KYC verification — identity check, address verification, and insurance confirmation. Takes 1–3 working days. Once approved, you are ready to receive jobs.",
  },
  {
    icon: Bell,
    number: "02",
    title: "Receive job notifications",
    description:
      "Get matched jobs sent directly to your dashboard based on your skills, location, and availability. No cold calling, no bidding — just relevant jobs that suit your profile.",
  },
  {
    icon: ThumbsUp,
    number: "03",
    title: "Accept jobs",
    description:
      "The first verified painter to accept gets the job. No bidding wars, no auctions. Review the job details, confirm availability, and accept. The customer is notified immediately.",
  },
  {
    icon: Paintbrush,
    number: "04",
    title: "Complete the work",
    description:
      "Carry out the job to the agreed standard. Submit milestones as you complete each stage through your dashboard. The customer reviews and approves each milestone before you proceed.",
  },
  {
    icon: Banknote,
    number: "05",
    title: "Get paid",
    description:
      "When the customer confirms completion, payment is released from escrow directly to you. No delays, no chasing invoices. Commission is deducted automatically at release — there is nothing else to pay.",
  },
];

export default function HowItWorksPainters() {
  useEffect(() => {
    document.title = "How It Works for Painters | PaintBookCo";
  }, []);

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section
        className="py-20 px-6 text-center"
        style={{ backgroundColor: "#1B3A5C" }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
            For painters
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How it works
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Register, get verified, and start receiving matched jobs — all in
            five steps.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical connector */}
            <div className="absolute left-[23px] top-12 bottom-12 w-px bg-gray-100 hidden sm:block" />

            <div className="space-y-12">
              {STEPS.map(({ icon: Icon, number, title, description }) => (
                <div key={number} className="flex gap-6 items-start">
                  <div
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center relative z-10 bg-white border-2"
                    style={{
                      borderColor: "#2E75B6",
                      borderRadius: "50%",
                    }}
                  >
                    <Icon className="h-5 w-5 text-[#2E75B6]" />
                  </div>

                  <div className="pb-2">
                    <div className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-1">
                      Step {number}
                    </div>
                    <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">{title}</h2>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3A5C] mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-gray-600 mb-8">
            Join as a painter today. No subscription fees — commission only on
            completed jobs.
          </p>
          <Link
            to="/join-painter"
            className="inline-block text-base font-semibold text-white px-8 py-4 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
          >
            Join as a Painter
          </Link>
        </div>
      </section>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(HowItWorksPainters, {
      name: "HowItWorksPainters",
      inputs: [],
    });
  })
  .catch(() => {});
