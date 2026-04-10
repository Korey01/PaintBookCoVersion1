/**
 * CookieSettingsButton — floating pill that lets users revisit their cookie
 * preferences at any time. Only visible after the user has already consented
 * (accepted, rejected, or saved preferences) so it doesn't compete with the
 * banner.
 *
 * Clicking it dispatches `paintbook:open-cookie-preferences`, which
 * CookieConsent listens for and responds to by opening the Preferences dialog.
 *
 * Position: bottom-left, above the page footer z-index.
 */
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useCookieConsent, OPEN_PREFS_EVENT } from "@/hooks/useCookieConsent";

export default function CookieSettingsButton() {
  const { hasConsented } = useCookieConsent();

  function openPreferences() {
    window.dispatchEvent(new CustomEvent(OPEN_PREFS_EVENT));
  }

  return (
    <AnimatePresence>
      {hasConsented && (
        <motion.div
          key="cookie-settings-btn"
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <button
            type="button"
            onClick={openPreferences}
            aria-label="Cookie settings"
            title="Cookie settings"
            className="
              group flex items-center gap-2
              bg-background border border-border/70
              shadow-editorial
              px-3 py-2 text-xs font-medium text-muted-foreground
              hover:text-foreground hover:border-foreground/40
              hover:shadow-editorial-lg
              transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            "
          >
            <Cookie className="h-3.5 w-3.5 text-primary group-hover:text-primary transition-colors" aria-hidden />
            <span>Cookie settings</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
