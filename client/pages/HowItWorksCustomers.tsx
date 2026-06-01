import { Link } from "react-router-dom";
import { useEffect } from "react";
import { FileText, Users, CreditCard, Hammer, CheckCircle2, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

const STEPS = [
  { icon: FileText, number: "01", title: "Post your job", description: "Describe your job, set your budget and preferred dates. No fees to post — you are under no obligation until you confirm a painter." },
  { icon: Users, number: "02", title: "Get matched", description: "Our system finds verified painters in your area matched to your job type, budget, and schedule. You will receive a notification when a match is found." },
  { icon: CreditCard, number: "03", title: "Confirm your painter", description: "Review your matched painter's profile, ratings, and verified credentials. Confirm by paying securely into FCA-authorised escrow. Funds are held — not charged — until the job is complete." },
  { icon: Hammer, number: "04", title: "Job in progress", description: "Your painter completes the work and submits milestones for your approval. Review each milestone before approving. You stay in full control." },
  { icon: CheckCircle2, number: "05", title: "Confirm and release payment", description: "When you are happy with the completed work, confirm completion through your dashboard. Payment is released to your painter automatically. If you are not satisfied, raise a dispute — funds remain frozen until resolved." },
];

export default function HowItWorksCustomers() {
  useEffect(() => { document.title = "How It Works for Customers | PaintBookCo"; }, []);

  const stepsRef = useScrollAnimationList();
  const ctaRef = useScrollAnimation();

  return (
    <div style={{ background: '#FBF7F0', minHeight: '100vh' }}>
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="editorial-label text-white/35 mb-6 animate-editorial-up" style={{ animationFillMode: "both" }}>
            For customers
          </p>
          <h1 className="font-display text-white mb-6 animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            How it works
          </h1>
          <p className="text-lg text-white/55 leading-[1.8] max-w-xl animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            From posting your job to releasing payment — everything in five
            simple steps.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-light py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <div ref={stepsRef} className="relative scroll-stagger">
            {/* Connector line */}
            <div className="absolute left-[23px] top-14 bottom-14 w-px bg-border/60 hidden sm:block" />

            <div className="space-y-14">
              {STEPS.map(({ icon: Icon, number, title, description }) => (
                <div key={number} className="scroll-animate flex gap-8 items-start">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-background border border-primary/40 rounded-full relative z-10 group-hover:border-primary transition-colors duration-300">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="editorial-label text-primary mb-2">Step {number}</p>
                    <h2 className="font-display text-xl font-normal text-foreground mb-3">{title}</h2>
                    <p className="text-muted-foreground leading-[1.8]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-warm py-24 px-6">
        <div ref={ctaRef} className="mx-auto max-w-xl text-center scroll-animate">
          <h2 className="font-display text-foreground mb-4">Ready to find your painter?</h2>
          <p className="text-muted-foreground leading-[1.8] mb-8">
            Post your first job in minutes. Free to post, no commitment until you confirm.
          </p>
          <Link
            to="/register/customer"
            className="group inline-flex items-center gap-2 bg-foreground text-background font-medium px-8 py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.02]"
          >
            Post Your First Job
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

