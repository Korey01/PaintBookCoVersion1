import { useEffect, useState } from "react";
import { MessageCircle, Minus, X } from "lucide-react";
import { PaintBookChat } from "./PaintBookChat";

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

  useEffect(() => {
    if (!minimised) setUnreadCount(0);
  }, [minimised]);

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
    <div className="fixed bottom-0 right-4 w-[400px] h-[580px] bg-background border border-border border-b-0 rounded-t-xl shadow-2xl z-50 flex flex-col overflow-hidden max-[768px]:w-full max-[768px]:right-0 max-[768px]:h-full max-[768px]:rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Job Discussion</span>
          {jobRef && <span className="text-xs text-muted-foreground">· {jobRef}</span>}
        </div>
        <div className="flex items-center gap-1">
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
  );
}
