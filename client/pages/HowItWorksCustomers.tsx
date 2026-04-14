import { Link } from "react-router-dom";
import { useEffect } from "react";
import { FileText, Users, CreditCard, Hammer, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    number: "01",
    title: "Post your job",
    description:
      "Describe your job, set your budget and preferred dates. No fees to post — you are under no obligation until you confirm a painter.",
  },
  {
    icon: Users,
    number: "02",
    title: "Get matched",
    description:
      "Our system finds verified painters in your area matched to your job type, budget, and schedule. You will receive a notification when a match is found.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Confirm your painter",
    description:
      "Review your matched painter's profile, ratings, and verified credentials. Confirm by paying securely into FCA-authorised escrow. Funds are held — not charged — until the job is complete.",
  },
  {
    icon: Hammer,
    number: "04",
    title: "Job in progress",
    description:
      "Your painter completes the work and submits milestones for your approval. Review each milestone before approving. You stay in full control.",
  },
  {
    icon: CheckCircle2,
    number: "05",
    title: "Confirm and release payment",
    description:
      "When you are happy with the completed work, confirm completion through your dashboard. Payment is released to your painter automatically. If you are not satisfied, raise a dispute — funds remain frozen until resolved.",
  },
];

export default function HowItWorksCustomers() {
  useEffect(() => {
    document.title = "How It Works for Customers | PaintBookCo";
  }, []);

  return (
    <div>
      {/* Header spacer for fixed nav */}
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="editorial-label text-white/40 mb-4">For customers</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-4">
            How it works
          </h1>
          <p className="text-lg text-white/65 leading-[1.7]">
            From posting your job to releasing payment — everything in five
            simple steps.
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
                  {/* Step icon */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center relative z-10 bg-background border border-primary rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Content */}
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
            Ready to find your painter?
          </h2>
          <p className="text-muted-foreground mb-8 leading-[1.7]">
            Post your first job in minutes. Free to post, no commitment until you confirm.
          </p>
          <Link
            to="/register/customer"
            className="inline-block text-base font-semibold text-primary-foreground bg-primary px-8 py-4 transition-opacity hover:opacity-90"
          >
            Post Your First Job
          </Link>
        </div>
      </section>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(HowItWorksCustomers, {
      name: "HowItWorksCustomers",
      inputs: [],
    });
  })
  .catch(() => {});
