import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientMessage {
  id: string;
  subject: string;
  message: string;
  admin_id: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

export default function ClientMailDisplay() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Get current user's email
  useEffect(() => {
    const getEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getEmail();
  }, []);

  // Fetch messages for current user
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ["client-messages", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];

      const { data, error } = await (supabase as any)
        .from("admin_messages")
        .select("*")
        .eq("recipient_email", userEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ClientMessage[];
    },
    enabled: !!userEmail,
  });

  // Mark message as read
  const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
    if (isRead) return; // Already read

    try {
      const { error } = await (supabase as any)
        .from("admin_messages")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("admin_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase
      .channel(`admin_messages:${userEmail}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_messages",
          filter: `recipient_email=eq.${userEmail}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userEmail, refetch]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Messages from Admin
          </h1>
        </div>
        <p className="text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
          {unreadCount > 0 && (
            <span className="ml-2 inline-block px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs font-semibold rounded-full">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading messages...</div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-muted/50 rounded-lg border-2 border-dashed border-border">
          <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-center">
            No messages yet. The admin will send you messages here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`border-2 rounded-lg transition-all ${
                expandedId === message.id
                  ? "border-primary bg-primary/5"
                  : `border-border ${
                      !message.is_read
                        ? "bg-blue-50 dark:bg-blue-950/20"
                        : "bg-background"
                    }`
              }`}
            >
              <button
                onClick={() => {
                  setExpandedId(expandedId === message.id ? null : message.id);
                  handleMarkAsRead(message.id, message.is_read);
                }}
                className="w-full p-4 text-left hover:bg-accent/50 transition-colors rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {message.subject}
                      </h3>
                      {!message.is_read && (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {message.is_read && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded flex-shrink-0">
                      Read
                    </span>
                  )}
                </div>
              </button>

              {expandedId === message.id && (
                <div className="border-t border-border px-4 py-4 bg-muted/30">
                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="text-foreground whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>

                  {message.read_at && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Read on{" "}
                      {new Date(message.read_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteMessage(message.id)
                      }
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
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
