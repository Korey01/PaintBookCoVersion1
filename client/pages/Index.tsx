import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Calculator,
  MapPin,
  PaintBucket,
  Star,
  Building2,
  ChevronDown,
} from "lucide-react";
import PainterCard from "@/components/site/PainterCard";
import TestimonialsSection from "@/components/site/TestimonialsSection";
import { painters } from "@/data/painters";
import {
  useScrollAnimation,
  useScrollAnimationList,
} from "@/hooks/useScrollAnimation";

/* ── Motion config ── */
const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay, ease },
  }),
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, delay, ease },
  }),
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

/* ── Shared section heading ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="editorial-label text-muted-foreground mb-4 flex items-center gap-3">
      <span className="inline-block h-px w-8 bg-current" />
      {children}
    </p>
  );
}

export default function Index() {
  useEffect(() => { document.title = "PaintBook | Hire Verified Painters"; }, []);

  const navigate   = useNavigate();
  const ref2 = useScrollAnimationList();
  const ref3 = useScrollAnimation();
  const ref4 = useScrollAnimationList();

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO — full-viewport, dark, editorial
      ══════════════════════════════════════════════ */}
      {/* ── Video hero: no background colour — the Layout video shows through ── */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">

        {/* Dark scrim — lets video breathe while keeping text legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/62 via-black/55 to-black/75" />

        {/* Subtle grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative mx-auto max-w-4xl"
        >
          {/* Label */}
          <motion.p
            variants={fadeIn}
            custom={0}
            className="editorial-label text-white/40 mb-8 tracking-[0.2em]"
          >
            Painting &amp; Decorating Platform
          </motion.p>

          {/* Headline — large serif */}
          <motion.h1
            variants={fadeUp}
            custom={0.05}
            className="text-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.02] tracking-[-0.03em] mb-8"
          >
            Your home,
            <br />
            <em className="not-italic" style={{ color: "hsl(var(--coral))" }}>
              beautifully painted.
            </em>
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            variants={fadeUp}
            custom={0.12}
            className="mx-auto max-w-lg text-lg text-white/55 leading-[1.7] mb-12"
          >
            See your project, price it accurately, and book a verified painter
            — all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={0.2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              onClick={() => navigate("/post-job")}
              variant="outline-light"
              size="xl"
              className="min-w-[200px]"
            >
              Post a Job
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate("/vestimator")}
              variant="ghost-light"
              size="xl"
              className="min-w-[200px]"
            >
              Get an Estimate
            </Button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={fadeIn}
            custom={0.3}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/35"
          >
            {[
              { icon: BadgeCheck, label: "ID Verified Painters" },
              { icon: ShieldCheck, label: "Fully Insured" },
              { icon: ShieldCheck, label: "Escrow Protected" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25"
        >
          <span className="editorial-label text-[10px] text-white/25">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-scroll-bounce" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAND — light, minimal
      ══════════════════════════════════════════════ */}
      <section className="section-warm border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40"
          >
            {[
              { value: "2,400+",  label: "Verified Painters" },
              { value: "18,000+", label: "Jobs Completed" },
              { value: "4.9",     label: "Average Rating", suffix: "★" },
              { value: "100%",    label: "Escrow Protected" },
            ].map(({ value, label, suffix }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex flex-col items-center py-6 px-4 text-center"
              >
                <span className="text-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
                  {value}{suffix}
                </span>
                <span className="editorial-label mt-1.5">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — light, 3-step editorial
      ══════════════════════════════════════════════ */}
      <section className="section-light py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="text-serif max-w-xl mb-16">
                From estimate to booking,<br />in three steps.
              </h2>
            </motion.div>

            <div className="grid gap-0 md:grid-cols-3 border border-border/50">
              {[
                {
                  num: "01",
                  icon: Calculator,
                  title: "Get your estimate",
                  body: "Use the Vestimator to calculate exact paint quantities and a material cost baseline — before you speak to a single painter.",
                  cta: "Open Vestimator",
                  href: "/vestimator",
                },
                {
                  num: "02",
                  icon: MapPin,
                  title: "Find & compare painters",
                  body: "Browse verified, insured painters by location, specialty, rating and price. See real portfolios, not just profiles.",
                  cta: "Find Painters",
                  href: "/find-painter",
                },
                {
                  num: "03",
                  icon: ShieldCheck,
                  title: "Book with confidence",
                  body: "Post your job, receive quotes, and pay securely through escrow. Funds release only when the work is done to your standard.",
                  cta: "Post a Job",
                  href: "/post-job",
                },
              ].map(({ num, icon: Icon, title, body, cta, href }, i) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  custom={i * 0.1}
                  className="group flex flex-col p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border/50 last:border-0 transition-colors duration-300 hover:bg-muted/40"
                >
                  <span className="editorial-label text-primary mb-6">{num}</span>
                  <div className="mb-4 p-3 w-fit bg-muted">
                    <Icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <h3 className="text-serif text-xl mb-3 font-normal">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-[1.7] mb-6 flex-1">{body}</p>
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group-hover:gap-2.5"
                  >
                    {cta} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOP-RATED PAINTERS
      ══════════════════════════════════════════════ */}
      <section ref={ref2} className="section-warm py-24 sm:py-32 scroll-animate">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <SectionLabel>Professionals</SectionLabel>
              <h2 className="text-serif max-w-sm">Top rated near you.</h2>
            </div>
            <Button
              onClick={() => navigate("/find-painter")}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 scroll-stagger">
            {[...painters]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((p) => (
                <div key={p.id} className="scroll-animate">
                  <PainterCard painter={p} />
                </div>
              ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Button onClick={() => navigate("/find-painter")} variant="outline" size="sm" className="w-full">
              View all painters <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VESTIMATOR FEATURE — dark split
      ══════════════════════════════════════════════ */}
      <section ref={ref3} className="section-dark py-24 sm:py-32 scroll-animate">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 md:grid-cols-2 md:items-center">

            {/* Image */}
            <div className="relative order-last md:order-first">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fc1db86da96eb40bd97ce4e112a273df4?format=webp&width=1200"
                alt="Vestimator tool"
                className="w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 bg-background border border-border/40 px-4 py-3 shadow-editorial">
                <div className="flex items-center gap-3">
                  <PaintBucket className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Estimate ready</p>
                    <p className="text-[11px] text-muted-foreground">Under 2 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-8">
              <div>
                <SectionLabel>
                  <span className="text-white/30">Vestimator</span>
                </SectionLabel>
                <h2 className="text-serif text-white mb-6">
                  Estimate your paint<br />
                  <em className="not-italic" style={{ color: "hsl(var(--coral))" }}>in minutes.</em>
                </h2>
                <p className="text-white/55 leading-[1.7] text-base">
                  Enter room dimensions, number of coats and openings.
                  Get exact litres required and a material cost — with brand
                  comparisons across Dulux, Farrow &amp; Ball, and Crown.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Multi-room support with openings & coats",
                  "Brand-by-brand cost comparison",
                  "Instant material cost breakdown",
                  "Attach directly to your job post",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="h-px w-5 bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate("/vestimator")} variant="outline-light" size="lg">
                  Open Vestimator
                </Button>
                <Button onClick={() => navigate("/find-painter")} variant="ghost-light" size="lg">
                  Find a Painter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMMERCIAL / B2B — light
      ══════════════════════════════════════════════ */}
      <section className="section-light py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.div variants={fadeUp}>
                <SectionLabel>Commercial</SectionLabel>
                <h2 className="text-serif mb-6">
                  Large-scale projects,<br />handled end-to-end.
                </h2>
                <p className="text-muted-foreground leading-[1.7] mb-8">
                  From multi-site refurbishments to ongoing maintenance contracts,
                  PaintBookCo connects you with verified painting teams and manages
                  scope, payments, and delivery — milestone by milestone.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => navigate("/b2b/find-painter")} variant="default" size="lg">
                    Find Commercial Painters <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => navigate("/b2b/consultation")} variant="outline" size="lg">
                    Book a Consultation
                  </Button>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.15} className="space-y-0 border border-border/50">
              {[
                {
                  icon: Sparkles,
                  title: "Milestone-based payments",
                  body: "Funds release at each agreed milestone — keeping projects moving and both parties protected.",
                },
                {
                  icon: ShieldCheck,
                  title: "Regulated escrow",
                  body: "Every payment sits in regulated escrow until work is verified complete.",
                },
                {
                  icon: Building2,
                  title: "Multi-site coordination",
                  body: "Manage multiple locations and teams from one dashboard with a single point of contact.",
                },
              ].map(({ icon: Icon, title, body }, i) => (
                <div
                  key={title}
                  className="flex gap-5 p-6 border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-[1.6]">{body}</p>
                  </div>
                </div>
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
          CUSTOMER QUOTES — warm light
      ══════════════════════════════════════════════ */}
      <section ref={ref4} className="section-warm py-24 sm:py-32 scroll-animate">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12">
            <SectionLabel>Reviews</SectionLabel>
            <h2 className="text-serif max-w-md">
              Trusted by homeowners &amp; businesses.
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-3 border border-border/50 scroll-stagger">
            {[
              {
                quote: "Flawless finish and super professional. The escrow deposit made payment completely stress-free.",
                name: "Ella R.", location: "London", rating: 5,
              },
              {
                quote: "Booked in a day, loved the portfolio. The estimate tool was spot-on for my budget.",
                name: "James K.", location: "Leeds", rating: 5,
              },
              {
                quote: "Felt completely safe with ID verified and insured badges. Great experience throughout.",
                name: "Priya S.", location: "Bristol", rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="scroll-animate flex flex-col p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border/50 last:border-0 bg-card"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-6">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-[1.75] text-foreground/80 flex-1 mb-8">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BAND — dark, full-width
      ══════════════════════════════════════════════ */}
      <section className="section-dark py-28 sm:py-36 overflow-hidden relative">
        {/* Faint decorative rings */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full border border-white/5 animate-spin-slow" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full border border-white/5 animate-spin-slow" style={{ animationDuration: "32s", animationDirection: "reverse" }} />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-8"
          >
            <motion.p variants={fadeIn} custom={0} className="editorial-label text-white/30 tracking-[0.2em]">
              Ready to begin
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={0.05}
              className="text-serif text-white text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.05]"
            >
              Your perfect painter<br />is one click away.
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.12} className="text-white/45 text-base leading-[1.7] max-w-lg mx-auto">
              Post your job for free. No commitment. Verified painters send
              quotes — you choose the best fit.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={0.2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Button
                onClick={() => navigate("/post-job")}
                variant="outline-light"
                size="xl"
                className="min-w-[200px]"
              >
                Post a Job Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/find-painter")}
                variant="ghost-light"
                size="xl"
                className="min-w-[180px]"
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
