import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Palette, ShieldCheck, Sparkles, Users, ChartBar, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection, { AnimatedItem } from "@/components/site/AnimatedSection";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function About() {
  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F885f930f542b4689bad15cecd53df8b6?format=webp&width=1600"
          alt="About PaintBookco"
          className="h-[480px] w-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-16 px-6 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="editorial-label text-primary mb-3">About PaintBookco</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-[1.1] max-w-2xl">
                Simplifying Your Paint Job.<br />Empowering Painters.
              </h1>
              <p className="mt-5 text-white/75 text-lg max-w-xl leading-relaxed">
                At PaintBookco, we believe colour transforms not just walls, but lives.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="section-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="fade-up" className="max-w-3xl">
            <p className="text-lg leading-[1.8] text-muted-foreground">
              For too long, the UK painting and decorating industry has been fragmented, confusing, and frustrating—for both customers and painters. We set out to change that, building a platform that connects the right people with the right tools and the trust to get the job done.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Mission + Difference ── */}
      <section className="section-warm">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="fade-up" stagger className="grid gap-10 md:grid-cols-2">
            <AnimatedItem variant="fade-up">
              <div className="border border-border/50 bg-background p-8">
                <p className="editorial-label text-primary mb-4">Our Mission</p>
                <h2 className="font-display text-2xl font-normal mb-4">Connecting customers with trusted painters</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  To simplify the paint job journey by connecting customers with trusted painters and decorators, while giving painters the tools and visibility to grow their businesses.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  With PaintBookco, customers no longer waste time searching endlessly for reliable painters. And painters no longer struggle to find work beyond word‑of‑mouth.
                </p>
              </div>
            </AnimatedItem>

            <AnimatedItem variant="fade-up">
              <div className="border border-border/50 bg-background p-8">
                <p className="editorial-label text-primary mb-4">What Makes Us Different</p>
                <h2 className="font-display text-2xl font-normal mb-5">Built for every job</h2>
                <ul className="space-y-4">
                  {[
                    { icon: Sparkles, text: "Smart Paint Estimator & Visualiser – instantly calculate how much paint you'll need and preview colour schemes." },
                    { icon: Users, text: "Verified Painter Portfolios – no stock images, just real work from real professionals." },
                    { icon: ShieldCheck, text: "Escrow Deposit Protection – funds are held safely until the job is completed to your satisfaction." },
                    { icon: ChartBar, text: "Tiered Subscription Model – affordable for both hobbyists and professionals." },
                    { icon: Palette, text: "Community‑Driven Platform – loyalty rewards, referral bonuses, and an ecosystem for growth." },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Icon className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </div>
      </section>

      {/* ── For Customers / For Painters ── */}
      <section className="section-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="fade-up" className="mb-12">
            <p className="editorial-label text-primary mb-3">Who We Serve</p>
            <h2 className="font-display text-3xl md:text-4xl font-normal max-w-xl">
              A platform built for both sides of every job
            </h2>
          </AnimatedSection>

          <AnimatedSection variant="fade-up" stagger className="grid gap-8 md:grid-cols-2">
            <AnimatedItem variant="fade-left">
              <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
                <p className="editorial-label text-muted-foreground mb-5">For Customers</p>
                <ul className="space-y-4">
                  {[
                    { icon: CheckCircle2, text: "Quickly find reliable, vetted painters." },
                    { icon: Wallet, text: "Know your costs upfront with our estimator." },
                    { icon: ShieldCheck, text: "Book with peace of mind — your deposit is protected until the job is done." },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Icon className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex gap-3">
                  <Button asChild size="sm"><Link to="/find-painter">Find a Painter</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link to="/vestimator">Use Estimator</Link></Button>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem variant="fade-right">
              <div className="border border-border/50 p-8 hover:shadow-editorial transition-shadow duration-300">
                <p className="editorial-label text-muted-foreground mb-5">For Painters</p>
                <ul className="space-y-4">
                  {[
                    { icon: ChartBar, text: "Grow your client base without expensive commissions." },
                    { icon: Sparkles, text: "Showcase your best work with verified portfolios." },
                    { icon: CheckCircle2, text: "Choose the jobs that match your skills, budget, and availability." },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Icon className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex gap-3">
                  <Button asChild size="sm"><Link to="/join-painter">Join as Painter</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
                </div>
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Vision ── */}
      <section className="section-dark">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="fade-up" stagger className="grid gap-16 md:grid-cols-2 items-center">
            <AnimatedItem variant="fade-left">
              <p className="editorial-label text-primary mb-4">Our Vision</p>
              <h2 className="font-display text-3xl md:text-4xl font-normal text-white leading-[1.15] mb-6">
                Starting in the UK.<br />Built for the world.
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                By 2027, PaintBookco aims to expand into Europe and Africa, becoming the go‑to global marketplace for painting and decorating services. Because everyone deserves a home or workspace that inspires. And every painter deserves the chance to shine.
              </p>
            </AnimatedItem>
            <AnimatedItem variant="fade-right">
              <div className="grid grid-cols-2 gap-px bg-white/10">
                {[
                  { num: "2022", label: "Founded" },
                  { num: "UK", label: "Current market" },
                  { num: "2027", label: "EU & Africa launch" },
                  { num: "∞", label: "Ambition" },
                ].map(({ num, label }) => (
                  <div key={label} className="bg-foreground/90 p-8 text-center">
                    <div className="font-display text-3xl font-normal text-white">{num}</div>
                    <div className="mt-1 text-xs text-white/40 uppercase tracking-widest">{label}</div>
                  </div>
                ))}
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section-light">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="fade-up" className="mb-12">
            <p className="editorial-label text-primary mb-3">The Team</p>
            <h2 className="font-display text-3xl md:text-4xl font-normal max-w-xl">
              The people behind PaintBookco
            </h2>
          </AnimatedSection>

          <AnimatedSection variant="fade-up" stagger className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Oluwakorede Alashe",
                role: "Founder & Managing Director",
                bio: "A business analyst and product strategist with experience in financial compliance, customer experience, and business transformation.",
              },
              {
                name: "Our Support Team",
                role: "Finance, Marketing & Engineering",
                bio: "Specialists ensuring the platform is robust, scalable, and customer‑focused.",
              },
              {
                name: "Our Painter Network",
                role: "The Heart of PaintBookco",
                bio: "A growing network of highly skilled painters bringing craftsmanship, creativity, and professionalism to every project.",
              },
            ].map(({ name, role, bio }) => (
              <AnimatedItem key={name} variant="fade-up">
                <div className="border border-border/50 p-7">
                  <div className="font-semibold text-foreground">{name}</div>
                  <div className="mt-0.5 text-xs text-primary uppercase tracking-widest">{role}</div>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-warm">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <AnimatedSection variant="scale-up" className="text-center">
            <p className="font-display text-2xl md:text-3xl font-normal mb-6 max-w-2xl mx-auto">
              Together, we're building a platform that brings vibrance, trust, and efficiency to the painting industry.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button asChild size="lg"><Link to="/find-painter">Find a Painter</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/post-job">Post a Job</Link></Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
