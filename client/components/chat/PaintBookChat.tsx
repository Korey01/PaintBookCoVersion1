/**
 * PaintBookChat — Secure painter–customer job chat
 *
 * Two-layer PII filter:
 *   Layer 1 (client): regex blocks UK phone, email, postcodes,
 *                     URLs and social handles before sending
 *   Layer 2 (server): SightEngine AI moderation via filter-message
 *                     Edge Function
 *
 * Access is gated by generate-stream-token Edge Function:
 *   - Customer: must own the job AND escrow_funded = true
 *   - Painter:  must be KYC approved, assigned, AND escrow_funded = true
 *   - Admin:    read-only transcript view
 *
 * Required env vars (in .env):
 *   VITE_STREAM_API_KEY              — Stream Chat public API key
 *   VITE_MAKE_DISPUTE_RAISED_WEBHOOK — Make.com webhook for message reports
 */

import React, { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import type { Channel as StreamChannelType, MessageResponse } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import "@stream-io/stream-chat-css/dist/v2/css/index.css";
import { supabase } from "../../lib/supabase";

// ── Layer 1 PII regex patterns ────────────────────────────────────────────────

const PII_PATTERNS: RegExp[] = [
  /(\+44|0)7\d{3}[\s\-]?\d{3}[\s\-]?\d{3}/g,      // UK mobile
  /(\+44|0)(1|2|3)\d{8,9}/g,                         // UK landline
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, // Email
  /[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/gi,            // UK postcode
  /(https?:\/\/|www\.)/gi,                            // URLs
  /@[a-zA-Z0-9_]{3,}/g,                              // Social handles
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaintBookChatProps {
  jobId: string;
  userId: string;
  userRole: "painter" | "customer" | "admin";
}

interface TokenData {
  token: string;
  user_id: string;
  channel_id: string;
}

interface ReportState {
  messageId: string;
  reason: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaintBookChat({ jobId, userId, userRole }: PaintBookChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [streamChannel, setStreamChannel] = useState<StreamChannelType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  // Warning banners
  const [piiWarning, setPiiWarning] = useState("");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [reportConfirmation, setReportConfirmation] = useState("");

  // Report dialog
  const [reportState, setReportState] = useState<ReportState | null>(null);

  const channelRef = useRef<StreamChannelType | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  // ── Init: fetch token and connect ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout>;

    async function connect(isRefresh = false) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "generate-stream-token",
          { body: { job_id: jobId } },
        );

        if (!mounted) return;

        if (fnError || !data?.token) {
          const code: string = data?.code ?? "unknown";
          const msg: string = data?.error ?? "Chat is not available.";
          if (!isRefresh) setError({ message: msg, code });
          return;
        }

        const td = data as TokenData;
        const apiKey = (import.meta as Record<string, unknown> & { env: Record<string, string> }).env.VITE_STREAM_API_KEY ?? "";

        if (!isRefresh) {
          // First connection
          const client = StreamChat.getInstance(apiKey);
          clientRef.current = client;
          await client.connectUser({ id: td.user_id }, td.token);

          const channel = client.channel("messaging", td.channel_id, {
            name: `Job Chat`,
            created_by_id: td.user_id,
          });
          await channel.watch({ messages: { limit: 300 } });

          if (!mounted) return;

          channelRef.current = channel;
          setChatClient(client);
          setStreamChannel(channel);
        } else {
          // Token refresh — update token without disconnecting
          await clientRef.current?.updateToken(td.token);
        }

        // Schedule refresh 5 minutes before the 1-hour token expires
        refreshTimer = setTimeout(() => connect(true), 55 * 60 * 1000);
      } catch (err) {
        console.error("PaintBookChat init error:", err);
        if (!isRefresh && mounted) {
          setError({ message: "Failed to load chat. Please try again." });
        }
      } finally {
        if (!isRefresh && mounted) setIsLoading(false);
      }
    }

    connect();

    return () => {
      mounted = false;
      clearTimeout(refreshTimer);
      clientRef.current?.disconnectUser().catch(console.error);
    };
  }, [jobId]);

  // ── Message send handler with two-layer PII filter ────────────────────────
  const handleSubmit = async (message: { text?: string }) => {
    const content = (message.text ?? "").trim();
    if (!content) return;

    // Clear previous warnings
    setPiiWarning("");
    setBlockedMessage("");

    // ── Layer 1: client-side regex ──────────────────────────────
    for (const pattern of PII_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        setPiiWarning("Contact details cannot be shared in chat");
        // Async audit log — fire and forget
        supabase.functions
          .invoke("filter-message", {
            body: { content, job_id: jobId, sender_role: userRole, layer1_blocked: true },
          })
          .catch(console.error);
        return;
      }
    }

    // ── Layer 2: server-side SightEngine check ──────────────────
    try {
      const { data: filterData } = await supabase.functions.invoke("filter-message", {
        body: { content, job_id: jobId, sender_role: userRole, layer1_blocked: false },
      });

      if (filterData?.blocked) {
        setBlockedMessage(
          filterData.message ??
            "For security, contact details cannot be shared in chat.",
        );
        return;
      }
    } catch (err) {
      console.error("filter-message error:", err);
      setBlockedMessage("Message could not be sent. Please try again.");
      return;
    }

    // ── Both layers passed — send ───────────────────────────────
    await channelRef.current?.sendMessage({ text: content });
  };

  // ── Report message ────────────────────────────────────────────────────────
  const handleReportClick = (message: MessageResponse) => {
    setReportState({ messageId: message.id, reason: "" });
  };

  const submitReport = async () => {
    if (!reportState?.reason.trim()) return;

    await supabase.functions
      .invoke("filter-message", {
        body: {
          action: "report_message",
          job_id: jobId,
          message_id: reportState.messageId,
          reporter_id: userId,
          reason: reportState.reason,
        },
      })
      .catch(console.error);

    setReportState(null);
    setReportConfirmation("Message reported. Our team will review it.");
    setTimeout(() => setReportConfirmation(""), 5000);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading secure chat…
      </div>
    );
  }

  // ── Access denied ─────────────────────────────────────────────────────────
  if (error) {
    const iconMap: Record<string, string> = {
      kyc_not_approved: "🔒",
      escrow_not_funded: "💳",
      not_assigned: "💬",
    };
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-8">
        <span className="text-5xl" role="img" aria-label="chat unavailable">
          {iconMap[error.code ?? ""] ?? "⚠️"}
        </span>
        <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
          {error.message}
        </p>
      </div>
    );
  }

  if (!chatClient || !streamChannel) return null;

  // ── Admin read-only transcript ────────────────────────────────────────────
  if (userRole === "admin") {
    return (
      <div className="border rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b text-xs text-gray-500 font-medium">
          Admin view — read only
        </div>
        <Chat client={chatClient}>
          <Channel channel={streamChannel}>
            <Window>
              <MessageList />
            </Window>
          </Channel>
        </Chat>
      </div>
    );
  }

  // ── Full chat UI ──────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col h-full border rounded-xl overflow-hidden">

      {/* Warning banners */}
      {piiWarning && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{piiWarning}</span>
          <button
            onClick={() => setPiiWarning("")}
            className="ml-auto text-amber-600 hover:text-amber-800"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      {blockedMessage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <span>🚫</span>
          <span>{blockedMessage}</span>
          <button
            onClick={() => setBlockedMessage("")}
            className="ml-auto text-red-500 hover:text-red-700"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      {reportConfirmation && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-green-700 text-xs font-medium">
          ✓ {reportConfirmation}
        </div>
      )}

      {/* Report dialog overlay */}
      {reportState && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-1">Report message</h3>
            <p className="text-xs text-gray-500 mb-4">
              Tell us why you are reporting this message.
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
              rows={3}
              placeholder="Describe the issue…"
              value={reportState.reason}
              autoFocus
              onChange={(e) =>
                setReportState((s) => s && { ...s, reason: e.target.value })
              }
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setReportState(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportState.reason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg disabled:opacity-40 hover:bg-red-700 transition-colors"
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Chat UI */}
      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient}>
          <Channel
            channel={streamChannel}
            customMessageActions={{
              "Report message": (message: MessageResponse, event: React.BaseSyntheticEvent) => {
                event.stopPropagation();
                handleReportClick(message);
              },
            }}
          >
            <Window>
              <MessageList />
              <MessageInput
                overrideSubmitHandler={handleSubmit}
                disableAttachments
              />
            </Window>
          </Channel>
        </Chat>
      </div>

      {/* Security notice */}
      <p className="text-center text-xs text-gray-400 py-2 border-t bg-white">
        All messages are monitored. Contact details cannot be shared in chat.
      </p>
    </div>
  );
}

// ── Builder.io registration ───────────────────────────────────────────────────

(async () => {
  const { Builder } = await import("@builder.io/react");
  Builder.registerComponent(PaintBookChat, {
    name: "PaintBookChat",
    inputs: [
      { name: "jobId", type: "string" },
      { name: "userId", type: "string" },
      { name: "userRole", type: "string" },
    ],
  });
})();
