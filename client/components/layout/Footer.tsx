import { Link } from "react-router-dom";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F14c4faafcca042659116108680661770%2F30b601eb466f425b8151484359ee8820?format=webp&width=800&height=1200";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">Paint. Book. Done.</p>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Company</p>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-foreground hover:text-muted-foreground transition-colors">About</Link></li>
              <li><Link to="/how-it-works/customers" className="text-sm text-foreground hover:text-muted-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Legal</p>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Support</p>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Help & FAQ</Link></li>
              <li><a href="mailto:hello@paintbookco.co.uk" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Email Support</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="space-y-1 text-center md:text-left">
            <p><strong>The PaintBook Company Ltd</strong></p>
            <p>Company No. 16690724 | © 2026 PaintBookCo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
