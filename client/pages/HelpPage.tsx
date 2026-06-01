import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

interface FAQItem { q: string; a: string; }
interface FAQSection { category: string; items: FAQItem[]; }

const FAQ_SECTIONS: FAQSection[] = [
  {
    category: "Payments",
    items: [
      { q: "How does payment work?", a: "You pay the full job value into Transpact escrow when confirming a booking. Funds are only released to the painter when you confirm the job is complete. You stay in full control throughout." },
      { q: "Is my payment secure?", a: "Yes. All payments are held by Transpact, an FCA-authorised escrow provider (FCA Ref: 546279). PaintBookCo never holds your funds directly. Your money is protected until you are satisfied." },
      { q: "What if I am not happy with the work?", a: "Do not confirm completion. Raise a dispute through your dashboard. Funds remain frozen in escrow until the dispute is resolved. PaintBookCo will review evidence and issue a decision within 10 working days." },
    ],
  },
  {
    category: "Matching",
    items: [
      { q: "How are painters matched to my job?", a: "Our system automatically matches painters based on location, specialisms, availability, and ratings. Only KYC-verified, insured painters appear in matches." },
      { q: "How long does matching take?", a: "Most jobs are matched within minutes. If no match is found within 24 hours, we widen the search and notify you. You will never be left waiting without communication." },
    ],
  },
  {
    category: "KYC Verification",
    items: [
      { q: "Why do painters need to be verified?", a: "Every painter must pass identity verification, address verification, and insurance checks before receiving any jobs. This protects you and ensures you only work with genuine professionals." },
      { q: "How long does KYC take?", a: "Usually 1–3 working days. You will receive an email confirmation when your application is approved or if further information is needed." },
    ],
  },
  {
    category: "Disputes",
    items: [
      { q: "What happens if there is a dispute?", a: "Raise a dispute through your dashboard. Funds are frozen immediately and will not be released to either party until the dispute is resolved. PaintBookCo reviews evidence from both parties and issues a binding decision within 10 working days." },
    ],
  },
  {
    category: "Chat",
    items: [
      { q: "Why can I not share my phone number in chat?", a: "Contact details are shared automatically via email when your booking is confirmed and payment is in escrow. This protects both parties and ensures all communications are recorded through the platform for dispute resolution purposes." },
    ],
  },
];

function AccordionItem({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-6 group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">{q}</span>
        <ChevronDown
          className={[
            "h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300",
            open ? "rotate-180 text-primary" : "",
          ].join(" ")}
        />
      </button>
      <div
        className={[
          "overflow-hidden transition-all duration-300",
          open ? "max-h-96 pb-5" : "max-h-0",
        ].join(" ")}
      >
        <p className="text-sm text-muted-foreground leading-[1.8]">{a}</p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  useEffect(() => { document.title = "Help & FAQ | PaintBookCo"; }, []);

  const faqRef = useScrollAnimationList();
  const ctaRef = useScrollAnimation();

  return (
    <div style={{ background: '#FBF7F0', minHeight: '100vh' }}>
      <div className="h-16" />

      {/* Hero */}
      <section className="py-28 px-6 text-center" style={{ background: '#F5F0E8' }}>
        <div className="mx-auto max-w-2xl">
          <p className="editorial-label text-primary mb-6 animate-editorial-up flex items-center justify-center gap-3" style={{ animationFillMode: "both" }}>
            <span className="inline-block h-px w-8 bg-current" />
            Help centre
          </p>
          <h1 className="font-display text-foreground mb-4 animate-editorial-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            Frequently asked questions
          </h1>
          <p className="text-lg text-muted-foreground leading-[1.8] animate-editorial-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Answers to the most common questions about PaintBookCo.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="section-warm py-16 px-6">
        <div ref={faqRef} className="mx-auto max-w-3xl space-y-4 scroll-stagger">
          {FAQ_SECTIONS.map(({ category, items }) => (
            <div key={category} className="scroll-animate bg-background border border-border/50 p-8">
              <h2 className="font-semibold text-foreground text-sm mb-2 pb-4 border-b border-border/50">
                {category}
              </h2>
              {items.map((item) => <AccordionItem key={item.q} {...item} />)}
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="section-light py-20 px-6 text-center">
        <div ref={ctaRef} className="mx-auto max-w-md scroll-animate">
          <h2 className="font-display text-foreground mb-3">Still need help?</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-[1.7]">
            Our team is available to help with any question not covered here.
          </p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 bg-foreground text-background font-medium px-8 py-4 transition-all duration-200 hover:bg-foreground/85 hover:scale-[1.02]"
          >
            Contact Us
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

