import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "The professionalism and attention to detail was exceptional. They completed our renovation 3 days ahead of schedule and all clients were impressed.",
    name: "Sarah Mitchell",
    role: "Property Manager",
    location: "London",
    rating: 5,
  },
  {
    quote:
      "We needed to repaint our office complex during operation. Incredibly accommodating with scheduling, worked evenings, and delivered flawless results.",
    name: "James Chen",
    role: "Facilities Director",
    location: "Manchester",
    rating: 5,
  },
  {
    quote:
      "I've recommended PaintBookCo to numerous clients and they consistently deliver premium quality. The escrow protection is a game-changer.",
    name: "Rebecca Thompson",
    role: "Architect",
    location: "Edinburgh",
    rating: 5,
  },
  {
    quote:
      "Managing painters for a healthcare facility requires absolute precision. PaintBookCo's verified painters understood our requirements perfectly.",
    name: "Michael O'Brien",
    role: "Facilities Manager",
    location: "Birmingham",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const sectionRef = useScrollAnimation();

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-4 scroll-animate py-16 md:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        className="space-y-3 mb-12"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground">
          Trusted by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            1000+ customers
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Real testimonials from homeowners and businesses who've trusted
          PaintBookCo with their painting projects
        </p>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 scroll-animate flex flex-col"
          >
            {/* Star Rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            {/* Quote Icon */}
            <Quote className="h-6 w-6 text-primary/30 mb-4" />

            {/* Testimonial Text */}
            <p className="text-base leading-relaxed text-foreground mb-6 flex-grow italic">
              "{testimonial.quote}"
            </p>

            {/* Divider */}
            <div className="border-t border-border/50 my-6"></div>

            {/* Author Info */}
            <div className="flex items-center gap-3">
              {/* Avatar with initials */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <span className="font-bold text-sm text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>

              {/* Author Details */}
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role} · {testimonial.location}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        className="mt-16 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20"
      >
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
          Join over 1,000 satisfied customers
        </h3>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Get accurate quotes from verified painters in minutes. Start your
          project today.
        </p>
        <a
          href="https://www.trustpilot.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all hover:shadow-lg hover:-translate-y-1"
        >
          View All Reviews on Trustpilot →
        </a>
      </motion.div>
    </section>
  );
}
