import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  company?: string;
  testimonial: string;
  rating: number;
  image?: string;
  delay?: number;
}

export default function TestimonialCard({
  name,
  role,
  company,
  testimonial,
  rating,
  image,
  delay = 0,
}: TestimonialCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-blue-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-green-100",
    "bg-orange-100",
  ];
  const textColors = [
    "text-blue-600",
    "text-purple-600",
    "text-pink-600",
    "text-green-600",
    "text-orange-600",
  ];

  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl p-8 border border-border/50 hover:border-border hover:shadow-lg transition-all h-full flex flex-col"
    >
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="w-5 h-5 fill-amber-400 text-amber-400"
          />
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-5 h-5 text-muted-foreground/30"
          />
        ))}
      </div>

      {/* Quote Icon */}
      <Quote className="w-8 h-8 text-primary/20 mb-4" />

      {/* Testimonial Text */}
      <p className="text-foreground mb-6 flex-grow leading-relaxed italic">
        "{testimonial}"
      </p>

      {/* Divider */}
      <div className="border-t border-border/50 my-6"></div>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full ${colors[colorIndex]} flex items-center justify-center flex-shrink-0`}
        >
          <span className={`font-bold text-sm ${textColors[colorIndex]}`}>
            {initials}
          </span>
        </div>

        {/* Author Details */}
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
          {company && (
            <p className="text-xs text-muted-foreground/70">{company}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
