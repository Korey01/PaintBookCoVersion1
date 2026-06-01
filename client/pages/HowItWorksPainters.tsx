import { Link } from "react-router-dom";
import { useEffect } from "react";
import { UserCheck, Bell, ThumbsUp, Paintbrush, Banknote, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

const STEPS = [
  { icon: UserCheck, number: "01", title: "Register and verify", description: "Complete your registration and pass KYC verification — identity check, address verification, and insurance confirmation. Takes 1–3 working days. Once approved, you are ready to receive jobs." },
  { icon: Bell, number: "02", title: "Receive job notifications", description: "Get matched jobs sent directly to your dashboard based on your skills, location, and availability. No cold calling, no bidding — just relevant jobs that suit your profile." },
  { icon: ThumbsUp, number: "03", title: "Accept jobs", description: "The first verified painter to accept gets the job. No bidding wars, no auctions. Review the job details, confirm availability, and accept. The customer is notified immediately." },
  { icon: Paintbrush, number: "04", title: "Complete the work", description: "Carry out the job to the agreed standard. Submit milestones as you complete each stage through your dashboard. The customer reviews and approves each milestone before you proceed." },
  { icon: Banknote, number: "05", title: "Get paid", description: "When the customer confirms completion, payment is released from escrow directly to you. No delays, no chasing invoices. Commission is deducted automatically at release — there is nothing else to pay." },
];

export default function HowItWorksPainters() {
  useEffect(() => { document.title = "How It Works for Painters | PaintBookCo"; }, []);

  const stepsRef = useScrollAnimationList();
  const ctaRef = useScrollAnimation();

  return (
    <div className="ambient-ivory" style={{ minHeight: '100vh' }}>
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="editorial-label text-white/35 mb-6 animate-editorial-up" style={{ animationFillMode: "both" }}>
            For painters
          </p>
          <h1 className="font-display text-white mb-6 animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            How it works
          </h1>
          <p className="text-lg text-white/55 leading-[1.8] max-w-xl animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Register, get verified, and start receiving matched jobs — all in
            five steps.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-light py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <div ref={stepsRef} className="relative scroll-stagger">
            <div className="absolute left-[23px] top-14 bottom-14 w-px bg-border/60 hidden sm:block" />
            <div className="space-y-14">
              {STEPS.map(({ icon: Icon, number, title, description }) => (
                <div key={number} className="scroll-animate flex gap-8 items-start">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-background border border-primary/40 rounded-full relative z-10">
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
          <h2 className="font-display text-foreground mb-4">Ready to grow your business?</h2>
          <p className="text-muted-foreground leading-[1.8] mb-8">
            Join as a painter today. No subscription fees — commission only on completed jobs.
          </p>
          <Link
            to="/join-painter"
            className="group inline-flex items-center gap-2 bg-foreground text-background font-medium px-8 py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.02]"
          >
            Join as a Painter
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

