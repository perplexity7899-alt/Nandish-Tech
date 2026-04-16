import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Trash2, Eye, ChevronDown, ChevronUp, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply } from "@/types/portfolio";
import { playNotificationSound } from "@/utils/notifications";

export default function MessagesPanel() {
  const queryClient = useQueryClient();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
    refetchInterval: 2000, // Refetch every 2 seconds for real-time feel
  });

  // Fetch replies for all messages
  const { data: replies = [] } = useQuery({
    queryKey: ["admin-replies"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("replies")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Reply[]) || [];
    },
    refetchInterval: 2000,
  });

  // Group messages by user_id
  const groupedMessages = messages.reduce((acc, msg) => {
    const userId = msg.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        name: msg.name,
        lastName: msg.last_name || "",
        email: msg.email,
        phone: msg.phone || "",
        messages: [],
        unread: 0,
        lastMessage: msg.created_at,
      };
    }
    acc[userId].messages.push(msg);
    if (!msg.read) acc[userId].unread += 1;
    return acc;
  }, {} as Record<string, any>);

  const conversationList = (Object.values(groupedMessages) as any[]).sort(
    (a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime()
  );

  // Real-time subscription to new messages with fallback polling
  useEffect(() => {
    let channel: any;
    
    try {
      channel = supabase
        .channel("messages-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload: any) => {
            // Immediately refetch when new message inserted
            queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "messages",
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
          }
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            // Subscription active
          }
        });
    } catch (error) {
      console.error("Error subscribing to messages:", error);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [queryClient]);

  // Real-time subscription to replies changes
  useEffect(() => {
    let channel: any;
    
    try {
      channel = supabase
        .channel("replies-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "replies",
          },
          () => {
            console.log("New reply detected, updating UI...");
            queryClient.invalidateQueries({ queryKey: ["admin-replies"] });
            queryClient.invalidateQueries({ queryKey: ["client-replies"] });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "replies",
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["admin-replies"] });
            queryClient.invalidateQueries({ queryKey: ["client-replies"] });
          }
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("Replies subscription active");
          }
        });
    } catch (error) {
      console.error("Error subscribing to replies:", error);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [queryClient]);

  // Listen for client reply notifications
  useEffect(() => {
    let channel: any;

    try {
      const user = supabase.auth.getUser();
      
      // Subscribe to admin-specific channel for new client replies
      channel = supabase
        .channel("admin-notifications")
        .on(
          "broadcast",
          { event: "new_client_reply" },
          (payload: any) => {
            console.log("Client reply notification received:", payload);
            // Play notification sound
            playNotificationSound("reply");
            // Show toast notification
            toast.success(`${payload.payload.client_name} replied to your message!`, {
              description: payload.payload.message,
            });
            // Refetch replies to show new reply
            queryClient.invalidateQueries({ queryKey: ["admin-replies"] });
          }
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("Admin notifications subscription active");
          }
        });
    } catch (error) {
      console.error("Error subscribing to admin notifications:", error);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [queryClient]);

  const deleteConversation = async (userId: string) => {
    const { error } = await supabase.from("messages").delete().eq("user_id", userId);
    if (error) {
      toast.error("Failed to delete conversation");
    } else {
      toast.success("Conversation deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    }
  };

  const markConversationRead = async (userId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Marked as read");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    }
  };

  const sendReply = async (messageId: string) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setSendingReply(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) {
        toast.error("User not authenticated");
        setSendingReply(false);
        return;
      }

      console.log("Sending reply:", {
        message_id: messageId,
        admin_id: user.data.user.id,
        reply_message: replyText.trim(),
      });

      const { data, error } = await (supabase as any)
        .from("replies")
        .insert({
          message_id: messageId,
          admin_id: user.data.user.id,
          reply_message: replyText.trim(),
          is_admin_reply: true,
        })
        .select();

      console.log("Insert response:", { data, error });

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      toast.success("Reply sent successfully");
      setReplyText("");
      setReplyingToId(null);
      
      // Send broadcast notification to client
      try {
        const channel = supabase.channel("notifications");
        await channel.send({
          type: "broadcast",
          event: "admin_reply_sent",
          payload: {
            message_id: messageId,
            admin_id: user.data.user.id,
            timestamp: new Date().toISOString(),
          },
        });
        console.log("Broadcast notification sent to clients");
      } catch (broadcastError) {
        console.error("Error sending broadcast notification:", broadcastError);
      }
      
      // Immediately invalidate and refetch queries to update UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-replies"] }),
        queryClient.invalidateQueries({ queryKey: ["client-replies"] }),
      ]);
      
      // Wait for refetch to complete
      await queryClient.refetchQueries({ queryKey: ["admin-replies"] });
      
      console.log("Reply sent and UI updated");
    } catch (error: any) {
      console.error("Error sending reply:", error);
      const errorMessage = error?.message || error?.error?.message || "Failed to send reply";
      toast.error(errorMessage);
    } finally {
      setSendingReply(false);
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Messages <span className="text-muted-foreground font-normal text-sm">({conversationList.length}{unread > 0 ? ` · ${unread} unread` : ""})</span>
      </h2>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : conversationList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversationList.map((conversation) => (
            <div
              key={conversation.userId}
              className={`bg-card border rounded-lg overflow-hidden transition-colors ${
                conversation.unread > 0 ? "border-primary/30 bg-accent/30" : "border-border"
              }`}
            >
              <button
                onClick={() =>
                  setExpandedUser(expandedUser === conversation.userId ? null : conversation.userId)
                }
                className="w-full p-5 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm">
                      {conversation.name} {conversation.lastName}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{conversation.email}</p>
                  {conversation.phone && (
                    <p className="text-xs text-muted-foreground mb-1">📱 {conversation.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {conversation.messages.length} message{conversation.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {expandedUser === conversation.userId ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedUser === conversation.userId && (
                <div className="border-t border-border px-5 py-3 space-y-3 bg-muted/20">
                  {conversation.messages.map((msg) => (
                    <div key={msg.id} className="pb-3 border-b border-border last:border-b-0">
                      <div className="flex items-start justify-between gap-2 mb-3 pb-2 border-b border-border/50">
                        <div>
                          <div className="text-xs text-muted-foreground flex gap-2 mb-1">
                            <span>{new Date(msg.created_at).toLocaleString()}</span>
                            {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                          </div>
                          {msg.phone && (
                            <p className="text-xs text-muted-foreground">📱 {msg.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-muted">
                        <p className="text-xs text-muted-foreground mb-1">Client Message</p>
                        <p className="text-sm text-foreground font-medium">{msg.message}</p>
                      </div>

                      {/* Show replies for this message */}
                      {replies.filter((r) => r.message_id === msg.id).length > 0 && (
                        <div className="space-y-2 ml-4 border-l-2 border-primary/30 pl-4">
                          {replies
                            .filter((r) => r.message_id === msg.id)
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((reply) => (
                              <div key={reply.id}>
                                {reply.admin_id && !reply.client_id ? (
                                  // Admin Reply
                                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                                        <span className="text-xs font-bold">A</span>
                                      </div>
                                      <p className="text-xs font-medium text-primary">Admin Reply</p>
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {new Date(reply.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground">{reply.reply_message}</p>
                                  </div>
                                ) : reply.client_id && !reply.admin_id ? (
                                  // Client Reply
                                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent">
                                        <span className="text-xs font-bold text-white">C</span>
                                      </div>
                                      <p className="text-xs font-medium text-accent">Client Reply</p>
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {new Date(reply.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground">{reply.reply_message}</p>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {replyingToId === msg.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-20 text-xs"
                            disabled={sendingReply}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => sendReply(msg.id)}
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
                          onClick={() => setReplyingToId(msg.id)}
                          className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Reply
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-3 border-t border-border">
                    {conversation.unread > 0 && (
                      <button
                        onClick={() => markConversationRead(conversation.userId)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Mark Read</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteConversation(conversation.userId)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
