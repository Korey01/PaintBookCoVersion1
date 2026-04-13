import { useEffect, useState } from "react";
import { Mail, Phone, Building2 } from "lucide-react";

type Subject =
  | ""
  | "General Enquiry"
  | "Technical Support"
  | "Billing"
  | "Partnership"
  | "Press";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact | PaintBookCo";
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<Subject>("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    setSubmitting(true);

    try {
      // Attempt to send via Supabase Edge Function (contact-form)
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message }),
        },
      );
      if (res.ok) {
        setSubmitted(true);
        return;
      }
    } catch {
      // Fall through to mailto fallback
    }

    // Mailto fallback
    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    window.location.href = `mailto:o.a.alashe@paintbookco.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitting(false);
  }

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-4">
            Get in touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1B3A5C] mb-4">
            Contact us
          </h1>
          <p className="text-lg text-gray-600">
            Questions, partnership enquiries, or technical support — we are here
            to help.
          </p>
        </div>
      </section>

      <section className="py-12 px-6 pb-24" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-10">
          {/* Contact details */}
          <div className="md:col-span-2 space-y-6">
            <div
              className="bg-white p-6 border border-gray-100"
              style={{ borderRadius: "8px" }}
            >
              <div className="space-y-5">
                <div className="flex gap-3 items-start">
                  <div
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#EBF3FC", borderRadius: "8px" }}
                  >
                    <Mail className="h-4 w-4 text-[#2E75B6]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <a
                      href="mailto:o.a.alashe@paintbookco.co.uk"
                      className="text-sm font-medium text-[#1B3A5C] hover:text-[#2E75B6] transition-colors break-all"
                    >
                      o.a.alashe@paintbookco.co.uk
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#EBF3FC", borderRadius: "8px" }}
                  >
                    <Phone className="h-4 w-4 text-[#2E75B6]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                    <p className="text-sm text-gray-600">Available on request</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#EBF3FC", borderRadius: "8px" }}
                  >
                    <Building2 className="h-4 w-4 text-[#2E75B6]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Company</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      The PaintBook Company Ltd
                      <br />
                      Company Number: 16690724
                      <br />
                      Registered in England and Wales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div
                className="bg-white border border-gray-100 p-10 text-center"
                style={{ borderRadius: "8px" }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#EBF3FC", borderRadius: "50%" }}
                >
                  <Mail className="h-6 w-6 text-[#2E75B6]" />
                </div>
                <h2 className="text-xl font-bold text-[#1B3A5C] mb-2">
                  Message sent
                </h2>
                <p className="text-gray-600 text-sm">
                  Thank you for reaching out. We will get back to you as soon as
                  possible.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-100 p-8 space-y-5"
                style={{ borderRadius: "8px" }}
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border border-gray-200 text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:border-[#2E75B6] transition-colors"
                      style={{ borderRadius: "8px" }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-gray-200 text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:border-[#2E75B6] transition-colors"
                      style={{ borderRadius: "8px" }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    required
                    className="w-full border border-gray-200 text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:border-[#2E75B6] transition-colors bg-white"
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    <option>General Enquiry</option>
                    <option>Technical Support</option>
                    <option>Billing</option>
                    <option>Partnership</option>
                    <option>Press</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full border border-gray-200 text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:border-[#2E75B6] transition-colors resize-none"
                    style={{ borderRadius: "8px" }}
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white font-semibold py-3 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(ContactPage, {
      name: "ContactPage",
      inputs: [],
    });
  })
  .catch(() => {});
