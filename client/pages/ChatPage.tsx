import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { StreamChat } from "stream-chat";
import {
  Chat, Channel, ChannelHeader,
  MessageInput, MessageList, Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { Loader2, ShieldCheck } from "lucide-react";

const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /(\+44|0044|0)[0-9\s\-\.]{9,}/g,
  /\b07\d{9}\b/g,
  /@[a-zA-Z0-9_]+/g,
  /\b\d{5}\s?\d{6}\b/g,
];

function containsPII(text: string): boolean {
  return PII_PATTERNS.some(p => p.test(text));
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

  const handleMessageSend = async (message: any) => {
    if (containsPII(message.text || "")) {
      setPiiWarning(true);
      setTimeout(() => setPiiWarning(false), 5000);
      return;
    }
    return message;
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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <img src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png" alt="PaintBookCo" className="h-7 object-contain" />
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
              Once you've agreed the job details and price, go to your
              <a href="/dashboard/painter" className="text-orange-400 hover:text-orange-300 mx-1">
                dashboard
              </a>
              to generate the invoice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
