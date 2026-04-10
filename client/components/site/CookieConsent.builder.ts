/**
 * CookieConsent — Builder.io component registration
 *
 * SETUP REQUIRED:
 * Install the Builder.io React SDK before importing this file:
 *   pnpm add @builder.io/react
 *
 * Then call `registerCookieConsentWithBuilder()` once at app startup,
 * after Builder.init(), e.g. in your main entry point:
 *
 *   import { builder } from "@builder.io/react";
 *   import { registerCookieConsentWithBuilder } from "@/components/site/CookieConsent.builder";
 *
 *   builder.init("YOUR_PUBLIC_API_KEY");
 *   registerCookieConsentWithBuilder();
 *
 * Once registered, the "Cookie Consent Banner" component will appear
 * in the Builder.io visual editor under the Components panel and can
 * be dropped into any Builder page or section.
 *
 * NOTE: This file has NO side effects on import — registration only
 * happens when you explicitly call registerCookieConsentWithBuilder().
 */

// Dynamic import keeps @builder.io/react out of the critical bundle
// when Builder is not used, and avoids a hard build failure if the
// package has not been installed yet.
export async function registerCookieConsentWithBuilder(): Promise<void> {
  let Builder: typeof import("@builder.io/react")["Builder"];

  try {
    const mod = await import("@builder.io/react");
    Builder = mod.Builder;
  } catch {
    console.warn(
      "[PaintBookco] @builder.io/react is not installed. " +
        "Run `pnpm add @builder.io/react` to enable Builder.io component registration.",
    );
    return;
  }

  // Lazy-import the component so it's only bundled when needed
  const { default: CookieConsent } = await import(
    "@/components/site/CookieConsent"
  );

  Builder.registerComponent(CookieConsent, {
    name: "Cookie Consent Banner",
    description:
      "UK PECR / GDPR-compliant cookie consent banner. Renders a fixed bottom banner on first visit and a Manage Preferences dialog. Consent is stored in localStorage.",

    // No user-configurable inputs — the component manages its own state
    // and reads/writes to localStorage under `paintbook:cookie-consent`.
    inputs: [],

    // Prevent nesting inside other Builder components
    noWrap: true,

    // Metadata for the Builder.io component panel
    image:
      "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fcookie-icon.png",

    // Component defaults when inserted from the editor
    defaults: {
      bindings: {},
    },

    // Place in the "Trust & Legal" section of the component panel
    // (Builder uses the `category` field if provided)
    // @ts-expect-error — `category` is a valid but unofficial Builder field
    category: "Trust & Legal",
  });

  console.log(
    "[PaintBookco] Cookie Consent Banner registered with Builder.io.",
  );
}

/**
 * Synchronous variant for use with Builder's `registerComponents` array pattern.
 *
 * @example
 * import { BUILDER_COOKIE_CONSENT_REGISTRATION } from "@/components/site/CookieConsent.builder";
 * // Pass to Builder.registerComponent(...) manually after @builder.io/react is loaded.
 */
export function getCookieConsentBuilderConfig() {
  return {
    name: "Cookie Consent Banner",
    description:
      "UK PECR / GDPR-compliant cookie consent banner with Manage Preferences dialog.",
    inputs: [] as const,
    noWrap: true,
  } as const;
}
