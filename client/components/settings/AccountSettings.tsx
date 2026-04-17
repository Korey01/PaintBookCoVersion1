/**
 * AccountSettings — GDPR data export and account deletion
 *
 * Download My Data: calls download-my-data Edge Function and
 * triggers a JSON file download in the browser.
 *
 * Delete My Account: two-step confirmation (type DELETE) before
 * calling delete-my-account Edge Function. Blocks if active jobs
 * or open disputes exist and shows the server error message.
 */

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

// ── Component ─────────────────────────────────────────────────────────────────

export function AccountSettings() {
  // ── Download state ───────────────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // ── Delete state ─────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // ── Download My Data ─────────────────────────────────────────
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setDownloadError("You must be logged in to export your data.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-my-data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setDownloadError(
          (errData as { error?: string }).error ??
            "Failed to prepare data export. Please try again.",
        );
        return;
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "paintbookco-data-export.json";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Failed to prepare data export. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Delete My Account ────────────────────────────────────────
  const openDeleteModal = () => {
    setConfirmText("");
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setConfirmText("");
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (confirmText !== "DELETE" || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");

    const { data, error: fnError } = await supabase.functions.invoke(
      "delete-my-account",
      { body: {} },
    );

    if (fnError || !(data as { success?: boolean })?.success) {
      setDeleteError(
        (data as { error?: string })?.error ??
          "Failed to delete account. Please try again.",
      );
      setIsDeleting(false);
      return;
    }

    // Sign out and show success state
    await supabase.auth.signOut().catch(console.error);
    setShowDeleteModal(false);
    setDeleteSuccess(true);

    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  // ── Success redirect screen ──────────────────────────────────
  if (deleteSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Account deleted</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Your personal data has been removed. You will be redirected to the
          homepage shortly.
        </p>
      </div>
    );
  }

  // ── Main settings view ───────────────────────────────────────
  return (
    <div className="space-y-8 max-w-xl">

      {/* ── Download My Data ─────────────────────────────────── */}
      <section className="border border-gray-100 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Download Your Data
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Export a copy of all your personal data stored on PaintBookCo.
            This includes your profile, jobs, reviews and activity.
          </p>
        </div>

        {downloadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {downloadError}
          </p>
        )}

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#1B3A5C] text-white disabled:opacity-50 hover:bg-[#2E75B6] transition-colors"
        >
          {isDownloading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Preparing your data…
            </>
          ) : (
            <>
              <DownloadIcon />
              Download My Data
            </>
          )}
        </button>
      </section>

      {/* ── Delete My Account ────────────────────────────────── */}
      <section className="border border-gray-100 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Delete Your Account
          </h2>
        </div>

        {/* Red warning box */}
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700 leading-relaxed">
            <strong>This action is permanent.</strong> Your personal data will
            be removed from PaintBookCo. Financial records are retained for 7
            years as required by UK law.
          </p>
        </div>

        <button
          onClick={openDeleteModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Delete My Account
        </button>
      </section>

      {/* ── Confirmation modal ───────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="space-y-1">
              <h3
                id="delete-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                Are you sure?
              </h3>
              <p className="text-sm text-gray-500">
                This cannot be undone. Type{" "}
                <strong className="text-gray-800 font-mono">DELETE</strong> to
                confirm.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setDeleteError("");
                }}
                placeholder="Type DELETE here"
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              {deleteError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white disabled:opacity-40 hover:bg-red-700 transition-colors"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </span>
                ) : (
                  "Confirm deletion"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  const { Builder } = await import("@builder.io/react");
  Builder.registerComponent(AccountSettings, {
    name: "AccountSettings",
    inputs: [],
  });
})();
