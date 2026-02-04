import { motion } from "framer-motion";
import { Star, ArrowRight, ExternalLink } from "lucide-react";
import TestimonialCard from "@/components/site/TestimonialCard";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Property Manager",
    company: "Pinnacle Estates London",
    testimonial:
      "The professionalism and attention to detail from the PaintBookCo painters was exceptional. They completed our 50-unit renovation 3 days ahead of schedule and all tenants were impressed with the quality. Will definitely use again.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Facilities Director",
    company: "Tech Hub Manchester",
    testimonial:
      "We needed to repaint our entire office complex during operation. PaintBookCo's team was incredibly accommodating with our tight schedule, worked evenings and weekends, and delivered flawless results. Highly recommended.",
    rating: 5,
  },
  {
    name: "Rebecca Thompson",
    role: "Architect",
    company: "Thompson Design Group",
    testimonial:
      "I've recommended PaintBookCo to numerous clients and they consistently deliver premium quality. The vetting process ensures you get verified, professional painters every time. The escrow protection is a game-changer.",
    rating: 5,
  },
  {
    name: "Michael O'Brien",
    role: "Facilities Manager",
    company: "Birmingham Healthcare Trust",
    testimonial:
      "Managing painters for a healthcare facility requires absolute precision with hygiene and scheduling. PaintBookCo's verified painters understood our requirements perfectly and delivered impeccable work. Best experience we've had.",
    rating: 5,
  },
];

const stats = [
  { number: "4.9", label: "Average Rating", unit: "/5" },
  { number: "1,200+", label: "Happy Customers", unit: "" },
  { number: "98%", label: "Would Recommend", unit: "" },
  { number: "15k+", label: "Projects Completed", unit: "" },
];

export default function CommercialTestimonials() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-muted to-background"
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-4 md:px-6 py-16 md:py-28 overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-semibold text-primary">
                Trusted by 1000+ Customers
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Painting Done Right,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Every Time
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8"
          >
            See what customers across the UK are saying about their painting
            projects. From commercial offices to residential renovations, our
            verified painters consistently deliver excellence.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wide transition-all hover:shadow-lg hover:-translate-y-1 flex items-center gap-2">
              Get Your Free Quote <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://www.trustpilot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border-2 border-primary text-primary hover:bg-primary/10 font-bold uppercase tracking-wide transition-all flex items-center gap-2"
            >
              View on Trustpilot <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 md:px-6 py-16"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 border border-border/50 text-center hover:border-border hover:shadow-lg transition-all"
              >
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {stat.number}
                  </p>
                  {stat.unit && (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground font-semibold mt-3">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 md:px-6 py-20"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real testimonials from homeowners and businesses who've trusted
              PaintBookCo with their painting projects
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} {...testimonial} delay={idx * 0.15} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Trust & Security Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 md:px-6 py-20 bg-card/50 border-y border-border/50"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Customers Trust PaintBookCo
            </h2>
            <p className="text-muted-foreground text-lg">
              Every painter is verified and every project is protected
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Painters",
                description:
                  "All painters undergo thorough background checks and professional verification",
                icon: "✓",
              },
              {
                title: "100% Escrow Protected",
                description:
                  "Your funds are held in escrow until you approve the work",
                icon: "🔒",
              },
              {
                title: "Dispute Resolution",
                description:
                  "Any issues are handled fairly with our professional dispute resolution team",
                icon: "⚖️",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 md:px-6 py-20"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12 md:p-16 border border-primary/20 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Painting Project?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join over 1,000 satisfied customers. Get accurate quotes from
              verified painters in minutes.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wide transition-all hover:shadow-lg hover:-translate-y-1">
                POST A JOB NOW
              </button>
              <button className="px-8 py-4 rounded-full border-2 border-primary text-primary hover:bg-primary/10 font-bold uppercase tracking-wide transition-all">
                FIND A PAINTER
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
