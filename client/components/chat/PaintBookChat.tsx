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
// Normalise message — strip spaces/special chars between digits for evasion detection
function normaliseText(text: string): string {
  return text.replace(/[\s\.\-_\*\/\|,;:'"(){}\[\]!?]/g, "").toLowerCase();
}

// Track last 5 messages per session to detect split PII
const recentMessages: string[] = [];

function addToHistory(text: string) {
  recentMessages.push(text);
  if (recentMessages.length > 5) recentMessages.shift();
}

function getCombinedRecentText(): string {
  return recentMessages.join(" ");
}

const PII_PATTERNS: RegExp[] = [
  // UK mobile numbers — all formats including spaced, dashed, dotted
  /(\+\s*4\s*4\s*|0\s*0\s*4\s*4\s*|0)\s*7\s*[\d\s\.\-_]{9,14}/g,
  // UK landline
  /(\+\s*4\s*4\s*|0\s*0\s*4\s*4\s*|0)\s*[123]\s*[\d\s\.\-_]{8,12}/g,
  // International numbers starting with +
  /\+\s*\d[\d\s\.\-_]{9,14}/g,
  // Email addresses including obfuscated ones (e.g. john at gmail dot com)
  /[a-zA-Z0-9._%+\-]+\s*@\s*[a-zA-Z0-9.\-]+\s*\.\s*[a-zA-Z]{2,}/g,
  /\b\w+\s+(at|@)\s+\w+\s+(dot|\.)\s*(com|co\.uk|net|org|uk)\b/gi,
  // UK full postcodes
  /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/gi,
  // UK partial postcodes that could be split (outward codes like M28, SW1, EC2A)
  /\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/g,
  // URLs
  /(https?:\/\/|www\.|http)/gi,
  // Social media handles and platforms
  /@[a-zA-Z0-9_.]{2,}/g,
  // Social media platforms
  /\b(whatsapp|telegram|signal|snapchat|instagram|facebook|fb\.com|tiktok|twitter|linkedin|messenger|wechat|viber)\b/gi,
  // Street addresses — number followed by road type
  /\d+\s+[a-zA-Z]+\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|close|cl|way|court|ct|place|pl|crescent|cres|terrace|ter|grove|row|gardens|gate)\b/gi,

  // Intent patterns — asking for contact details
  /\b(what'?s?|give me|send me|drop|share|tell me|provide|can i (get|have)|let me (get|have)|do you have)\s+your\s*(number|phone|mobile|email|address|postcode|post\s*code|contact|details|whatsapp|instagram|facebook|telegram|signal)\b/gi,
  /\b(how (can|do) i (contact|reach|call|text|ring|get) you)\b/gi,
  /\b(can (i|we) (call|talk|chat|speak|connect|communicate) (you|outside|off|away|elsewhere))\b/gi,
  /\b(take this (off|outside|away from) (platform|here|chat|app))\b/gi,
  /\b(let'?s? (talk|chat|speak|connect|communicate) (off|outside|elsewhere|directly|privately))\b/gi,
  /\b(dm me|text me|call me|ring me|message me|contact me|reach me|find me)\b/gi,
  /\b(add me on|find me on|search (for )?me on|follow me on)\b/gi,

  // Intent patterns — offering contact details
  /\b(my (number|phone|mobile|email|address|postcode|post\s*code|contact|whatsapp) (is|:|'?s?|=))/gi,
  /\b(here'?s? my (number|phone|mobile|email|address|postcode|contact|details|whatsapp))\b/gi,
  /\b(you can (call|text|ring|reach|contact|email|message) me (at|on|via|through)?)\b/gi,
  /\b(reach me (at|on|via|through|by))\b/gi,
  /\b(contact me (at|on|via|through|by))\b/gi,
  /\b(i'?m? (at|on|available (at|on)))\s+[\d\+]/gi,
  /\b(this is (my )?(number|phone|mobile|email|contact|whatsapp|address))\b/gi,
  /\b(call me on|ring me on|text me on|message me on|whatsapp me (on|at)?)\b/gi,

  // Evasion attempts
  /\b(outside|off([ -]?platform)?|away from (here|chat|this))\b/gi,
  /\b(privately|in private|direct(ly)?|one[ -]on[ -]one)\b.*\b(contact|speak|talk|chat)\b/gi,
];

function containsHiddenPhone(text: string): boolean {
  const digits = text.replace(/\D/g, "");
  // UK mobile
  if (/07\d{9}/.test(digits)) return true;
  if (/447\d{9}/.test(digits)) return true;
  if (/00447\d{9}/.test(digits)) return true;
  // UK landline 11 digits starting with 0
  if (/0[123]\d{9}/.test(digits)) return true;
  // Any 10+ digit sequence that could be a phone
  if (digits.length >= 10 && digits.length <= 13) return true;
  return false;
}

function checkSplitPII(currentMessage: string): boolean {
  const combined = getCombinedRecentText() + " " + currentMessage;
  const normCombined = normaliseText(combined);
  // Check if combined recent messages form a complete UK postcode
  if (/[a-z]{1,2}\d{1,2}[a-z]?\d[a-z]{2}/.test(normCombined)) return true;
  // Check if combined messages form a phone number
  const digits = combined.replace(/\D/g, "");
  if (/07\d{9}/.test(digits) || /0[123]\d{9}/.test(digits)) return true;
  return false;
}

function detectPII(text: string): boolean {
  // Check current message
  if (PII_PATTERNS.some(p => { p.lastIndex = 0; return p.test(text); })) return true;
  if (containsHiddenPhone(text)) return true;
  // Check normalised text
  const norm = normaliseText(text);
  if (containsHiddenPhone(norm)) return true;
  // Check combined with recent messages for split PII
  if (checkSplitPII(text)) return true;
  return false;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaintBookChatProps {
  sessionId: string;
  userId: string;
  userRole: "painter" | "customer" | "admin";
  customerToken?: string;          // Required when userRole === "customer"
  transactionId?: string;          // Required for invoice generation
  jobStatus?: string;              // Current job status
  onInvoiceSent?: () => void;      // Called after invoice successfully sent
  disputeChannelId?: string;       // If set, connect to this channel instead of job channel
  onUnreadChange?: (count: number) => void; // Notify parent of unread count
}

interface InvoiceLineItem {
  description: string;
  amount: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaintBookChat({
  sessionId,
  userId,
  userRole,
  customerToken,
  transactionId,
  jobStatus,
  onInvoiceSent,
  disputeChannelId,
  onUnreadChange,
}: PaintBookChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [streamChannel, setStreamChannel] = useState<StreamChannelType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const [piiWarning, setPiiWarning] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");

  const [showDurationNotice, setShowDurationNotice] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`chat_duration_notice_dismissed_${sessionId}`) !== "true";
  });

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLineItem[]>([{ description: "", amount: 0 }]);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceSending, setInvoiceSending] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  const channelRef = useRef<StreamChannelType | null>(null);
  const clientRef = useRef<StreamChat | null>(null);

  const isDisputeMode = !!disputeChannelId;

  const canSendInvoice =
    !isDisputeMode &&
    userRole === "painter" &&
    !invoiceSent &&
    ["painter_contacted", "invoice_sent"].includes(jobStatus ?? "");

  // ── Connect to Stream Chat ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout>;

    async function connect(isRefresh = false) {
      try {
        const body: Record<string, string> = { session_id: sessionId };
        if (customerToken) body.customer_token = customerToken;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        };

        // Painter/admin: attach Supabase auth token
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
        const targetChannelId = disputeChannelId || channel_id;

        if (!isRefresh) {
          const client = StreamChat.getInstance(apiKey);
          clientRef.current = client;
          await client.connectUser({ id: user_id }, token);

          const channel = client.channel("messaging", targetChannelId, {
            name: "Job Chat",
            created_by_id: user_id,
          });
          await channel.watch({ messages: { limit: 300 } });

          if (!mounted) return;
          channelRef.current = channel;
          setChatClient(client);
          setStreamChannel(channel);

          onUnreadChange?.(channel.countUnread());
          channel.on("message.new", (event) => {
            if (event.message?.user?.id !== user_id) {
              onUnreadChange?.(channel.countUnread());
            }
          });
          channel.on("message.read", () => {
            onUnreadChange?.(0);
          });
        } else {
          await clientRef.current?.updateToken(token);
        }

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
  }, [sessionId, customerToken, userRole, disputeChannelId]);

  // ── PII-filtered message send ─────────────────────────────────────────────
  const handleSubmit = async (message: any) => {
    const content = (message?.text ?? message?.message?.text ?? "").trim();
    if (!content) return;

    setPiiWarning(false);
    setBlockedMessage("");

    const hasPII = detectPII(content);

    if (hasPII) {
      setPiiWarning(true);
      setTimeout(() => setPiiWarning(false), 4000);

      supabase.functions.invoke("filter-message", {
        body: { content, session_id: sessionId, sender_role: userRole, layer1_blocked: true },
      }).catch(console.error);

      const webhookUrl = import.meta.env.VITE_MAKE_PII_VIOLATION_WEBHOOK;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId,
            user_role: userRole,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);
      }
      return;
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
      // filter-message unavailable — PII regex above already ran as first-layer protection
    }

    await channelRef.current?.sendMessage({ text: content });
    addToHistory(content);
  };

  // ── Invoice generation ────────────────────────────────────────────────────
  const invoiceTotal = invoiceLines.reduce((s, l) => s + (l.amount || 0), 0);

  async function handleSendInvoice() {
    if (!transactionId && !sessionId) return;
    setInvoiceSending(true);
    setInvoiceError("");
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${authSession?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            session_id: sessionId,
            painter_id: userId,
            job_description: invoiceDescription,
            line_items: invoiceLines.filter(l => l.description.trim()),
            amount: invoiceTotal,
            notes: invoiceNotes,
          }),
        },
      );
      const result = await res.json();
      if (result.success) {
        setInvoiceSent(true);
        setShowInvoiceModal(false);
        onInvoiceSent?.();
        channelRef.current?.sendMessage({
          text: `Invoice sent for £${invoiceTotal.toFixed(2)}. Your customer has been notified by email with a Pay Now link.`,
        }).catch(console.error);
      } else {
        setInvoiceError(result.error || "Failed to send invoice. Please try again.");
      }
    } catch {
      setInvoiceError("Failed to send invoice. Please try again.");
    } finally {
      setInvoiceSending(false);
    }
  }

  function addLineItem() {
    setInvoiceLines(l => [...l, { description: "", amount: 0 }]);
  }

  function updateLineItem(i: number, field: keyof InvoiceLineItem, value: string | number) {
    setInvoiceLines(l => l.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function removeLineItem(i: number) {
    setInvoiceLines(l => l.filter((_, idx) => idx !== i));
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
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
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-8">
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
      <div className="border rounded-xl overflow-hidden">
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

  // ── Custom PII-filtered message input ────────────────────────────────────────
  function CustomInput() {
    const [text, setText] = React.useState("");
    const [blocked, setBlocked] = React.useState("");

    const onSend = async () => {
      const content = text.trim();
      if (!content) return;

      const hasPII = detectPII(content);

      if (hasPII) {
        setBlocked("⚠️ Contact details cannot be shared before payment is secured.");
        setTimeout(() => setBlocked(""), 4000);
        return;
      }

      setText("");
      setBlocked("");
      await channelRef.current?.sendMessage({ text: content });
      addToHistory(content);
    };

    return (
      <div className="p-3 border-t border-border">
        {blocked && (
          <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {blocked}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder="Type a message…"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground"
          />
          <button
            onClick={onSend}
            disabled={!text.trim()}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-foreground/90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  // ── Full chat UI ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="relative flex flex-col h-full border rounded-xl overflow-hidden">
        {/* Session duration notice */}
        {showDurationNotice && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <span>⏱</span>
            <span>Chat sessions are active for 30 minutes. Both parties will be notified 5 minutes before the session ends. Messages are saved and can be reviewed after the session.</span>
            <button
              onClick={() => {
                setShowDurationNotice(false);
                sessionStorage.setItem(`chat_duration_notice_dismissed_${sessionId}`, "true");
              }}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Warning banners */}
        {piiWarning && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>Contact details cannot be shared in chat before payment is secured.</span>
            <button onClick={() => setPiiWarning(false)} className="ml-auto text-amber-600 hover:text-amber-800">✕</button>
          </div>
        )}
        {blockedMessage && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span>🚫</span>
            <span>{blockedMessage}</span>
            <button onClick={() => setBlockedMessage("")} className="ml-auto text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Painter toolbar — Generate Invoice button */}
        {canSendInvoice && (
          <div className="px-4 py-2 bg-card border-b flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ready to quote? Send your customer an invoice.</span>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="text-xs font-medium bg-foreground text-background px-3 py-1.5 rounded hover:bg-foreground/90 transition-colors"
            >
              Generate Invoice
            </button>
          </div>
        )}
        {invoiceSent && (
          <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-green-700 text-xs font-medium">
            ✓ Invoice sent — awaiting customer payment
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <Chat client={chatClient}>
            <Channel channel={streamChannel}>
              <Window hideOnThread>
                <MessageList />
              </Window>
              <CustomInput />
            </Channel>
          </Chat>
        </div>

        <p className="text-center text-xs text-muted-foreground py-2 border-t bg-background">
          All messages are monitored. Contact details cannot be shared before payment is secured.
        </p>
      </div>

      {/* Invoice modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm">Generate Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Job Description</label>
                <textarea
                  value={invoiceDescription}
                  onChange={e => setInvoiceDescription(e.target.value)}
                  rows={2}
                  className="w-full border-b border-border bg-transparent text-sm py-2 focus:outline-none focus:border-foreground resize-none"
                  placeholder="Brief description of the work…"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Line Items</label>
                <div className="space-y-2">
                  {invoiceLines.map((line, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => updateLineItem(i, "description", e.target.value)}
                        className="flex-1 border-b border-border bg-transparent text-sm py-1.5 focus:outline-none focus:border-foreground"
                        placeholder="Item description"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">£</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.amount || ""}
                          onChange={e => updateLineItem(i, "amount", parseFloat(e.target.value) || 0)}
                          className="w-24 border-b border-border bg-transparent text-sm py-1.5 focus:outline-none focus:border-foreground text-right"
                          placeholder="0.00"
                        />
                      </div>
                      {invoiceLines.length > 1 && (
                        <button onClick={() => removeLineItem(i)} className="text-muted-foreground hover:text-destructive mt-1 text-xs">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addLineItem}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  + Add line item
                </button>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm font-medium">Total</span>
                <span className="font-semibold">£{invoiceTotal.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  value={invoiceNotes}
                  onChange={e => setInvoiceNotes(e.target.value)}
                  rows={2}
                  className="w-full border-b border-border bg-transparent text-sm py-2 focus:outline-none focus:border-foreground resize-none"
                  placeholder="Payment terms, special notes…"
                />
              </div>

              {invoiceError && (
                <p className="text-sm text-destructive">{invoiceError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 border border-border py-2.5 text-sm rounded hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvoice}
                disabled={invoiceSending || invoiceTotal <= 0 || !invoiceDescription.trim()}
                className="flex-1 bg-foreground text-background py-2.5 text-sm rounded hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {invoiceSending ? "Sending…" : "Send Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
