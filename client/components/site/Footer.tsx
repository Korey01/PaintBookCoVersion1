import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, Paintbrush2, Mail, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient top border */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(42 96% 52%) 35%, hsl(var(--secondary)) 65%, hsl(var(--accent)) 100%)",
        }}
      />

      {/* Dark branded background */}
      <div className="bg-foreground text-background">
        {/* Decorative blob — top right */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-80 w-80 -translate-y-1/4 translate-x-1/4 rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 translate-y-1/4 -translate-x-1/4 rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "hsl(var(--secondary))" }}
        />

        <div className="container relative mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 space-y-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800"
              alt="PaintBookco logo"
              className="h-[2.1rem] w-auto brightness-0 invert drop-shadow-sm"
            />
            <p className="max-w-[28ch] text-sm leading-relaxed text-background/65">
              Find trusted, verified painters and decorators. Book with
              confidence — deposit protection via secure escrow.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-background/70">
                <BadgeCheck
                  className="h-4 w-4"
                  style={{ color: "hsl(var(--primary))" }}
                />
                ID Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-background/70">
                <ShieldCheck
                  className="h-4 w-4"
                  style={{ color: "hsl(var(--accent))" }}
                />
                Fully Insured
              </span>
              <span className="inline-flex items-center gap-1.5 text-background/70">
                <Paintbrush2
                  className="h-4 w-4"
                  style={{ color: "hsl(var(--secondary))" }}
                />
                Escrow Protected
              </span>
            </div>

            {/* Social icons */}
            <div className="flex gap-3 pt-1">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin,  label: "LinkedIn" },
                { icon: Mail,      label: "Email" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-background/15 bg-background/8 text-background/60 transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: "hsl(var(--primary))" }}
            >
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              {[
                { to: "/find-painter",  label: "Find A Painter/Decorator" },
                { to: "/post-job",      label: "Post a Job" },
                { to: "/vestimator",    label: "Paint Vestimator" },
                { to: "/join-painter",  label: "Join as A Painter" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="transition-colors duration-200 hover:text-background"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: "hsl(var(--secondary))" }}
            >
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              {[
                { to: "/about",        label: "About" },
                { to: "/help",         label: "Help & Support" },
                { to: "/trust-safety", label: "Trust & Safety" },
                { to: "/privacy",      label: "Privacy" },
                { to: "/terms",        label: "Terms" },
                { to: "/cookies",      label: "Cookies" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="transition-colors duration-200 hover:text-background"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 py-4 text-center text-xs text-background/35">
          © {new Date().getFullYear()} The PaintBook Company Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
