import { Link } from "react-router-dom";

const COMPANY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works/customers", label: "How It Works" },
  { to: "/contact", label: "Contact" },
  { to: "/help", label: "Help" },
];

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
];

export default function Footer() {
  return (
    <footer className="section-dark text-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="font-display text-xl font-normal text-white inline-block mb-4">
              PaintBookCo
            </Link>
            <p className="text-white/55 text-sm max-w-xs leading-[1.7] mb-6">
              The UK's dedicated marketplace connecting homeowners and businesses with
              KYC-verified professional painters and decorators.
            </p>
            <div className="text-white/35 text-xs leading-relaxed">
              <p>The PaintBook Company Ltd</p>
              <p>Company Number: 16690724</p>
              <p>Registered in England and Wales</p>
            </div>
          </div>

          {/* Company links */}
          <div>
            <p className="editorial-label text-white/35 mb-5">Company</p>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/55 hover:text-white transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="editorial-label text-white/35 mb-5">Legal</p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/55 hover:text-white transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© 2026 The PaintBook Company Ltd. All rights reserved.</p>
          <p>FCA Authorised Escrow Partner: Transpact (Ref: 546279)</p>
        </div>
      </div>
    </footer>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(Footer, {
      name: "PublicFooter",
      inputs: [],
    });
  })
  .catch(() => {});
