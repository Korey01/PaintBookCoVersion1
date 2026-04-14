/**
 * TermsPage — renders the full Terms of Service.
 * Content is maintained in Terms.tsx.
 */
import Terms from "./Terms";

export default function TermsPage() {
  return <Terms />;
}

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => {
    Builder.registerComponent(TermsPage, {
      name: "TermsPage",
      inputs: [],
    });
  })
  .catch(() => {});
