/**
 * LegalPages — Builder.io page registration for /privacy and /terms
 *
 * SETUP REQUIRED:
 * Install the Builder.io React SDK before calling these functions:
 *   pnpm add @builder.io/react
 *
 * Usage in your app entry point (after builder.init()):
 *
 *   import { builder } from "@builder.io/react";
 *   import { registerLegalPagesWithBuilder } from "@/components/site/LegalPages.builder";
 *
 *   builder.init("YOUR_PUBLIC_API_KEY");
 *   registerLegalPagesWithBuilder();
 *
 * These register the Privacy and Terms components in the "Legal" category
 * of the Builder.io visual editor. The pages render standalone with their
 * own LegalPageLayout (breadcrumb header + branded content + legal footer).
 *
 * NOTE: Because these are full-page React components already routed via
 * React Router (App.tsx), Builder.io integration here is for visual preview
 * and content overrides only. The canonical routes remain /privacy and /terms.
 */

export async function registerLegalPagesWithBuilder(): Promise<void> {
  let Builder: typeof import("@builder.io/react")["Builder"];

  try {
    const mod = await import("@builder.io/react");
    Builder = mod.Builder;
  } catch {
    console.warn(
      "[PaintBookco] @builder.io/react is not installed. " +
        "Run `pnpm add @builder.io/react` to enable Builder.io page registration.",
    );
    return;
  }

  const [{ default: Privacy }, { default: Terms }] = await Promise.all([
    import("@/pages/Privacy"),
    import("@/pages/Terms"),
  ]);

  Builder.registerComponent(Privacy, {
    name: "Privacy Policy Page",
    description:
      "Full UK GDPR-compliant Privacy Policy page for PaintBookco. Renders at /privacy with branded LegalPageLayout.",
    inputs: [],
    noWrap: true,
    // @ts-expect-error — category is valid but not in Builder's public types
    category: "Legal",
  });

  Builder.registerComponent(Terms, {
    name: "Terms of Service Page",
    description:
      "Full Terms of Service page for PaintBookco. Renders at /terms with branded LegalPageLayout. Includes link to Privacy Policy.",
    inputs: [],
    noWrap: true,
    // @ts-expect-error — category is valid but not in Builder's public types
    category: "Legal",
  });

  console.log("[PaintBookco] Privacy Policy and Terms of Service registered with Builder.io.");
}

/**
 * Synchronous config objects for Builder's registerComponents array pattern.
 */
export const PRIVACY_BUILDER_CONFIG = {
  name: "Privacy Policy Page",
  description: "UK GDPR-compliant Privacy Policy. Route: /privacy",
  inputs: [] as const,
  noWrap: true,
} as const;

export const TERMS_BUILDER_CONFIG = {
  name: "Terms of Service Page",
  description: "Terms of Service with Privacy Policy link. Route: /terms",
  inputs: [] as const,
  noWrap: true,
} as const;
