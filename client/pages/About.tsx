import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ShieldCheck, Users, Lock, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/lib/config";

export default function About() {
  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="animate-fade-in">
            <p className="editorial-label mb-4">About PaintBookCo</p>
            <h1 className="mb-6">Simplifying Paint. Empowering Painters.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              PaintBookCo is a UK digital marketplace built exclusively for professional painters and decorators. 
              We connect homeowners, landlords, property managers, and businesses with KYC-verified, insured painting 
              professionals — making the process of finding, booking, and paying for quality painting work simpler, 
              safer, and more transparent than ever before.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="section-light section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-6">Who We Are</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
              <p>
                We are built on a single belief: that both customers and painters deserve better. Customers deserve to 
                know exactly who is coming to their property. Painters deserve a platform that values their craft, pays them 
                fairly, and protects them from unreliable clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Makes Us Different ── */}
      <section className="section-warm section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-12">What Makes Us Different</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Professionals Only",
                description: "Every painter on PaintBookCo has passed our rigorous KYC verification process — identity checks, address verification, public liability insurance confirmation, and portfolio validation. No exceptions. If a painter isn't verified, they aren't on our platform."
              },
              {
                icon: Lock,
                title: "Secure Payments, Always",
                description: "All payments on PaintBookCo are processed through Transpact, our FCA-authorised escrow partner. Your money is held securely until you confirm the job is complete — not a moment before. You are always in control."
              },
              {
                icon: Zap,
                title: "No Subscriptions. No Hidden Fees.",
                description: "Painters pay nothing to join and nothing to receive job notifications. We operate on a simple commission model — we only earn when a job is successfully completed. Our success is directly tied to yours."
              },
              {
                icon: Users,
                title: "Built for the UK",
                description: "PaintBookCo is designed specifically for the UK market, operating under UK law, with UK-regulated payment infrastructure, and UK-based data storage. Every aspect of the platform has been built with UK consumers and tradespeople in mind."
              },
            ].map((item) => (
              <div key={item.title} className="surface-card p-8">
                <item.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section-light section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-12">How It Works</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">For Customers</h3>
              <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                <li>Post your job</li>
                <li>Get matched with verified local painters</li>
                <li>Review profiles and ratings</li>
                <li>Confirm your booking</li>
                <li>Pay securely through escrow</li>
              </ol>
              <p className="text-sm text-muted-foreground pt-2">
                Your payment is only released when you are satisfied with the work.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">For Painters</h3>
              <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                <li>Register and complete verification</li>
                <li>Start receiving job notifications</li>
                <li>Accept jobs matched to your skills</li>
                <li>Complete the work professionally</li>
                <li>Get paid securely</li>
              </ol>
              <p className="text-sm text-muted-foreground pt-2">
                No bidding wars. No subscription fees. Just quality jobs delivered to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Commitment to Quality ── */}
      <section className="section-warm section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-6">Our Commitment to Quality</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
              <p>
                PaintBookCo is not just a directory. We are an active participant in every job on our platform. We monitor 
                job progress, facilitate secure payments, and provide a structured dispute resolution process if anything goes wrong. 
                If a painter's work falls short, we step in — offering a remediation window and, where necessary, arranging a 
                replacement painter to complete the job.
              </p>
              <p className="font-semibold">
                We hold every painter on our platform to a professional standard, and we stand behind every job booked through PaintBookCo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="section-light section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-12">Our Values</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                title: "Trust",
                description: "Every interaction on PaintBookCo is built on verified identity, secure payments, and transparent processes. Trust is not assumed — it is earned and verified."
              },
              {
                icon: CheckCircle2,
                title: "Fairness",
                description: "We charge a tiered commission that reduces as painters grow with us. The more jobs you complete through PaintBookCo, the less commission you pay. We grow together."
              },
              {
                icon: Zap,
                title: "Quality",
                description: "We do not compromise on the standard of painters admitted to our platform. A verified PaintBookCo painter is a professional you can rely on."
              },
              {
                icon: Lock,
                title: "Transparency",
                description: "No hidden fees. No surprise charges. No ambiguity about where your money goes or how our platform works."
              },
            ].map((value) => (
              <div key={value.title} className="surface-card p-6 text-center">
                <value.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Team ── */}
      <section className="section-warm section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-12">The Team Behind PaintBookCo</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
              <p>
                PaintBookCo was founded by professionals with deep experience in financial services, compliance, and technology. 
                Our founding team combines expertise in Anti-Money Laundering, financial crime compliance, data analytics, and 
                platform development — giving PaintBookCo a level of operational rigour and trust infrastructure rarely seen in 
                the trades marketplace sector.
              </p>
              <p>
                We are incorporated in England and Wales (Company Number: 16690724) and operate in full compliance with UK GDPR, 
                the ICO, and applicable UK consumer protection law.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Info ── */}
      <section className="section-light section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="surface-card p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Company Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Legal Name:</strong> The PaintBook Company Ltd</p>
              <p><strong>Trading Name:</strong> PaintBookCo</p>
              <p><strong>Company Number:</strong> 16690724</p>
              <p><strong>Registration:</strong> England and Wales</p>
              <p><strong>Registered Address:</strong> 1, 1 Fenman Mews, Walkden, Manchester, UK. M28 3YU</p>
              <p><strong>Website:</strong> paintbookco.co.uk</p>
              <p><strong>Email:</strong> {SUPPORT_EMAIL}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Join Us CTA ── */}
      <section className="section-dark section-gap">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-white mb-6">Join PaintBookCo Today</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Whether you are a homeowner looking for a painter you can trust, a landlord managing a property portfolio, 
              or a professional painter ready to grow your business — PaintBookCo was built for you.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="space-y-3">
                <h3 className="text-white font-semibold">For Customers</h3>
                <p className="text-sm text-white/60 mb-4">Post your first job today</p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/post-job">Post a Job</Link>
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-semibold">For Painters</h3>
                <p className="text-sm text-white/60 mb-4">Apply to join our verified network</p>
                <Button asChild className="w-full">
                  <Link to="/join-painter">Join as Painter</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
