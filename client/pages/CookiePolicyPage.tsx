import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookiePolicyPage() {
  useEffect(() => {
    document.title = "Cookie Policy | PaintBookCo";
  }, []);

  return (
    <div className="bg-background">
      {/* Header spacer */}
      <div className="h-16" />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="editorial-label text-primary mb-4 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-current" />
          Legal
        </p>
        <h1 className="font-display text-4xl text-foreground mb-3">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-muted-foreground">
          <section>
            <h2 className="font-display text-xl text-foreground mb-3">What are cookies?</h2>
            <p className="leading-[1.7] text-sm">
              Cookies are small text files stored on your device when you visit a website.
              They allow the website to remember your preferences, keep you logged in, and
              understand how you use the site. They do not contain personal information on
              their own.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-4">Cookies we use</h2>

            <div className="space-y-6">
              {/* Essential */}
              <div className="border border-border p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Essential cookies</h3>
                  <span className="editorial-label text-primary-foreground bg-foreground px-2 py-0.5">
                    Always on
                  </span>
                </div>
                <p className="text-sm leading-[1.7] mb-3">
                  These cookies are required for the platform to function. They cannot be
                  disabled.
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Cookie</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Purpose</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono">paintbook:user</td>
                      <td className="py-2 pr-4">Authentication session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono">sb-*</td>
                      <td className="py-2 pr-4">Supabase authentication tokens</td>
                      <td className="py-2">Up to 1 week</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono">cookie_consent</td>
                      <td className="py-2 pr-4">Records your cookie preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Analytics */}
              <div className="border border-border p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Analytics cookies</h3>
                  <span className="editorial-label border border-border text-muted-foreground px-2 py-0.5">
                    Optional
                  </span>
                </div>
                <p className="text-sm leading-[1.7] mb-3">
                  We use Google Analytics to understand how visitors interact with the
                  platform. This helps us improve the experience. No personal identifiers
                  are shared.
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Cookie</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Purpose</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono">_ga</td>
                      <td className="py-2 pr-4">Google Analytics — user distinction</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono">_ga_*</td>
                      <td className="py-2 pr-4">Google Analytics — session state</td>
                      <td className="py-2">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              How to manage cookies
            </h2>
            <p className="leading-[1.7] text-sm mb-4">
              You can control non-essential cookies at any time using our cookie preference
              banner. You can also manage cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong className="text-foreground">Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong className="text-foreground">Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data</li>
              <li><strong className="text-foreground">Safari:</strong> Settings → Privacy → Manage Website Data</li>
              <li><strong className="text-foreground">Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Update your preferences
            </h2>
            <p className="leading-[1.7] text-sm">
              You can update your cookie preferences at any time, or{" "}
              <button
                onClick={() => {
                  localStorage.removeItem("cookie_consent");
                  window.location.reload();
                }}
                className="text-primary underline hover:no-underline cursor-pointer"
              >
                click here to reset your preferences
              </button>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">Contact</h2>
            <p className="leading-[1.7] text-sm">
              Questions about our use of cookies? Contact us at{" "}
              <a href="mailto:privacy@paintbookco.co.uk" className="text-primary hover:underline">
                privacy@paintbookco.co.uk
              </a>{" "}
              or visit our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(CookiePolicyPage, {
      name: "CookiePolicyPage",
      inputs: [],
    });
  })
  .catch(() => {});
