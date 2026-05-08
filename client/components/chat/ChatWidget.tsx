import { useEffect, useState } from "react";
import { MessageCircle, Minus, X, FileText } from "lucide-react";
import { PaintBookChat } from "./PaintBookChat";
import { supabase } from "../../lib/supabase";

interface ChatWidgetProps {
  channelId: string;
  sessionId: string;
  userId: string;
  userToken: string;
  userRole: "painter" | "customer";
  userName: string;
  jobRef?: string;
  streamApiKey: string;
  onClose: () => void;
}

export function ChatWidget({
  channelId,
  sessionId,
  userId,
  userToken,
  userRole,
  jobRef,
  streamApiKey,
  onClose,
}: ChatWidgetProps) {
  const [minimised, setMinimised] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Invoice modal state (painter only)
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", amount: "" }]);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  useEffect(() => {
    if (!minimised) setUnreadCount(0);
  }, [minimised]);

  const invoiceTotal = invoiceItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  async function handleSendInvoice() {
    setInvoiceLoading(true);
    setInvoiceError("");
    try {
      const validItems = invoiceItems.filter(i => i.description.trim() && i.amount);
      const total = validItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
      if (!invoiceDesc.trim() || validItems.length === 0 || total <= 0) {
        setInvoiceError("Please add a description and at least one line item with an amount.");
        setInvoiceLoading(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
      };

      // Try Supabase JWT first (dashboard context where painter is authenticated)
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.access_token) {
        headers["Authorization"] = `Bearer ${authSession.access_token}`;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            session_id: sessionId,
            painter_token: userToken, // Stream JWT fallback auth
            job_description: invoiceDesc,
            line_items: validItems.map(i => ({ description: i.description, amount: parseFloat(i.amount) })),
            amount: total,
            notes: invoiceNotes,
          }),
        }
      );

      const result = await res.json();
      if (result.success) {
        setInvoiceSuccess(true);
        setTimeout(() => {
          setShowInvoice(false);
          setInvoiceSuccess(false);
          setInvoiceDesc("");
          setInvoiceItems([{ description: "", amount: "" }]);
          setInvoiceNotes("");
        }, 2500);
      } else {
        setInvoiceError(result.error || "Failed to send invoice.");
      }
    } catch {
      setInvoiceError("An unexpected error occurred.");
    }
    setInvoiceLoading(false);
  }

  if (minimised) {
    return (
      <div
        onClick={() => setMinimised(false)}
        className="fixed bottom-0 right-4 w-72 bg-background border border-border border-b-0 rounded-t-xl px-4 py-3 flex items-center justify-between cursor-pointer shadow-lg z-50 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Job Discussion</span>
          {jobRef && <span className="text-xs text-muted-foreground">· {jobRef}</span>}
        </div>
        {unreadCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-0 right-4 w-[400px] h-[580px] bg-background border border-border border-b-0 rounded-t-xl shadow-2xl z-50 flex flex-col overflow-hidden max-[768px]:w-full max-[768px]:right-0 max-[768px]:h-full max-[768px]:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Job Discussion</span>
            {jobRef && <span className="text-xs text-muted-foreground">· {jobRef}</span>}
          </div>
          <div className="flex items-center gap-1">
            {userRole === "painter" && (
              <button
                onClick={() => setShowInvoice(true)}
                title="Generate Invoice"
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setMinimised(true)}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* PII warning */}
        <div className="bg-amber-900/20 border-b border-amber-800/30 px-3 py-1.5 flex-shrink-0">
          <p className="text-xs text-amber-400">
            🔒 For your safety, contact details are automatically removed from messages.
          </p>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          <PaintBookChat
            sessionId={sessionId}
            userId={userId}
            userRole={userRole}
            streamToken={userToken}
            streamApiKey={streamApiKey}
            channelId={channelId}
            onUnreadCountChange={setUnreadCount}
          />
        </div>
      </div>

      {/* Invoice modal — rendered outside widget so it's not clipped */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Generate Invoice</h2>
              <button onClick={() => setShowInvoice(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {invoiceSuccess ? (
              <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 text-center">
                <p className="text-green-400 font-medium">✓ Invoice sent! Customer has been notified by email.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Job Description</label>
                  <textarea
                    value={invoiceDesc}
                    onChange={e => setInvoiceDesc(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the work…"
                    className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Line Items</label>
                  {invoiceItems.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={item.description}
                        onChange={e => setInvoiceItems(prev => prev.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))}
                        placeholder="Item description"
                        className="flex-1 border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                      />
                      <div className="flex items-center gap-1 border border-border bg-background rounded-md px-2">
                        <span className="text-sm text-muted-foreground">£</span>
                        <input
                          value={item.amount}
                          onChange={e => setInvoiceItems(prev => prev.map((it, idx) => idx === i ? { ...it, amount: e.target.value } : it))}
                          placeholder="0.00"
                          className="w-20 py-2 text-sm bg-transparent focus:outline-none text-right"
                        />
                      </div>
                      {invoiceItems.length > 1 && (
                        <button onClick={() => setInvoiceItems(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive/70 hover:text-destructive px-1">✕</button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setInvoiceItems(prev => [...prev, { description: "", amount: "" }])}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    + Add line item
                  </button>
                </div>

                <div className="flex justify-between text-sm font-medium border-t border-border pt-3">
                  <span>Total</span>
                  <span>£{invoiceTotal.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Notes (optional)</label>
                  <textarea
                    value={invoiceNotes}
                    onChange={e => setInvoiceNotes(e.target.value)}
                    rows={2}
                    placeholder="Payment terms, special notes…"
                    className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
                  />
                </div>

                {invoiceError && <p className="text-sm text-destructive">{invoiceError}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="flex-1 border border-border py-2.5 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvoice}
                    disabled={invoiceLoading || invoiceTotal <= 0 || !invoiceDesc.trim()}
                    className="flex-1 bg-foreground text-background py-2.5 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    {invoiceLoading ? "Sending…" : "Send Invoice to Customer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
