/**
 * Shared layout wrapper for all legal pages (Privacy, Terms, Cookies).
 * Styled to match the PaintBookCo editorial brand theme:
 *  - DM Serif Display headings, DM Sans body
 *  - Near-black/cream palette via CSS custom properties
 *  - Coral primary accent for visual anchors
 *  - Max-width 800px centered
 */
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  version?: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  version,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="w-full" style={{ background: '#FBF7F0', color: '#1A1A14' }}>

      {/* ── Page header ── */}
      <div className="section-dark py-14 px-6">
        <div className="mx-auto" style={{ maxWidth: "800px" }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-8">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60">{title}</span>
          </nav>
          {/* Title */}
          <p className="editorial-label text-primary mb-3">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl font-normal text-white leading-[1.1] mb-5">
            {title}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/45">
            <span>Last updated: <strong className="text-white/65">{lastUpdated}</strong></span>
            {version && <span>Version: <strong className="text-white/65">{version}</strong></span>}
            <span>The PaintBook Company Ltd · Co. No. 16690724</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-6 py-14">
        <div className="mx-auto legal-content" style={{ maxWidth: "800px" }}>
          {children}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="section-warm border-t border-border/50">
        <div className="mx-auto px-6 py-12" style={{ maxWidth: "800px" }}>
          <div className="grid gap-8 md:grid-cols-3 text-sm">
            <div>
              <p className="font-semibold text-foreground mb-2">The PaintBook Company Ltd</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Trading as PaintBookCo<br />
                Registered in England &amp; Wales<br />
                Company No. 16690724<br />
                ICO Registration No. ZC118117<br />
                1, 1 Fenman Mews, Walkden<br />
                Manchester, M28 3YU
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Legal</p>
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Contact</p>
              <div className="text-xs text-muted-foreground leading-relaxed">
                <p>General: <a href="mailto:hello@paintbookco.co.uk" className="text-primary hover:underline">hello@paintbookco.co.uk</a></p>
                <p>Privacy: <a href="mailto:privacy@paintbookco.co.uk" className="text-primary hover:underline">privacy@paintbookco.co.uk</a></p>
                <p>Website: <a href="https://paintbookco.co.uk" className="text-primary hover:underline">paintbookco.co.uk</a></p>
              </div>
            </div>
          </div>
          <p className="mt-8 pt-6 border-t border-border/40 text-xs text-muted-foreground">
            © {new Date().getFullYear()} The PaintBook Company Ltd (trading as PaintBookCo). All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Legal content styles ── */}
      <style>{`
        .legal-content .notice-box {
          background: hsl(var(--muted));
          border-left: 3px solid hsl(var(--primary));
          padding: 1rem 1.25rem;
          margin: 0 0 2rem 0;
          font-size: 0.9rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
        }
        .legal-content .notice-box strong {
          color: hsl(var(--foreground));
        }
        .legal-content h2 {
          font-family: "DM Serif Display", Georgia, serif;
          font-size: 1.35rem;
          font-weight: 400;
          color: hsl(var(--foreground));
          margin: 2.5rem 0 0.75rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid hsl(var(--border));
        }
        .legal-content h3 {
          font-family: "DM Sans", ui-sans-serif, sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 1.75rem 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .legal-content p {
          font-family: "DM Sans", ui-sans-serif, sans-serif;
          font-size: 0.9375rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.8;
          margin: 0 0 1rem 0;
        }
        .legal-content ul, .legal-content ol {
          font-family: "DM Sans", ui-sans-serif, sans-serif;
          font-size: 0.9375rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.8;
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
        }
        .legal-content li {
          margin-bottom: 0.4rem;
        }
        .legal-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-content a:hover {
          opacity: 0.75;
        }
        .legal-content strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }
        .legal-content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin: 1rem 0 1.75rem 0;
          font-family: "DM Sans", ui-sans-serif, sans-serif;
        }
        .legal-content th {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          font-weight: 700;
          text-align: left;
          padding: 0.625rem 0.875rem;
          border: 1px solid hsl(var(--border));
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .legal-content td {
          padding: 0.5rem 0.875rem;
          border: 1px solid hsl(var(--border));
          color: hsl(var(--muted-foreground));
          vertical-align: top;
          line-height: 1.6;
        }
        .legal-content tr:nth-child(even) td {
          background: hsl(var(--muted) / 0.4);
        }
        .legal-content .section-intro {
          font-size: 1rem;
          color: hsl(var(--foreground));
          line-height: 1.75;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
