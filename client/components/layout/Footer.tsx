import { Link } from "react-router-dom";

const COL1 = [
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works/customers", label: "How It Works" },
  { to: "/contact", label: "Contact" },
  { to: "/help", label: "Help & FAQ" },
];

const COL2 = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
];

export default function Footer() {
  return (
    <footer className="section-dark">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link to="/" className="font-display text-2xl text-white/90 inline-block mb-5">
              PaintBookCo
            </Link>
            <p className="text-sm text-white/45 leading-[1.8] max-w-xs mb-8">
              The UK's dedicated marketplace connecting homeowners and businesses
              with KYC-verified professional painters and decorators.
            </p>
            <div className="text-xs text-white/30 leading-[1.8]">
              <p>The PaintBook Company Ltd</p>
              <p>Company Number: 16690724</p>
              <p>Registered in England and Wales</p>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="editorial-label text-white/30 mb-6">Company</p>
            <ul className="space-y-4">
              {COL1.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/50 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="editorial-label text-white/30 mb-6">Legal</p>
            <ul className="space-y-4">
              {COL2.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/50 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>© 2026 The PaintBook Company Ltd. All rights reserved.</p>
          <p>FCA Authorised Escrow Partner: Transpact (Ref: 546279)</p>
        </div>
      </div>
    </footer>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(Footer, { name: "PublicFooter", inputs: [] }); })
  .catch(() => {});
