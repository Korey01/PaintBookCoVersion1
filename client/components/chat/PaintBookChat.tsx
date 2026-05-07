import React, { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import type { Channel as StreamChannelType } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { supabase } from "../../lib/supabase";

// ── PII regex patterns ────────────────────────────────────────────────────────
const PII_PATTERNS: RegExp[] = [
  /(\+44|0)7\d{3}[\s\-]?\d{3}[\s\-]?\d{3}/g,
  /(\+44|0)(1|2|3)\d{8,9}/g,
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  /[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/gi,
  /(https?:\/\/|www\.)/gi,
  /@[a-zA-Z0-9_]{3,}/g,
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaintBookChatProps {
  sessionId: string;
  userId: string;
  userRole: "painter" | "customer" | "admin";
  customerToken?: string;
  // Direct-connect props (used by ChatWidget — skips internal token fetch)
  streamToken?: string;
  streamApiKey?: string;
  channelId?: string;
  onUnreadCountChange?: (count: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaintBookChat({
  sessionId,
  userId,
  userRole,
  customerToken,
  streamToken,
  streamApiKey: streamApiKeyProp,
  channelId: channelIdProp,
  onUnreadCountChange,
}: PaintBookChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [streamChannel, setStreamChannel] = useState<StreamChannelType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const [piiWarning, setPiiWarning] = useState("");
  const [blockedMessage, setBlockedMessage] = useState("");

  const channelRef = useRef<StreamChannelType | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  // ── Connect to Stream Chat ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout>;

    async function connectDirect() {
      // Direct-connect path: token pre-provided by ChatWidget
      try {
        const apiKey = streamApiKeyProp ?? import.meta.env.VITE_STREAM_API_KEY ?? "";
        const client = StreamChat.getInstance(apiKey);
        clientRef.current = client;
        await client.connectUser({ id: userId }, streamToken!);

        const channel = client.channel("messaging", channelIdProp!, {
          name: "Job Chat",
          created_by_id: userId,
        });
        await channel.watch({ messages: { limit: 300 } });

        if (!mounted) return;
        channelRef.current = channel;
        setChatClient(client);
        setStreamChannel(channel);
      } catch (err) {
        console.error("PaintBookChat direct connect error:", err);
        if (mounted) setError({ message: "Failed to load chat. Please try again." });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    async function connectViaTokenFetch(isRefresh = false) {
      // Internal-fetch path: get token from generate-stream-token edge function
      try {
        const body: Record<string, string> = { session_id: sessionId };
        if (customerToken) body.customer_token = customerToken;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        };

        if (userRole !== "customer") {
          const { data: { session: authSession } } = await supabase.auth.getSession();
          if (authSession?.access_token) {
            headers["Authorization"] = `Bearer ${authSession.access_token}`;
          }
        }

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
          { method: "POST", headers, body: JSON.stringify(body) },
        );

        const data = await res.json().catch(() => ({}));
        if (!mounted) return;

        if (!res.ok || !data?.token) {
          const code: string = data?.code ?? "unknown";
          const msg: string = data?.error ?? "Chat is not available.";
          if (!isRefresh) setError({ message: msg, code });
          return;
        }

        const { token, user_id, channel_id } = data as {
          token: string; user_id: string; channel_id: string;
        };
        const apiKey = import.meta.env.VITE_STREAM_API_KEY ?? "";

        if (!isRefresh) {
          const client = StreamChat.getInstance(apiKey);
          clientRef.current = client;
          await client.connectUser({ id: user_id }, token);

          const channel = client.channel("messaging", channel_id, {
            name: "Job Chat",
            created_by_id: user_id,
          });
          await channel.watch({ messages: { limit: 300 } });

          if (!mounted) return;
          channelRef.current = channel;
          setChatClient(client);
          setStreamChannel(channel);
        } else {
          await clientRef.current?.updateToken(token);
        }

        refreshTimer = setTimeout(() => connectViaTokenFetch(true), 55 * 60 * 1000);
      } catch (err) {
        console.error("PaintBookChat init error:", err);
        if (!isRefresh && mounted) {
          setError({ message: "Failed to load chat. Please try again." });
        }
      } finally {
        if (!isRefresh && mounted) setIsLoading(false);
      }
    }

    if (streamToken && channelIdProp) {
      connectDirect();
    } else {
      connectViaTokenFetch();
    }

    return () => {
      mounted = false;
      clearTimeout(refreshTimer);
      clientRef.current?.disconnectUser().catch(console.error);
    };
  }, [sessionId, customerToken, userRole, streamToken, channelIdProp]);

  // ── Unread count listener ─────────────────────────────────────────────────
  useEffect(() => {
    if (!streamChannel || !onUnreadCountChange) return;
    const handler = () => {
      onUnreadCountChange(streamChannel.countUnread?.() ?? 0);
    };
    streamChannel.on("message.new", handler);
    return () => {
      streamChannel.off("message.new", handler);
    };
  }, [streamChannel, onUnreadCountChange]);

  // ── PII-filtered message send ─────────────────────────────────────────────
  const handleSubmit = async (message: { text?: string }) => {
    const content = (message.text ?? "").trim();
    if (!content) return;

    setPiiWarning("");
    setBlockedMessage("");

    for (const pattern of PII_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        setPiiWarning("Contact details cannot be shared in chat before payment is secured.");
        supabase.functions.invoke("filter-message", {
          body: { content, session_id: sessionId, sender_role: userRole, layer1_blocked: true },
        }).catch(console.error);
        return;
      }
    }

    try {
      const { data: filterData } = await supabase.functions.invoke("filter-message", {
        body: { content, session_id: sessionId, sender_role: userRole, layer1_blocked: false },
      });
      if (filterData?.blocked) {
        setBlockedMessage(filterData.message ?? "Message could not be sent — contact details are not permitted.");
        return;
      }
    } catch {
      setBlockedMessage("Message could not be sent. Please try again.");
      return;
    }

    await channelRef.current?.sendMessage({ text: content });
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Loading secure chat…
      </div>
    );
  }

  if (error) {
    const iconMap: Record<string, string> = {
      kyc_not_approved: "🔒",
      escrow_not_funded: "💳",
      not_assigned: "💬",
    };
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <span className="text-5xl" role="img" aria-label="chat unavailable">
          {iconMap[error.code ?? ""] ?? "⚠️"}
        </span>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{error.message}</p>
      </div>
    );
  }

  if (!chatClient || !streamChannel) return null;

  // ── Admin read-only ───────────────────────────────────────────────────────
  if (userRole === "admin") {
    return (
      <div className="border rounded-xl overflow-hidden h-full">
        <div className="px-4 py-2 bg-muted border-b text-xs text-muted-foreground font-medium">
          Admin view — read only
        </div>
        <Chat client={chatClient}>
          <Channel channel={streamChannel}>
            <Window><MessageList /></Window>
          </Channel>
        </Chat>
      </div>
    );
  }

  // ── Full chat UI ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {piiWarning && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2 flex-shrink-0">
          <span>⚠️</span>
          <span>{piiWarning}</span>
          <button onClick={() => setPiiWarning("")} className="ml-auto text-amber-600 hover:text-amber-800">✕</button>
        </div>
      )}
      {blockedMessage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 flex-shrink-0">
          <span>🚫</span>
          <span>{blockedMessage}</span>
          <button onClick={() => setBlockedMessage("")} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <Chat client={chatClient}>
          <Channel channel={streamChannel}>
            <Window>
              <MessageList />
              <MessageInput overrideSubmitHandler={handleSubmit} disableAttachments />
            </Window>
          </Channel>
        </Chat>
      </div>

      <p className="text-center text-xs text-muted-foreground py-2 border-t bg-background flex-shrink-0">
        All messages are monitored. Contact details cannot be shared before payment is secured.
      </p>
    </div>
  );
}
