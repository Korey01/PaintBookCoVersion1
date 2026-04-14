/**
 * NotificationPreferences — Email notification opt-in/out toggles
 *
 * Loads the user's preferences from the notification_preferences table
 * on mount (inserting defaults if none exist), and saves on each change.
 * Shows a confirmation toast after saving.
 */

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Prefs {
  email_jobs: boolean;
  email_milestones: boolean;
  email_reviews: boolean;
  email_disputes: boolean;
  email_marketing: boolean;
}

const DEFAULTS: Prefs = {
  email_jobs: true,
  email_milestones: true,
  email_reviews: true,
  email_disputes: true,
  email_marketing: false,
};

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A5C] ${
        checked ? "bg-[#1B3A5C]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Preference rows ───────────────────────────────────────────────────────────

const PREFERENCE_ROWS: {
  key: keyof Prefs;
  label: string;
  description: string;
}[] = [
  {
    key: "email_jobs",
    label: "Job notifications",
    description: "New job matches, painter acceptances and status updates",
  },
  {
    key: "email_milestones",
    label: "Milestone updates",
    description: "Milestone submissions, approvals and payment confirmations",
  },
  {
    key: "email_reviews",
    label: "Review requests",
    description: "Reminders to leave a review after a job is completed",
  },
  {
    key: "email_disputes",
    label: "Dispute alerts",
    description: "Notifications about disputed jobs and resolution updates",
  },
  {
    key: "email_marketing",
    label: "Marketing emails",
    description: "Tips, promotions and PaintBookCo news",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  // ── Load preferences on mount ────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data } = await supabase
        .from("notification_preferences")
        .select("email_jobs, email_milestones, email_reviews, email_disputes, email_marketing")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPrefs({
          email_jobs: data.email_jobs ?? DEFAULTS.email_jobs,
          email_milestones: data.email_milestones ?? DEFAULTS.email_milestones,
          email_reviews: data.email_reviews ?? DEFAULTS.email_reviews,
          email_disputes: data.email_disputes ?? DEFAULTS.email_disputes,
          email_marketing: data.email_marketing ?? DEFAULTS.email_marketing,
        });
      }

      setIsLoading(false);
    }

    load();
  }, []);

  // ── Save preferences ─────────────────────────────────────────
  const save = useCallback(async (updated: Prefs) => {
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSaving(false); return; }

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        { user_id: user.id, ...updated },
        { onConflict: "user_id" },
      );

    setIsSaving(false);

    if (error) {
      setToast("Failed to save preferences. Please try again.");
    } else {
      setToast("Preferences saved");
    }

    setTimeout(() => setToast(""), 3000);
  }, []);

  const handleToggle = (key: keyof Prefs) => (value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    save(updated);
  };

  // ── Loading skeleton ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
            <div className="h-6 w-11 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // ── Preferences form ─────────────────────────────────────────
  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.startsWith("Failed") ? "bg-red-600" : "bg-[#1B3A5C]"
          }`}
        >
          {toast.startsWith("Failed") ? "⚠️ " : "✓ "}
          {toast}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {PREFERENCE_ROWS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between py-4 gap-4"
          >
            <div className="flex-1 min-w-0">
              <label
                htmlFor={`pref-${key}`}
                className="block text-sm font-medium text-gray-800 cursor-pointer"
              >
                {label}
              </label>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <Toggle
              id={`pref-${key}`}
              checked={prefs[key]}
              onChange={handleToggle(key)}
            />
          </div>
        ))}
      </div>

      {isSaving && (
        <p className="text-xs text-gray-400 text-right mt-2">Saving…</p>
      )}
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  const { Builder } = await import("@builder.io/react");
  Builder.registerComponent(NotificationPreferences, {
    name: "NotificationPreferences",
    inputs: [],
  });
})();
