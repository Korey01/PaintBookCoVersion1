import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Quote,
  Sparkles,
  Calculator,
  MapPin,
  PaintBucket,
  Star,
  Brush,
  Building2,
  Users,
} from "lucide-react";
import PainterCard from "@/components/site/PainterCard";
import TestimonialsSection from "@/components/site/TestimonialsSection";
import { painters } from "@/data/painters";
import {
  useScrollAnimation,
  useScrollAnimationList,
} from "@/hooks/useScrollAnimation";

/* ── Framer Motion variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

/* ── Small trust badge ── */
function TrustBadge({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
      <span className="font-medium">{label}</span>
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="stat-pill text-center min-w-[110px]"
    >
      <span className={`text-2xl font-black tracking-tight ${color}`}>
        {value}
      </span>
      <span className="mt-0.5 text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </motion.div>
  );
}

export default function Index() {
  useEffect(() => {
    document.title = "PaintBook | Hire Verified Painters";
  }, []);

  const navigate = useNavigate();
  const sectionRef2 = useScrollAnimationList();
  const sectionRef3 = useScrollAnimation();
  const sectionRef4 = useScrollAnimationList();

  return (
    <div className="overflow-x-hidden">
      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="hero-mesh relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Floating paint blobs — decorative */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: "hsl(var(--primary) / 0.12)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
          className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full blur-3xl"
          style={{ background: "hsl(var(--secondary) / 0.10)" }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.6 }}
          className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "hsl(var(--accent) / 0.07)" }}
        />

        <div className="container relative mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-4xl space-y-8 text-center"
          >
            {/* Pill tag */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="paint-badge-coral">
                <Brush className="h-3 w-3" />
                Painting & Decorating Platform
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={fadeUp}
              custom={0.05}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight"
            >
              Painting jobs,{" "}
              <span className="text-paint-gradient">done the smart way.</span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              See your project, price it accurately, and book a verified
              painter — all in one place. Built exclusively for painting &
              decorating.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              variants={fadeUp}
              custom={0.15}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={() => navigate("/vestimator")}
                variant="paint"
                size="xl"
                className="rounded-full animate-glow-pulse shadow-glow-primary min-w-[240px]"
              >
                See Your Estimate in Minutes
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/find-painter")}
                variant="outline"
                size="xl"
                className="rounded-full min-w-[200px]"
              >
                <MapPin className="h-4 w-4" />
                Find a Painter
              </Button>
            </motion.div>

            {/* Trust badges row */}
            <motion.div
              variants={fadeUp}
              custom={0.2}
              className="flex flex-wrap justify-center gap-5 pt-2"
            >
              <TrustBadge icon={BadgeCheck} label="ID Verified" color="text-primary" />
              <TrustBadge icon={ShieldCheck} label="Fully Insured" color="text-secondary" />
              <TrustBadge icon={ShieldCheck} label="Escrow Protected" color="text-accent dark:text-accent" />
            </motion.div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto mt-14 flex flex-wrap justify-center gap-4 md:mt-16"
          >
            <StatPill value="2,400+" label="Verified Painters" color="text-primary" />
            <StatPill value="18,000+" label="Jobs Completed" color="text-secondary" />
            <StatPill value="4.9★" label="Avg. Rating" color="text-[hsl(42_96%_48%)]" />
            <StatPill value="100%" label="Escrow Protected" color="text-accent dark:text-accent" />
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2"
          >
            {[
              {
                icon: Calculator,
                title: "Smart Estimating",
                body: "Get accurate quotes in minutes with our AI-powered Vestimator tool.",
                color: "text-primary",
                bg: "bg-primary/8",
              },
              {
                icon: MapPin,
                title: "Local Professionals",
                body: "Connect with verified, insured painters in your area instantly.",
                color: "text-secondary",
                bg: "bg-secondary/8",
              },
            ].map(({ icon: Icon, title, body, color, bg }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur transition-all duration-300 hover:bg-card hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/25"
              >
                <div className={`flex-shrink-0 rounded-xl p-2.5 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          B2B COMMERCIAL SECTION
      ══════════════════════════════════════════════ */}
      <section className="section-wash-secondary relative py-20 md:py-28 lg:py-36">
        {/* Blob accent */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-[420px] w-[420px] -translate-y-1/3 translate-x-1/3 rounded-full blur-3xl opacity-[0.08]"
          style={{ background: "hsl(var(--secondary))" }}
        />

        <div className="container relative mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="mx-auto max-w-4xl space-y-10 text-center"
          >
            <motion.div variants={fadeUp}>
              <span className="paint-badge-teal">
                <Building2 className="h-3 w-3" />
                For Bulk & Multi-Project Work
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="font-display font-black">
              Commercial painting projects,{" "}
              <span className="text-gradient">handled end-to-end.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed"
            >
              From multi-site refurbishments to ongoing maintenance,
              PaintBookCo connects you with verified painting teams and
              manages scope, payments, and delivery — milestone by milestone.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={() => navigate("/b2b/find-painter")}
                variant="secondary"
                size="lg"
                className="rounded-full min-w-[240px]"
              >
                Find a Commercial Painter
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/b2b/consultation")}
                variant="outline-secondary"
                size="lg"
                className="rounded-full min-w-[200px]"
              >
                Book a Consultation
              </Button>
            </motion.div>

            {/* B2B feature cards */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 gap-5 pt-4 md:grid-cols-3"
            >
              {[
                {
                  icon: Sparkles,
                  title: "Milestone-Based Management",
                  body: "Track progress and trigger payments at each project milestone with full transparency.",
                  accent: "text-primary",
                  bg: "bg-primary/8",
                },
                {
                  icon: ShieldCheck,
                  title: "Escrow Protection",
                  body: "Protect both your business and painters with secure, regulated escrow settlement.",
                  accent: "text-secondary",
                  bg: "bg-secondary/8",
                },
                {
                  icon: MapPin,
                  title: "Multi-Site Coordination",
                  body: "Manage multiple projects across multiple locations with one point of contact.",
                  accent: "text-accent dark:text-accent",
                  bg: "bg-accent/10",
                },
              ].map(({ icon: Icon, title, body, accent, bg }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="flex flex-col items-center rounded-2xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur transition-all duration-300 hover:bg-card hover:shadow-card-hover hover:-translate-y-1.5 hover:border-primary/25"
                >
                  <div className={`mb-4 rounded-2xl p-3 ${bg}`}>
                    <Icon className={`h-6 w-6 ${accent}`} />
                  </div>
                  <h4 className="font-bold text-base">{title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════════
          TOP-RATED PAINTERS
      ══════════════════════════════════════════════ */}
      <section
        ref={sectionRef2}
        className="container mx-auto px-4 py-16 scroll-animate"
      >
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="brush-divider" />
          </div>
          <h2 className="font-display font-bold">Top rated near you</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Compare profiles at a glance and contact instantly.
          </p>
        </div>

        <div className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {[...painters]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3)
            .map((p) => (
              <div
                key={p.id}
                className="min-w-[82%] snap-center sm:min-w-0 scroll-animate"
              >
                <PainterCard painter={p} />
              </div>
            ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate("/find-painter")}
            variant="outline"
            size="lg"
            className="rounded-full"
          >
            View All Painters
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VESTIMATOR FEATURE SECTION
      ══════════════════════════════════════════════ */}
      <section
        ref={sectionRef3}
        className="section-wash-primary py-16 md:py-24 scroll-animate"
      >
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 md:gap-16 md:grid-cols-2">
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fc1db86da96eb40bd97ce4e112a273df4?format=webp&width=1200"
                alt="Vestimator — paint estimate tool"
                className="rounded-3xl shadow-2xl transition-shadow duration-300 hover:shadow-[0_32px_64px_-16px_hsl(var(--primary)/0.25)]"
              />
              {/* Floating badge on image */}
              <div className="absolute -bottom-4 -right-4 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <PaintBucket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold">Estimate ready</p>
                    <p className="text-[11px] text-muted-foreground">
                      in under 2 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="paint-badge-coral">
                  <Calculator className="h-3 w-3" />
                  Vestimator Tool
                </span>
                <h2 className="font-display font-bold mt-4">
                  Estimate your paint{" "}
                  <span className="text-gradient">in minutes.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Enter room dimensions, number of coats and openings. Get
                  litres required and a baseline material cost. Attach to your
                  job post with one click.
                </p>
              </div>

              <ul className="space-y-3 text-sm">
                {[
                  "Multi-room support with openings & coats",
                  "Brand comparison — Dulux, Farrow & Ball, Crown",
                  "Instant material cost breakdown",
                  "Attach directly to your job post",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: "hsl(var(--primary) / 0.12)" }}
                    >
                      <Star
                        className="h-3 w-3 text-primary"
                        fill="currentColor"
                      />
                    </span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-4 flex-wrap pt-2">
                <Button
                  onClick={() => navigate("/vestimator")}
                  variant="paint"
                  size="lg"
                  className="rounded-full"
                >
                  Open Vestimator
                </Button>
                <Button
                  onClick={() => navigate("/find-painter")}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                >
                  Find a Painter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CUSTOMER QUOTES
      ══════════════════════════════════════════════ */}
      <section
        ref={sectionRef4}
        className="container mx-auto px-4 py-16 md:py-24 scroll-animate"
      >
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="brush-divider" />
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
              What customers say
            </h3>
          </div>
          <h2 className="font-display font-bold">
            Trusted by thousands of{" "}
            <span className="text-gradient">homeowners & businesses.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              quote:
                "Flawless finish and super professional. The escrow deposit made payment completely stress-free.",
              name: "Ella R.",
              location: "London",
              rating: 5,
              color: "border-primary/30 hover:border-primary/50",
            },
            {
              quote:
                "Booked in a day, loved the portfolio, and the estimate tool was spot on for my budget.",
              name: "James K.",
              location: "Leeds",
              rating: 5,
              color: "border-secondary/30 hover:border-secondary/50",
            },
            {
              quote:
                "Felt safe with ID verified and insured badges. Great experience from start to finish.",
              name: "Priya S.",
              location: "Bristol",
              rating: 5,
              color: "border-accent/30 hover:border-accent/50",
            },
          ].map((t, i) => (
            <Card
              key={i}
              className={`border-2 scroll-animate transition-all duration-300 ${t.color}`}
            >
              <CardContent className="p-6 sm:p-8">
                {/* Stars */}
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 text-[hsl(42_96%_52%)] fill-[hsl(42_96%_52%)]"
                    />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-primary opacity-60" />
                <p className="mt-3 text-base leading-relaxed">{t.quote}</p>
                <p className="mt-5 text-sm font-semibold text-muted-foreground">
                  {t.name}{" "}
                  <span className="font-normal">· {t.location}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BOTTOM CTA BAND
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(28 95% 55%) 40%, hsl(var(--secondary)) 100%)",
          }}
        />
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full border-2 border-white/10 animate-spin-slow" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full border border-white/8 animate-float-bob" />

        <div className="container relative mx-auto px-4 text-center text-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl space-y-6"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> Ready to get started?
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display font-black text-white"
            >
              Your perfect painter is one click away.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-white/80 leading-relaxed"
            >
              Post your job for free. No commitment. Verified painters will
              send you quotes — you choose.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Button
                onClick={() => navigate("/post-job")}
                size="xl"
                className="rounded-full bg-white text-foreground font-bold shadow-lg hover:bg-white/95 hover:shadow-glow-primary hover:-translate-y-0.5 min-w-[200px]"
              >
                Post a Job Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/find-painter")}
                size="xl"
                variant="ghost"
                className="rounded-full border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 min-w-[180px]"
              >
                Browse Painters
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
