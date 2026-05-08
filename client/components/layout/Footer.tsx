import { Link } from "react-router-dom";

const LOGO = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">Paint. Book. Done.</p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Platform</p>
            <ul className="space-y-2">
              <li><Link to="/how-it-works/customers" className="text-sm text-foreground hover:text-muted-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/find-painters" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Find Painters</Link></li>
              <li><Link to="/join-painter" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Join as a Decorator</Link></li>
              <li><Link to="/pricing" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Pricing</Link></li>
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
              <li><Link to="/contact" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Contact</Link></li>
              <li><Link to="/help" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Help & FAQ</Link></li>
              <li><Link to="/trust-safety" className="text-sm text-foreground hover:text-muted-foreground transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="space-y-1 text-center md:text-left">
            <p><strong>The PaintBook Company Ltd</strong></p>
            <p>Company No. 16690724 | © 2026 PaintBookCo. All rights reserved.</p>
          </div>
          <p className="text-xs">Payments secured by <strong>Transpact Escrow</strong></p>
        </div>
      </div>
    </footer>
  );
}
