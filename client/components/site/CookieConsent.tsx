/**
 * CookieConsent — UK PECR / GDPR compliant cookie consent banner.
 *
 * Renders:
 *  1. A fixed bottom banner (shown until the user makes a choice).
 *  2. A "Manage Preferences" dialog that can be opened from the banner
 *     or from CookieSettingsButton via the `paintbook:open-cookie-preferences` event.
 *
 * Consent is persisted in localStorage under `paintbook:cookie-consent`
 * and broadcast via the `paintbook:consent-updated` custom event so that
 * analytics/marketing scripts can self-initialise only after opt-in.
 *
 * PECR compliance notes:
 *  - Non-essential cookies are blocked until explicit consent is given.
 *  - Consent is opt-in by default (analytics & marketing default to false).
 *  - Essential cookies cannot be disabled — they are strictly necessary.
 *  - Consent is timestamped and versioned.
 *  - Users can withdraw or change consent at any time via CookieSettingsButton.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Lock, BarChart2, Megaphone, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCookieConsent, OPEN_PREFS_EVENT, type ConsentUpdates } from "@/hooks/useCookieConsent";

// ─── Category definitions ─────────────────────────────────────────────────────

interface CookieCategory {
  id: keyof ConsentUpdates | "essential";
  icon: React.ElementType;
  label: string;
  description: string;
  examples: string;
  required: boolean;
}

const CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    icon: Lock,
    label: "Essential Cookies",
    description:
      "Strictly necessary for the website to function. They enable core features such as secure login, session management, and user authentication. These cannot be disabled.",
    examples: "Session tokens, CSRF protection, login state.",
    required: true,
  },
  {
    id: "analytics",
    icon: BarChart2,
    label: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with PaintBookco — which pages are most visited, where users come from, and how to improve the experience. All data is aggregated and anonymous.",
    examples: "Page views, session duration, traffic source.",
    required: false,
  },
  {
    id: "marketing",
    icon: Megaphone,
    label: "Marketing Cookies",
    description:
      "Used to show you relevant advertisements and track the effectiveness of our campaigns. Data may be shared with trusted advertising partners in accordance with our Privacy Policy.",
    examples: "Ad targeting, retargeting pixels, conversion tracking.",
    required: false,
  },
];

// ─── Expandable category row ─────────────────────────────────────────────────

function CategoryRow({
  category,
  enabled,
  onToggle,
}: {
  category: CookieCategory;
  enabled: boolean;
  onToggle?: (val: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  return (
    <div className="border border-border/50 overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0 bg-primary/8 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{category.label}</span>
            {category.required && (
              <span className="text-[10px] font-medium uppercase tracking-widest text-primary bg-primary/8 px-2 py-0.5">
                Always on
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {category.required ? (
            <Switch checked={true} disabled aria-label="Essential cookies always enabled" />
          ) : (
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={`Toggle ${category.label}`}
            />
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border/50 bg-muted/30">
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                {category.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                <span className="font-medium text-muted-foreground">Examples:</span>{" "}
                {category.examples}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Preferences dialog ───────────────────────────────────────────────────────

function PreferencesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { consent, updateConsent } = useCookieConsent();

  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);

  // Sync local toggles if consent changes from outside (e.g. Accept All)
  useEffect(() => {
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
  }, [consent, open]);

  function handleSave() {
    updateConsent({ analytics, marketing });
    onOpenChange(false);
  }

  const toggleMap: Record<string, { value: boolean; onChange: (v: boolean) => void }> = {
    analytics: { value: analytics, onChange: setAnalytics },
    marketing: { value: marketing, onChange: setMarketing },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
            <DialogTitle className="font-display text-xl font-normal">
              Cookie Preferences
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            We use cookies to ensure the site works correctly, understand how it is used, and
            occasionally show you relevant content. You can manage your preferences below.
            Your choices are saved and can be updated at any time.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Categories */}
        <div className="px-6 py-5 space-y-3 max-h-[55vh] overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              enabled={cat.required ? true : toggleMap[cat.id]?.value ?? false}
              onToggle={cat.required ? undefined : toggleMap[cat.id]?.onChange}
            />
          ))}

          <p className="text-[11px] text-muted-foreground/70 leading-relaxed pt-1">
            Under the UK Privacy and Electronic Communications Regulations (PECR) and UK GDPR,
            we require your consent before placing non-essential cookies on your device.
            For more information, see our{" "}
            <a href="/cookies" className="underline hover:text-foreground transition-colors">
              Cookie Policy
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <Separator />

        {/* Footer actions */}
        <div className="px-6 py-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors text-left"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAnalytics(true);
                setMarketing(true);
              }}
            >
              Accept all
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              Save my choices
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main banner ──────────────────────────────────────────────────────────────

/**
 * Drop this into your Layout (or app root). It renders:
 * - A consent banner until the user makes a choice.
 * - The Manage Preferences dialog, openable from the banner or via
 *   the `paintbook:open-cookie-preferences` event (used by CookieSettingsButton).
 */
export default function CookieConsent() {
  const { hasConsented, acceptAll, rejectAll } = useCookieConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);

  // Listen for the floating CookieSettingsButton to request the dialog
  useEffect(() => {
    const handler = () => setPrefsOpen(true);
    window.addEventListener(OPEN_PREFS_EVENT, handler);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, handler);
  }, []);

  return (
    <>
      {/* ── Consent banner ── */}
      <AnimatePresence>
        {!hasConsented && (
          <motion.div
            key="cookie-banner"
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "110%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            {/* Gradient veil above the banner */}
            <div
              aria-hidden
              className="pointer-events-none h-12 bg-gradient-to-t from-black/20 to-transparent"
            />

            <div className="bg-foreground text-background">
              <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                  {/* Icon + copy */}
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Cookie
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-semibold leading-snug">
                        We use cookies
                      </p>
                      <p className="mt-1 text-xs text-background/65 leading-relaxed max-w-prose">
                        PaintBookco uses essential cookies to keep the site working, and
                        optional cookies for analytics and personalised content. Under UK PECR,
                        we need your consent before placing non-essential cookies. Choose your
                        preference below — you can change this at any time.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrefsOpen(true)}
                      className="text-xs text-background/60 underline underline-offset-4 hover:text-background transition-colors whitespace-nowrap"
                    >
                      Manage preferences
                    </button>
                    <Button
                      type="button"
                      variant="ghost-light"
                      size="sm"
                      onClick={rejectAll}
                      className="border border-white/20 text-xs"
                    >
                      Reject all
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={acceptAll}
                      className="bg-primary text-primary-foreground hover:bg-primary/85 text-xs"
                    >
                      Accept all
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preferences dialog (shared with CookieSettingsButton) ── */}
      <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} />
    </>
  );
}
