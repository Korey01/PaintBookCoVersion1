import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Separate client for chat page — persistSession true so admin session is available
const chatSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: true } }
);
import { StreamChat } from "stream-chat";
import {
  Chat, Channel, ChannelHeader,
  MessageInput, MessageList, Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { Loader2, ShieldCheck } from "lucide-react";

// FIX 1: improved PII patterns
const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /(\+44\s?|0044\s?|0)[\s\-\.]?[17][0-9\s\-\.]{8,12}/g,
  /\b07\d{2}[\s\-\.]?\d{3}[\s\-\.]?\d{3,4}\b/g,
  /\b(\+44|0044)[\s\-\.]?[0-9\s\-\.]{10,}\b/g,
  /@[a-zA-Z0-9_.]{2,}/g,
  /\b[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}\b/gi,
  /\b\d+\s+[A-Za-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Close|Cl|Way|Court|Ct|Place|Pl|Crescent|Cres|Terrace|Ter|Grove|Gv)\b/gi,
  /\b(whatsapp|telegram|signal|snapchat|instagram|facebook|fb|tiktok)\b/gi,
];

function containsPII(text: string): boolean {
  return PII_PATTERNS.some(p => {
    p.lastIndex = 0;
    return p.test(text);
  });
}

export default function ChatPage() {
  const { channel_id } = useParams<{ channel_id: string }>();
  const [searchParams] = useSearchParams();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [piiWarning, setPiiWarning] = useState(false);
  const [isPainter, setIsPainter] = useState(false);

  // FIX 2: invoice state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", amount: "" }]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);

  const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;

  const connectToChat = async (streamToken: string, streamUserId: string, displayName: string) => {
    const chatClient = StreamChat.getInstance(streamApiKey);
    await chatClient.connectUser(
      { id: streamUserId, name: displayName },
      streamToken
    );
    const chatChannel = chatClient.channel("messaging", channel_id!, {
      name: "Job Discussion",
      members: [streamUserId],
    });
    await chatChannel.watch();
    setClient(chatClient);
    setChannel(chatChannel);
  };

  useEffect(() => {
    if (!channel_id || !streamApiKey) {
      setError("Invalid chat link. Please use the link from your email.");
      setLoading(false);
      return;
    }

    const token = searchParams.get("token");
    const userId = searchParams.get("user");
    const role = searchParams.get("role");
    const customerToken = searchParams.get("customer_token");
    const sessionId = searchParams.get("session_id");

    const run = async () => {
      try {
        // Painter path — token already in URL
        if (token && userId) {
          setIsPainter(role === "painter");
          await connectToChat(token, userId, role === "painter" ? "Painter" : "Customer");
          setLoading(false);
          return;
        }

        // Customer path — exchange customer_token for a Stream token
        if (customerToken && sessionId) {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ session_id: sessionId, customer_token: customerToken }),
            }
          );
          const data = await res.json();
          if (!res.ok || !data.token) {
            setError("Failed to authenticate. Please use the link from your email.");
            setLoading(false);
            return;
          }
          await connectToChat(data.token, data.user_id, "Customer");
          setLoading(false);
          return;
        }

        // Admin path — use Supabase session to get Stream token
        const isAdmin = searchParams.get("admin") === "true";
        if (isAdmin && sessionId) {
          const { data: { session: authSession } } = await chatSupabase.auth.getSession();
          if (authSession?.access_token) {
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                  "Authorization": `Bearer ${authSession.access_token}`,
                },
                body: JSON.stringify({ session_id: sessionId, role: "admin" }),
              }
            );
            const data = await res.json();
            if (data.token) {
              await connectToChat(data.token, data.user_id, "Admin");
              setLoading(false);
              return;
            }
          }
        }

        setError("Invalid chat link. Please use the link from your email.");
        setLoading(false);
      } catch (err: any) {
        if (err.message?.includes("token is expired")) {
          setError("This chat session has expired. Please contact support.");
        } else {
          setError("Failed to connect to chat. Please try again.");
        }
        setLoading(false);
      }
    };

    run();
  }, []);

  // Auto-open invoice modal when navigated from dashboard
  useEffect(() => {
    if (searchParams.get("openInvoice") === "true" && client) {
      setShowInvoiceModal(true);
    }
  }, [client]);

  const handleMessageSend = async (message: any) => {
    if (containsPII(message.text || "")) {
      setPiiWarning(true);
      setTimeout(() => setPiiWarning(false), 5000);
      return;
    }
    return message;
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceDescription.trim()) return;
    const validItems = invoiceItems.filter(i => i.description && i.amount);
    if (!validItems.length) return;

    setInvoiceLoading(true);
    try {
      const sessionId = channel_id?.replace("job-", "");
      const total = validItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            painter_token: searchParams.get("token"),
            job_description: invoiceDescription,
            line_items: validItems.map(i => ({ description: i.description, amount: parseFloat(i.amount) || 0 })),
            amount: total,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setInvoiceSuccess(true);
        setShowInvoiceModal(false);
      } else {
        alert(data.error || "Failed to generate invoice");
      }
    } catch {
      alert("Failed to send invoice. Please try again.");
    }
    setInvoiceLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
        <p className="text-gray-400 text-sm">Connecting to chat...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Chat Unavailable</h1>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    </div>
  );

  if (!client || !channel) return null;

  const invoiceTotal = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* FIX 6: hide Stream attachment button */}
      <style>{`.str-chat__attachment-selector { display: none !important; }`}</style>

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <img src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png" alt="PaintBookCo" className="h-7 object-contain" />
          <div className="flex items-center gap-1.5 text-green-400 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Monitored for safety</span>
          </div>
        </div>
      </div>

      {/* PII Warning */}
      {piiWarning && (
        <div className="bg-red-900/50 border-b border-red-800 px-6 py-3 text-center">
          <p className="text-red-300 text-sm">
            ⚠️ Your message contains contact details and cannot be sent.
            Please do not share phone numbers, email addresses or social media handles.
          </p>
        </div>
      )}

      {/* Safety notice */}
      <div className="bg-amber-900/20 border-b border-amber-900/30 px-6 py-2 text-center">
        <p className="text-amber-400/80 text-xs">
          🔒 For your safety, contact details are automatically removed from messages.
          Share contact details only after payment is confirmed.
        </p>
      </div>

      {/* FIX 2: Painter invoice toolbar */}
      {isPainter && !invoiceSuccess && (
        <div className="border-b border-gray-800 px-4 py-2 flex items-center justify-between bg-gray-900/80 max-w-3xl mx-auto w-full">
          <span className="text-xs text-gray-500">Painter tools</span>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            📄 Generate Invoice
          </button>
        </div>
      )}
      {isPainter && invoiceSuccess && (
        <div className="border-b border-green-900/40 px-4 py-2 bg-green-900/20 max-w-3xl mx-auto w-full">
          <p className="text-xs text-green-400 text-center">✓ Invoice sent to customer</p>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 max-w-3xl mx-auto w-full">
        <Chat client={client} theme="str-chat__theme-dark">
          <Channel channel={channel} sendMessage={handleMessageSend}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput
                placeholder="Discuss your job requirements... (contact details not permitted)"
              />
            </Window>
          </Channel>
        </Chat>
      </div>

      {/* Footer — painter only */}
      {isPainter && (
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-xs text-center">
              Once you've agreed the job details and price, use the Generate Invoice button above.
            </p>
          </div>
        </div>
      )}

      {/* FIX 2: Invoice modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Generate Invoice</h2>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Job Description</label>
              <textarea
                value={invoiceDescription}
                onChange={e => setInvoiceDescription(e.target.value)}
                placeholder="e.g. Interior painting of 1 bedroom flat"
                rows={2}
                className="w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Line Items</label>
              {invoiceItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item.description}
                    onChange={e => setInvoiceItems(prev => prev.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))}
                    placeholder="Description"
                    className="flex-1 border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
                  />
                  <input
                    value={item.amount}
                    onChange={e => setInvoiceItems(prev => prev.map((it, idx) => idx === i ? { ...it, amount: e.target.value } : it))}
                    placeholder="£"
                    className="w-20 border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
                  />
                  {invoiceItems.length > 1 && (
                    <button
                      onClick={() => setInvoiceItems(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-400 text-sm px-1"
                    >✕</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setInvoiceItems(prev => [...prev, { description: "", amount: "" }])}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                + Add line item
              </button>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between text-sm font-medium text-white">
                <span>Total</span>
                <span>£{invoiceTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-md text-sm hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoice}
                disabled={invoiceLoading || !invoiceDescription.trim() || invoiceTotal <= 0}
                className="flex-1 bg-orange-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {invoiceLoading ? "Sending..." : "Send Invoice to Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
