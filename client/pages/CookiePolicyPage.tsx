import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { PRIVACY_EMAIL } from "@/lib/config";

export default function CookiePolicyPage() {
  useEffect(() => { document.title = "Cookie Policy | PaintBookCo"; }, []);

  const bodyRef = useScrollAnimation();

  return (
    <div className="bg-background">
      <div className="h-16" />

      {/* Hero */}
      <section className="section-light pt-20 pb-12 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="editorial-label text-primary mb-4 animate-editorial-up" style={{ animationFillMode: "both" }}>Legal</p>
          <h1 className="font-display text-foreground mb-3 animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>Cookie Policy</h1>
          <p className="text-sm text-muted-foreground animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>Last updated: April 2026</p>
        </div>
      </section>

      <section className="section-light pb-28 px-6">
        <div ref={bodyRef} className="mx-auto max-w-3xl space-y-12 scroll-animate text-sm text-muted-foreground">
          <section>
            <h2 className="font-display text-xl text-foreground mb-4">What are cookies?</h2>
            <p className="leading-[1.8]">
              Cookies are small text files stored on your device when you visit a website.
              They allow the website to remember your preferences, keep you logged in, and
              understand how you use the site.
            </p>
          </section>

          <div className="h-px bg-border/50" />

          <section>
            <h2 className="font-display text-xl text-foreground mb-6">Cookies we use</h2>
            <div className="space-y-6">
              {/* Essential */}
              <div className="border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Essential cookies</h3>
                  <span className="editorial-label bg-foreground text-background px-2 py-0.5">Always on</span>
                </div>
                <p className="text-sm leading-[1.8] mb-4">Required for the platform to function. Cannot be disabled.</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-muted-foreground font-medium">Cookie</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Purpose</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-2 pr-4 font-mono">paintbook:user</td><td className="py-2 pr-4">Authentication session</td><td className="py-2">Session</td></tr>
                    <tr className="border-b border-border/30"><td className="py-2 pr-4 font-mono">sb-*</td><td className="py-2 pr-4">Supabase authentication tokens</td><td className="py-2">Up to 1 week</td></tr>
                    <tr><td className="py-2 pr-4 font-mono">cookie_consent</td><td className="py-2 pr-4">Records your cookie preferences</td><td className="py-2">1 year</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Analytics */}
              <div className="border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Analytics cookies</h3>
                  <span className="editorial-label border border-border text-muted-foreground px-2 py-0.5">Optional</span>
                </div>
                <p className="text-sm leading-[1.8] mb-4">Used to understand how visitors interact with the platform. No personal identifiers are shared.</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-muted-foreground font-medium">Cookie</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Purpose</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-2 pr-4 font-mono">_ga</td><td className="py-2 pr-4">Google Analytics — user distinction</td><td className="py-2">2 years</td></tr>
                    <tr><td className="py-2 pr-4 font-mono">_ga_*</td><td className="py-2 pr-4">Google Analytics — session state</td><td className="py-2">2 years</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section>
            <h2 className="font-display text-xl text-foreground mb-4">How to manage cookies</h2>
            <p className="leading-[1.8] mb-4">You can control non-essential cookies at any time using our cookie preference banner, or through your browser settings:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-foreground">Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong className="text-foreground">Firefox:</strong> Settings → Privacy &amp; Security → Cookies</li>
              <li><strong className="text-foreground">Safari:</strong> Settings → Privacy → Manage Website Data</li>
              <li><strong className="text-foreground">Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
          </section>

          <div className="h-px bg-border/50" />

          <section>
            <h2 className="font-display text-xl text-foreground mb-4">Update your preferences</h2>
            <p className="leading-[1.8]">
              You can{" "}
              <button onClick={() => { localStorage.removeItem("cookie_consent"); window.location.reload(); }} className="text-primary underline hover:no-underline">
                reset your cookie preferences here
              </button>
              .
            </p>
          </section>

          <div className="h-px bg-border/50" />

          <section>
            <h2 className="font-display text-xl text-foreground mb-4">Contact</h2>
            <p className="leading-[1.8]">
              Questions about our use of cookies? Email{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">{PRIVACY_EMAIL}</a>{" "}
              or see our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

