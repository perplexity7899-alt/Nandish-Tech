import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Mail, Send, Reply } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  read: boolean;
  name?: string;
  email?: string;
  phone?: string;
}

interface Reply {
  id: string;
  message_id: string;
  admin_id?: string;
  client_id?: string;
  reply_message: string;
  created_at: string;
  is_admin_reply?: boolean;
}

export default function ClientMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch client's messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["client-messages", user?.id],
    queryFn: async () => {
      console.log("Fetching client messages...");
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      console.log("Messages fetched:", data?.length);
      return (data as Message[]) || [];
    },
    enabled: !!user,
    staleTime: 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    networkMode: "always",
  });

  // Fetch replies for client's messages
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ["client-replies", user?.id, messages.map(m => m.id).join(",")],
    queryFn: async () => {
      if (!messages.length) {
        console.log("No messages, skipping replies fetch");
        return [];
      }

      console.log("Fetching replies for messages...");
      const messageIds = messages.map((m) => m.id);
      const { data, error } = await (supabase as any)
        .from("replies")
        .select("*")
        .in("message_id", messageIds)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching replies:", error);
        throw error;
      }
      console.log("Replies fetched:", data?.length);
      return (data as Reply[]) || [];
    },
    enabled: !!user && messages.length > 0,
    staleTime: 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    networkMode: "always",
  });

  // Memoized mapping of replies by message ID
  const repliesByMessageId = useMemo(() => {
    const map = new Map<string, Reply[]>();
    replies.forEach((reply) => {
      if (!map.has(reply.message_id)) {
        map.set(reply.message_id, []);
      }
      map.get(reply.message_id)!.push(reply);
    });
    return map;
  }, [replies]);

  // Real-time subscription to new replies
  useEffect(() => {
    if (!user?.id) return;

    let channel: any;
    try {
      console.log("Setting up real-time listener for client replies...");
      
      channel = supabase
        .channel("client-replies-changes-" + user.id)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "replies",
          },
          async (payload: any) => {
            console.log("Real-time event received:", payload);
            
            // Check if this reply is for one of the user's messages
            if (messages.length > 0) {
              const messageIds = messages.map(m => m.id);
              const isForUserMessage = messageIds.includes(payload.new.message_id);
              
              if (isForUserMessage) {
                console.log("New reply received for user's message!");
                console.log("Reply details:", {
                  id: payload.new.id,
                  message_id: payload.new.message_id,
                  admin_id: payload.new.admin_id,
                  client_id: payload.new.client_id,
                  is_admin_reply: payload.new.is_admin_reply,
                  reply_message: payload.new.reply_message,
                });
                
                // Check if it's an admin reply
                if (payload.new.admin_id && !payload.new.client_id) {
                  console.log("Admin reply detected, playing sound...");
                  playNotificationSound("admin_reply");
                }
                
                // Refetch replies
                queryClient.invalidateQueries({ queryKey: ["client-replies"] });
              }
            }
          }
        )
        .subscribe((status: string) => {
          console.log("Real-time subscription status:", status);
        });
    } catch (error) {
      console.error("Error subscribing to replies:", error);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user?.id, messages, queryClient]);

  const sendReply = async (messageId: string) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setSendingReply(true);
    try {
      const { data, error } = await (supabase as any)
        .from("replies")
        .insert({
          message_id: messageId,
          client_id: user?.id,
          reply_message: replyText.trim(),
          is_admin_reply: false,
        })
        .select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      toast.success("Reply sent successfully");
      setReplyText("");
      setReplyingToId(null);

      // Play notification sound
      playNotificationSound("reply");

      // Refetch replies
      await queryClient.refetchQueries({ queryKey: ["client-replies"] });
    } catch (error: any) {
      console.error("Error sending reply:", error);
      const errorMessage = error?.message || "Failed to send reply";
      toast.error(errorMessage);
    } finally {
      setSendingReply(false);
    }
  };

  const playNotificationSound = (type: "reply" | "admin_reply") => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "reply") {
        // Client reply sound - lower frequency
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else if (type === "admin_reply") {
        // Admin reply sound - higher frequency and longer
        oscillator.frequency.value = 1200;
        gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        
        // Add a second tone for better notification
        const oscillator2 = audioContext.createOscillator();
        oscillator2.connect(gainNode);
        oscillator2.frequency.value = 1600;
        oscillator2.start(audioContext.currentTime + 0.4);
        oscillator2.stop(audioContext.currentTime + 0.8);
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const isLoading = messagesLoading || repliesLoading;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        My Messages{" "}
        <span className="text-muted-foreground font-normal text-sm">
          ({messages.length})
        </span>
      </h2>

      {isLoading && messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">Loading conversations...</p>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">You haven't sent any messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const messageReplies = repliesByMessageId.get(message.id) || [];
            const isExpanded = expandedMessage === message.id;

            return (
              <div
                key={message.id}
                className={`bg-card border rounded-lg overflow-hidden transition-colors ${
                  messageReplies.length > 0
                    ? "border-primary/30 bg-accent/30"
                    : "border-border"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedMessage(isExpanded ? null : message.id)
                  }
                  className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {message.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()} ·{" "}
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {messageReplies.length > 0
                          ? `${messageReplies.length} ${
                              messageReplies.length === 1 ? "reply" : "replies"
                            }`
                          : "No replies yet"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {messageReplies.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded">
                          <Reply className="w-3 h-3" /> Replied
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/20">
                    {/* Original Message */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Your Message
                      </p>
                      <p className="text-sm text-foreground">{message.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(message.created_at).toLocaleDateString()} ·{" "}
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Replies */}
                    {messageReplies.length > 0 && (
                      <div className="space-y-2">
                        {messageReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-lg border ${
                              reply.is_admin_reply
                                ? "bg-primary/5 border-primary/20"
                                : "bg-accent/5 border-accent/20"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-medium">
                                {reply.is_admin_reply ? (
                                  <span className="text-primary">👨‍💼 Admin Reply</span>
                                ) : (
                                  <span className="text-accent">👤 Your Reply</span>
                                )}
                              </p>
                            </div>
                            <p className="text-sm text-foreground">
                              {reply.reply_message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(reply.created_at).toLocaleDateString()} ·{" "}
                              {new Date(reply.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Section - Only if there are admin replies */}
                    {messageReplies.some(r => r.is_admin_reply) && (
                      <div className="mt-3 pt-3 border-t border-border">
                        {replyingToId === message.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-16 text-xs"
                              disabled={sendingReply}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => sendReply(message.id)}
                                disabled={sendingReply || !replyText.trim()}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                {sendingReply ? "Sending..." : "Send"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyText("");
                                }}
                                disabled={sendingReply}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingToId(message.id)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" />
                            Reply to Admin
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
