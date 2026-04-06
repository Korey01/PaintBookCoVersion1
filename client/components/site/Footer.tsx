import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="section-dark">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Top rule */}
        <div className="h-px bg-white/10" />

        {/* Main grid */}
        <div className="grid gap-12 py-16 md:grid-cols-12">

          {/* Brand — 5 cols */}
          <div className="md:col-span-5 space-y-6">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800"
              alt="PaintBookco"
              className="h-7 w-auto brightness-0 invert opacity-90"
            />
            <p className="text-sm leading-[1.7] text-white/50 max-w-[32ch]">
              The platform built exclusively for painting &amp; decorating.
              Find verified professionals, get accurate estimates, and pay with confidence.
            </p>
            <div className="flex flex-wrap gap-5 text-xs text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" /> ID Verified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Fully Insured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Escrow Protected
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Product links — 3 cols */}
          <div className="md:col-span-3">
            <p className="editorial-label text-white/30 mb-5">Product</p>
            <ul className="space-y-3">
              {[
                { to: "/find-painter",  label: "Find a Painter" },
                { to: "/post-job",      label: "Post a Job" },
                { to: "/vestimator",    label: "Paint Vestimator" },
                { to: "/join-painter",  label: "Join as a Painter" },
                { to: "/b2b/find-painter", label: "Commercial Projects" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links — 3 cols */}
          <div className="md:col-span-3">
            <p className="editorial-label text-white/30 mb-5">Company</p>
            <ul className="space-y-3">
              {[
                { to: "/about",        label: "About" },
                { to: "/trust-safety", label: "Trust & Safety" },
                { to: "/help",         label: "Help & Support" },
                { to: "/privacy",      label: "Privacy Policy" },
                { to: "/terms",        label: "Terms of Service" },
                { to: "/cookies",      label: "Cookie Policy" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px bg-white/10" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-white/25">
          <span>© {new Date().getFullYear()} The PaintBook Company Ltd. All rights reserved.</span>
          <span>Built for painters, by painters.</span>
        </div>
      </div>
    </footer>
  );
}
