import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  category: string;
  items: FAQItem[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    category: "Payments",
    items: [
      {
        q: "How does payment work?",
        a: "You pay the full job value into Transpact escrow when confirming a booking. Funds are only released to the painter when you confirm the job is complete. You stay in full control throughout.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes. All payments are held by Transpact, an FCA-authorised escrow provider (FCA Ref: 546279). PaintBookCo never holds your funds directly. Your money is protected until you are satisfied.",
      },
      {
        q: "What if I am not happy with the work?",
        a: "Do not confirm completion. Raise a dispute through your dashboard. Funds remain frozen in escrow until the dispute is resolved. PaintBookCo will review evidence and issue a decision within 10 working days.",
      },
    ],
  },
  {
    category: "Matching",
    items: [
      {
        q: "How are painters matched to my job?",
        a: "Our system automatically matches painters based on location, specialisms, availability, and ratings. Only KYC-verified, insured painters appear in matches.",
      },
      {
        q: "How long does matching take?",
        a: "Most jobs are matched within minutes. If no match is found within 24 hours, we widen the search and notify you. You will never be left waiting without communication.",
      },
    ],
  },
  {
    category: "KYC Verification",
    items: [
      {
        q: "Why do painters need to be verified?",
        a: "Every painter must pass identity verification, address verification, and insurance checks before receiving any jobs. This protects you and ensures you only work with genuine professionals.",
      },
      {
        q: "How long does KYC take?",
        a: "Usually 1–3 working days. You will receive an email confirmation when your application is approved or if further information is needed.",
      },
    ],
  },
  {
    category: "Disputes",
    items: [
      {
        q: "What happens if there is a dispute?",
        a: "Raise a dispute through your dashboard. Funds are frozen immediately and will not be released to either party until the dispute is resolved. PaintBookCo reviews evidence from both parties and issues a binding decision within 10 working days.",
      },
    ],
  },
  {
    category: "Chat",
    items: [
      {
        q: "Why can I not share my phone number in chat?",
        a: "Contact details are shared automatically via email when your booking is confirmed and payment is in escrow. This protects both parties and ensures all communications are recorded through the platform for dispute resolution purposes.",
      },
    ],
  },
];

function AccordionItem({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#1B3A5C]">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#2E75B6] flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  useEffect(() => {
    document.title = "Help & FAQ | PaintBookCo";
  }, []);

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      {/* Header spacer */}
      <div className="h-16" />

      {/* Hero */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2E75B6] mb-4">
            Help centre
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1B3A5C] mb-4">
            Frequently asked questions
          </h1>
          <p className="text-lg text-gray-600">
            Answers to the most common questions about PaintBookCo.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="py-12 px-6" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-3xl mx-auto space-y-8">
          {FAQ_SECTIONS.map(({ category, items }) => (
            <div
              key={category}
              className="bg-white p-8 border border-gray-100"
              style={{ borderRadius: "8px" }}
            >
              <h2 className="text-base font-bold text-[#1B3A5C] mb-2 pb-4 border-b border-gray-100">
                {category}
              </h2>
              <div>
                {items.map((item) => (
                  <AccordionItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-[#1B3A5C] mb-3">
            Still need help?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Our team is available to help with any question not covered here.
          </p>
          <Link
            to="/contact"
            className="inline-block text-base font-semibold text-white px-8 py-3 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2E75B6", borderRadius: "8px" }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(HelpPage, {
      name: "HelpPage",
      inputs: [],
    });
  })
  .catch(() => {});
