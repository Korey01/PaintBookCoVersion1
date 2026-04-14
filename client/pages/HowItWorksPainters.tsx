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
    <div>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="editorial-label text-white/40 mb-4">For painters</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
            How it works
          </h1>
          <p className="text-lg text-white/65 leading-[1.7]">
            Register, get verified, and start receiving matched jobs — all in
            five steps.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-light py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical connector */}
            <div className="absolute left-[23px] top-12 bottom-12 w-px bg-border hidden sm:block" />

            <div className="space-y-12">
              {STEPS.map(({ icon: Icon, number, title, description }) => (
                <div key={number} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center relative z-10 bg-background border border-primary rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="pb-2">
                    <div className="editorial-label text-primary mb-1">
                      Step {number}
                    </div>
                    <h2 className="font-display text-xl font-normal text-foreground mb-3">{title}</h2>
                    <p className="text-muted-foreground leading-[1.7]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-warm py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-muted-foreground mb-8 leading-[1.7]">
            Join as a painter today. No subscription fees — commission only on
            completed jobs.
          </p>
          <Link
            to="/join-painter"
            className="inline-block text-base font-semibold text-primary-foreground bg-primary px-8 py-4 transition-opacity hover:opacity-90"
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
