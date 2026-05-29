import React, { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import type { Channel as StreamChannelType } from "stream-chat";
import { Chat, Channel, Window, MessageList, MessageInput } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

interface PaintBookChatAdminProps {
  channelId: string;
  readOnly?: boolean;
  supabase: any;
  onUnreadChange?: (count: number) => void;
}

export function PaintBookChatAdmin({
  channelId,
  readOnly = false,
  supabase,
  onUnreadChange,
}: PaintBookChatAdminProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [streamChannel, setStreamChannel] = useState<StreamChannelType | null>(null);
  const [error, setError] = useState("");
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    let mounted = true;

    async function connect() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession?.access_token) return;

        const tokenRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${authSession.access_token}`,
            },
            body: JSON.stringify({ session_id: "admin" }),
          }
        );
        const tokenData = await tokenRes.json();
        if (!tokenData.token || !tokenData.user_id) {
          if (mounted) setError("Could not connect admin to chat");
          return;
        }

        const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
        clientRef.current = client;
        if (!client.userID) {
          await client.connectUser(
            { id: tokenData.user_id, name: "PaintBookCo Admin", role: "admin" },
            tokenData.token
          );
        }

        const ch = client.channel("messaging", channelId);
        await ch.watch();

        if (!mounted) return;
        setChatClient(client);
        setStreamChannel(ch);
        onUnreadChange?.(ch.countUnread());

        ch.on("message.new", (event) => {
          if (event.message?.user?.id !== client.userID) {
            onUnreadChange?.(ch.countUnread());
          }
        });

        ch.on("message.read", () => {
          onUnreadChange?.(0);
        });
      } catch (err) {
        console.error("Admin chat error:", err);
        if (mounted) setError("Could not connect to chat");
      }
    }

    connect();
    return () => {
      mounted = false;
    };
  }, [channelId]);

  if (error)
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        {error}
      </div>
    );
  if (!chatClient || !streamChannel)
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Connecting…
      </div>
    );

  return (
    <div className="h-full">
      <Chat client={chatClient}>
        <Channel channel={streamChannel}>
          <Window hideOnThread>
            <MessageList />
          </Window>
          {!readOnly && <MessageInput />}
        </Channel>
      </Chat>
    </div>
  );
}
