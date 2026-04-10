/**
 * Shared layout wrapper for all legal pages (Privacy, Terms, Cookies).
 * Renders within the main Layout (Header + Footer already present).
 *
 * Styling spec:
 *  - Navy #1B3A5C headings
 *  - Arial / system sans-serif body
 *  - Max-width 800px centered
 */
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const navy = "#1B3A5C";

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      className="w-full bg-white"
    >
      {/* ── Breadcrumb bar ── */}
      <div
        style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}
        className="w-full"
      >
        <div
          style={{ maxWidth: "800px" }}
          className="mx-auto px-6 py-3 flex items-center gap-1.5 text-sm"
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:underline"
            style={{ color: navy }}
          >
            <Home style={{ width: "13px", height: "13px" }} />
            Home
          </Link>
          <ChevronRight style={{ width: "13px", height: "13px", color: "#9ca3af" }} />
          <span style={{ color: "#6b7280" }}>{title}</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: "800px" }} className="mx-auto px-6 py-12">
        {/* Page title + metadata */}
        <header style={{ borderBottom: "2px solid #e5e7eb", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
          <h1
            style={{
              color: navy,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "2rem",
              fontWeight: "700",
              lineHeight: "1.2",
              margin: "0 0 0.5rem 0",
            }}
          >
            {title}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
            Last updated: <strong style={{ color: "#374151" }}>{lastUpdated}</strong>
          </p>
        </header>

        {/* Page body */}
        <div className="legal-content">
          {children}
        </div>
      </div>

      {/* ── Legal page footer ── */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <div
          style={{ maxWidth: "800px" }}
          className="mx-auto px-6 py-10"
        >
          <div
            className="grid gap-6 md:grid-cols-3"
            style={{ fontSize: "0.8125rem", color: "#6b7280" }}
          >
            <div>
              <p style={{ fontWeight: "700", color: navy, marginBottom: "0.5rem" }}>
                PaintBookco Ltd
              </p>
              <p style={{ margin: 0, lineHeight: "1.6" }}>
                Registered in England &amp; Wales<br />
                Company No. [Registration No.]<br />
                ICO Registration No. [ICO No.]
              </p>
            </div>
            <div>
              <p style={{ fontWeight: "700", color: "#374151", marginBottom: "0.5rem" }}>
                Legal
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <Link to="/privacy" style={{ color: navy, textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >Privacy Policy</Link>
                <Link to="/terms" style={{ color: navy, textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >Terms of Service</Link>
                <Link to="/cookies" style={{ color: navy, textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >Cookie Policy</Link>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: "700", color: "#374151", marginBottom: "0.5rem" }}>
                Contact
              </p>
              <p style={{ margin: 0, lineHeight: "1.6" }}>
                General: <a href="mailto:hello@paintbookco.com" style={{ color: navy }}>hello@paintbookco.com</a><br />
                Privacy: <a href="mailto:privacy@paintbookco.com" style={{ color: navy }}>privacy@paintbookco.com</a><br />
                Support: <Link to="/help" style={{ color: navy }}>Help Centre</Link>
              </p>
            </div>
          </div>
          <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
            © {new Date().getFullYear()} PaintBookco Ltd. All rights reserved.
          </p>
        </div>
      </div>

      {/* Global legal content styles */}
      <style>{`
        .legal-content h2 {
          color: ${navy};
          font-family: Arial, Helvetica, sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 2.25rem 0 0.75rem 0;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .legal-content h3 {
          color: ${navy};
          font-family: Arial, Helvetica, sans-serif;
          font-size: 1rem;
          font-weight: 700;
          margin: 1.5rem 0 0.5rem 0;
        }
        .legal-content p {
          color: #374151;
          font-size: 0.9375rem;
          line-height: 1.75;
          margin: 0 0 1rem 0;
        }
        .legal-content ul, .legal-content ol {
          color: #374151;
          font-size: 0.9375rem;
          line-height: 1.75;
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
        }
        .legal-content li {
          margin-bottom: 0.375rem;
        }
        .legal-content a {
          color: ${navy};
          text-decoration: underline;
        }
        .legal-content a:hover {
          color: #2563eb;
        }
        .legal-content strong {
          color: #1f2937;
          font-weight: 700;
        }
        .legal-content .notice-box {
          background: #eff6ff;
          border-left: 4px solid ${navy};
          padding: 1rem 1.25rem;
          margin: 1.25rem 0;
          border-radius: 0 4px 4px 0;
        }
        .legal-content .notice-box p {
          margin: 0;
          font-size: 0.875rem;
          color: #1e3a5f;
        }
        .legal-content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin: 1rem 0 1.5rem 0;
        }
        .legal-content th {
          background: #f3f4f6;
          color: ${navy};
          font-weight: 700;
          text-align: left;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
        }
        .legal-content td {
          padding: 0.5rem 0.875rem;
          border: 1px solid #e5e7eb;
          color: #374151;
          vertical-align: top;
        }
        .legal-content tr:nth-child(even) td {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}
