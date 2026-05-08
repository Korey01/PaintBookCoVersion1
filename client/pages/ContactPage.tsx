import { useEffect, useState } from "react";
import { Mail, Phone, Building2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ADMIN_EMAIL } from "@/lib/config";

type Subject = "" | "General Enquiry" | "Technical Support" | "Billing" | "Partnership" | "Press";

const inputClass = "w-full border-b border-border bg-transparent text-sm text-foreground py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-200";

export default function ContactPage() {
  useEffect(() => { document.title = "Contact | PaintBookCo"; }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<Subject>("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useScrollAnimation();
  const detailsRef = useScrollAnimation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) { setSubmitted(true); return; }
    } catch { /* fall through */ }
    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitting(false);
  }

  return (
    <div>
      <div className="h-16" />

      {/* Hero */}
      <section className="section-dark py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="editorial-label text-white/35 mb-6 animate-editorial-up" style={{ animationFillMode: "both" }}>Get in touch</p>
          <h1 className="font-display text-white mb-6 animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>Contact us</h1>
          <p className="text-lg text-white/50 leading-[1.8] max-w-xl animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Questions, partnership enquiries, or technical support — we are here to help.
          </p>
        </div>
      </section>

      <section className="section-light py-20 px-6 pb-28">
        <div className="mx-auto max-w-5xl grid md:grid-cols-[1fr_2fr] gap-16">
          {/* Details */}
          <div ref={detailsRef} className="scroll-animate space-y-8">
            <div>
              <p className="editorial-label text-muted-foreground mb-4">Email</p>
              <a href={`mailto:${ADMIN_EMAIL}`} className="text-sm text-foreground hover:text-primary transition-colors duration-200 break-all">
                {ADMIN_EMAIL}
              </a>
            </div>
            <div className="h-px bg-border/50" />
            <div>
              <p className="editorial-label text-muted-foreground mb-4">Phone</p>
              <p className="text-sm text-muted-foreground">Available on request</p>
            </div>
            <div className="h-px bg-border/50" />
            <div>
              <p className="editorial-label text-muted-foreground mb-4">Company</p>
              <p className="text-sm text-muted-foreground leading-[1.8]">
                The PaintBook Company Ltd<br />
                Company Number: 16690724<br />
                Registered in England and Wales
              </p>
            </div>
          </div>

          {/* Form */}
          <div ref={formRef} className="scroll-animate">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 bg-muted rounded-full">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-xl text-foreground mb-2">Message sent</h2>
                <p className="text-muted-foreground text-sm leading-[1.8]">
                  Thank you for reaching out. We will get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <label className="editorial-label text-muted-foreground mb-2 block">Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="editorial-label text-muted-foreground mb-2 block">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="editorial-label text-muted-foreground mb-2 block">Subject *</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} required className={`${inputClass} cursor-pointer`}>
                    <option value="" disabled>Select a subject</option>
                    <option>General Enquiry</option>
                    <option>Technical Support</option>
                    <option>Billing</option>
                    <option>Partnership</option>
                    <option>Press</option>
                  </select>
                </div>
                <div>
                  <label className="editorial-label text-muted-foreground mb-2 block">Message *</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className={`${inputClass} resize-none`} placeholder="How can we help?" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-foreground text-background font-medium px-8 py-4 w-full transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.01] disabled:opacity-50"
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

