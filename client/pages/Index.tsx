import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, BadgeCheck, ArrowRight, Quote, Sparkles, Calculator, MapPin, PaintBucket } from "lucide-react";
import LogoStroke from "@/components/site/LogoStroke";
import PainterCard from "@/components/site/PainterCard";
import { painters } from "@/data/painters";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

export default function Index() {
  useEffect(()=>{ document.title = "PaintBook | Hire Verified Painters"; },[]);
  const navigate = useNavigate();
  const sectionRef1 = useScrollAnimation();
  const sectionRef2 = useScrollAnimationList();
  const sectionRef3 = useScrollAnimation();
  const sectionRef4 = useScrollAnimationList();
  const [jobType, setJobType] = useState<string>("");

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const location = String(form.get("location") || "").trim();
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (jobType) q.set("type", jobType);
    navigate(`/find-painter?${q.toString()}`);
  }

  return (
    <div className="space-y-20 sm:space-y-28 lg:space-y-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="container mx-auto px-4 animate-fade-in">
          <div className="space-y-8 md:space-y-12 text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-foreground">
                Painting jobs, finally done the smart way.
              </h1>

              {/* Supporting Text */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                See your project, price it accurately, and book a verified painter — all in one place. Built exclusively for painting & decorating.
              </p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex justify-center"
            >
              <Button
                onClick={() => navigate('/vestimator')}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                See Your Estimate in Minutes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium">ID Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium">Fully Insured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium">100% Escrow Protected</span>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card hover:border-border transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <Calculator className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-lg">Smart Estimating</h3>
                  <p className="text-sm text-muted-foreground mt-1">Get accurate quotes in minutes with our AI-powered estimator tool.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card hover:border-border transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-lg">Local Professionals</h3>
                  <p className="text-sm text-muted-foreground mt-1">Connect with verified, insured painters in your area instantly.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* B2B Commercial Section */}
      <section className="relative py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 animate-fade-in">
          <div className="space-y-8 md:space-y-12 text-center max-w-4xl mx-auto">
            {/* Section Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-semibold text-sm"
            >
              For Bulk & Multi-Project Work
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                Commercial painting projects, handled end-to-end.
              </h2>

              {/* Supporting Text */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From multi-site refurbishments to ongoing maintenance, PaintBookCo connects you with verified painting teams and manages scope, payments, and delivery — milestone by milestone.
              </p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={() => navigate('/b2b/find-painter')}
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Find a Commercial Painter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/b2b/consultation')}
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold w-full sm:w-auto"
              >
                Book a Consultation
              </Button>
            </motion.div>

            {/* Supporting Text */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-8 space-y-4"
            >
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Tell us where you're working, what you need done, and when.
              </h3>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We'll handle vetting, pricing alignment, escrow protection, and project coordination — so you stay in control without the admin.
              </p>
            </motion.div>

            {/* B2B Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 mt-8"
            >
              <div className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card hover:border-border transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-secondary flex-shrink-0" />
                </div>
                <h4 className="font-bold text-lg">Milestone-Based Management</h4>
                <p className="text-sm text-muted-foreground">Track progress and trigger payments at each project milestone with full transparency.</p>
              </div>

              <div className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card hover:border-border transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-secondary flex-shrink-0" />
                </div>
                <h4 className="font-bold text-lg">Escrow Protection</h4>
                <p className="text-sm text-muted-foreground">Protect both your business and your painters with secure, regulated escrow settlement.</p>
              </div>

              <div className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card hover:border-border transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <MapPin className="h-8 w-8 text-secondary flex-shrink-0" />
                </div>
                <h4 className="font-bold text-lg">Multi-Site Coordination</h4>
                <p className="text-sm text-muted-foreground">Manage multiple projects across multiple locations with one point of contact.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={sectionRef2} className="container mx-auto px-4 scroll-animate">
        <div className="space-y-3 mb-8">
          <h2>Top rated near you</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">Compare profiles at a glance and contact instantly.</p>
        </div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {[...painters].sort((a,b)=> b.rating - a.rating).slice(0,3).map((p) => (
            <div key={p.id} className="min-w-[80%] snap-center sm:min-w-0 scroll-animate">
              <PainterCard painter={p} />
            </div>
          ))}
        </div>
      </section>


      <section ref={sectionRef3} className="container mx-auto px-4 scroll-animate">
        <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fc1db86da96eb40bd97ce4e112a273df4?format=webp&width=1200" alt="Estimate tools" className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"/>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3>Estimate your paint in minutes</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">Enter room dimensions, number of coats and openings. Get litres required and a baseline material cost. Attach to your job post with one click.</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => navigate("/vestimator")} size="lg">Open Vestimator</Button>
              <Button onClick={() => navigate("/find-painter")} variant="outline" size="lg">Find A Painter</Button>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionRef4} className="container mx-auto px-4 scroll-animate">
        <div className="space-y-3 mb-8">
          <h3>What customers say</h3>
          <p className="text-lg text-muted-foreground">Trusted by hundreds of homeowners and businesses</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[{
            quote: "Flawless finish and super professional. The escrow deposit made payment stress-free.", name: "Ella R.", location: "London"
          },{
            quote: "Booked in a day, loved the portfolio, and the estimate tool was spot on.", name: "James K.", location: "Leeds"
          },{
            quote: "Felt safe with ID verified and insured badges. Great experience.", name: "Priya S.", location: "Bristol"
          }].map((t, i) => (
            <Card key={i} className="border-muted/60 scroll-animate">
              <CardContent className="p-6 sm:p-8">
                <Quote className="h-6 w-6 text-primary"/>
                <p className="mt-4 text-base leading-relaxed">{t.quote}</p>
                <p className="mt-6 text-sm text-muted-foreground font-medium">{t.name} · {t.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
