import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CookieConsentData {
  /** Essential cookies are always required — this field is always `true`. */
  essential: true;
  /** Analytics cookies (e.g. page-view tracking). Opt-in only. */
  analytics: boolean;
  /** Marketing/advertising cookies. Opt-in only. */
  marketing: boolean;
  /** ISO-8601 timestamp when consent was last recorded. */
  timestamp: string;
  /** Consent schema version. Bump when categories change to re-ask. */
  version: string;
}

export type ConsentUpdates = Pick<CookieConsentData, "analytics" | "marketing">;

// ─── Constants ────────────────────────────────────────────────────────────────

export const COOKIE_CONSENT_KEY = "paintbook:cookie-consent";
export const CONSENT_VERSION = "1.0";

/**
 * Custom event dispatched whenever consent is written (accept, reject, save).
 * Analytics/tag-manager scripts should listen to this event before loading.
 *
 * @example
 * window.addEventListener("paintbook:consent-updated", (e) => {
 *   const { analytics, marketing } = (e as CustomEvent<CookieConsentData>).detail;
 *   if (analytics) initGA();
 * });
 */
export const CONSENT_EVENT = "paintbook:consent-updated";

/** Dispatched by CookieSettingsButton to open the preferences dialog. */
export const OPEN_PREFS_EVENT = "paintbook:open-cookie-preferences";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readStorage(): CookieConsentData | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentData;
    // If the consent version has changed, treat as un-consented so the banner
    // re-appears and the user is asked again.
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(data: CookieConsentData): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
  } catch {
    /* localStorage unavailable (e.g. private-browsing restrictions) */
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * `useCookieConsent` — single source of truth for cookie consent state.
 *
 * Initialises from localStorage on mount. Writing calls both localStorage and
 * dispatches `paintbook:consent-updated` so third-party scripts can react.
 *
 * @example
 * const { consent, hasConsented, acceptAll, rejectAll } = useCookieConsent();
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentData | null>(() => readStorage());

  const save = useCallback((data: CookieConsentData) => {
    writeStorage(data);
    setConsent(data);
    window.dispatchEvent(
      new CustomEvent<CookieConsentData>(CONSENT_EVENT, { detail: data }),
    );
  }, []);

  /** Accept all cookie categories. */
  const acceptAll = useCallback(() => {
    save({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    });
  }, [save]);

  /**
   * Reject all non-essential cookies.
   * Essential cookies remain active as they are strictly necessary.
   */
  const rejectAll = useCallback(() => {
    save({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    });
  }, [save]);

  /**
   * Save a partial update (e.g. from the Manage Preferences dialog).
   * Merges with current consent, falls back to `false` for any unset category.
   */
  const updateConsent = useCallback(
    (updates: Partial<ConsentUpdates>) => {
      save({
        essential: true,
        analytics: updates.analytics ?? consent?.analytics ?? false,
        marketing: updates.marketing ?? consent?.marketing ?? false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      });
    },
    [save, consent],
  );

  return {
    /** Current stored consent, or `null` if the user has not yet responded. */
    consent,
    /** `true` once the user has made any choice (accept, reject, or save). */
    hasConsented: consent !== null,
    acceptAll,
    rejectAll,
    updateConsent,
  };
}
