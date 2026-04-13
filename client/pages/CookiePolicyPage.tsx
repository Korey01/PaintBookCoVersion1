import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookiePolicyPage() {
  useEffect(() => {
    document.title = "Cookie Policy | PaintBookCo";
  }, []);

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }} className="bg-white">
      {/* Header spacer */}
      <div className="h-16" />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-4">
          Legal
        </p>
        <h1 className="text-4xl font-bold text-[#1B3A5C] mb-3">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-10">
          {/* What are cookies */}
          <section>
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">What are cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text files stored on your device when you visit a website.
              They allow the website to remember your preferences, keep you logged in, and
              understand how you use the site. They do not contain personal information on
              their own.
            </p>
          </section>

          {/* Cookies we use */}
          <section>
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-4">Cookies we use</h2>

            <div className="space-y-6">
              {/* Essential */}
              <div
                className="border border-gray-100 p-6"
                style={{ borderRadius: "8px" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#1B3A5C]">
                    Essential cookies
                  </h3>
                  <span
                    className="text-xs font-semibold text-white px-2 py-0.5"
                    style={{ backgroundColor: "#1B3A5C", borderRadius: "4px" }}
                  >
                    Always on
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3">
                  These cookies are required for the platform to function. They cannot be
                  disabled.
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-400 font-medium">Cookie</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Purpose</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-mono">paintbook:user</td>
                      <td className="py-2 pr-4">Authentication session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-gray-50">
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
              <div
                className="border border-gray-100 p-6"
                style={{ borderRadius: "8px" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#1B3A5C]">
                    Analytics cookies
                  </h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 border border-gray-200 text-gray-500"
                    style={{ borderRadius: "4px" }}
                  >
                    Optional
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3">
                  We use Google Analytics to understand how visitors interact with the
                  platform. This helps us improve the experience. No personal identifiers
                  are shared.
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-400 font-medium">Cookie</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Purpose</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-50">
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

          {/* How to manage */}
          <section>
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">
              How to manage cookies
            </h2>
            <p className="leading-relaxed mb-4">
              You can control non-essential cookies at any time using our cookie preference
              banner. You can also manage cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other
                site data
              </li>
              <li>
                <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site
                Data
              </li>
              <li>
                <strong>Safari:</strong> Settings → Privacy → Manage Website Data
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and site permissions
              </li>
            </ul>
            <p className="leading-relaxed mt-4 text-sm">
              Note: disabling essential cookies may prevent you from logging in or using
              core platform features.
            </p>
          </section>

          {/* Update preferences */}
          <section>
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">
              Update your preferences
            </h2>
            <p className="leading-relaxed text-sm">
              You can update your cookie preferences at any time by clicking the cookie
              settings button displayed at the bottom of every page, or by{" "}
              <button
                onClick={() => {
                  localStorage.removeItem("cookie_consent");
                  window.location.reload();
                }}
                className="text-[#2E75B6] underline hover:no-underline cursor-pointer"
              >
                clicking here to reset your preferences
              </button>
              .
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">Contact</h2>
            <p className="leading-relaxed text-sm">
              Questions about our use of cookies? Contact us at{" "}
              <a
                href="mailto:privacy@paintbookco.co.uk"
                className="text-[#2E75B6] hover:underline"
              >
                privacy@paintbookco.co.uk
              </a>{" "}
              or visit our{" "}
              <Link to="/privacy" className="text-[#2E75B6] hover:underline">
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
