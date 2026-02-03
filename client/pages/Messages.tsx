import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Loader } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  jobId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  readAt?: string;
  sender: {
    id: string;
    email: string;
    userType: string;
  };
  recipient: {
    id: string;
    email: string;
    userType: string;
  };
}

interface Job {
  id: string;
  title: string;
  status: string;
  customerId: string;
  painterId: string;
}

export default function Messages() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("paintbook:token");

  useEffect(() => {
    // Get current user ID from token decode (simplified)
    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch job and messages
      if (jobId) {
        try {
          const [jobRes, messagesRes] = await Promise.all([
            fetch(`/api/jobs/${jobId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/messages/${jobId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (jobRes.ok) {
            const jobData = await jobRes.json();
            setJob(jobData.data);

            // Determine recipient (the other party)
            // For now, we'll use a simplified approach
            // In production, you'd decode the JWT to get the user ID
            const testUserId = "user123"; // This should come from decoded token
            setUserId(testUserId);

            if (jobData.data.customerId !== testUserId) {
              setRecipientId(jobData.data.customerId);
            } else {
              setRecipientId(jobData.data.painterId);
            }
          }

          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            setMessages(messagesData.data.messages || []);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load messages");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [jobId, token, navigate]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (!jobId || !recipientId) {
      toast.error("Unable to send message");
      return;
    }

    setSendingMessage(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          recipientId,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setMessages([...messages, data.data]);
      setNewMessage("");
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-background to-muted"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-border/50 bg-card shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">
                {job?.title || "Messages"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Status: {job?.status}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4"
      >
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation by sending a message
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${
                  msg.senderId === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                    msg.senderId === userId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-t border-border/50 bg-card"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sendingMessage}
              className="flex-1 px-4 py-2 rounded-full border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sendingMessage || !newMessage.trim()}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 font-semibold"
            >
              {sendingMessage ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden md:inline">Send</span>
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
