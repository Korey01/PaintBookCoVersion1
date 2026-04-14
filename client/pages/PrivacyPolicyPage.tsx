/**
 * PrivacyPolicyPage — renders the full Privacy Policy.
 * Content is maintained in Privacy.tsx.
 */
import Privacy from "./Privacy";
export default function PrivacyPolicyPage() { return <Privacy />; }

// ── Builder.io registration ───────────────────────────────────────────────────
import("@builder.io/react")
  .then(({ Builder }) => { Builder.registerComponent(PrivacyPolicyPage, { name: "PrivacyPolicyPage", inputs: [] }); })
  .catch(() => {});
