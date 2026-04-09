import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Mail } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Reply } from "@/types/portfolio";

export default function ClientReplies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch client's messages - Less frequent polling (2s)
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
      return data || [];
    },
    enabled: !!user,
    staleTime: 1000, // Keep data fresh for 1 second
    gcTime: 5 * 60 * 1000, // 5 minute garbage collection
    refetchInterval: 2000, // Refetch every 2 seconds
    refetchIntervalInBackground: true,
    networkMode: "always",
  });

  // Fetch replies for client's messages - Less frequent polling (2s)
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

  // Memoized mapping of replies by message ID for performance
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

  const isLoading = messagesLoading || repliesLoading;
  const messagesWithReplies = messages.filter(
    (m) => repliesByMessageId.has(m.id) && repliesByMessageId.get(m.id)!.length > 0
  );
  const messagesAwaitingReply = messages.filter(
    (m) => !repliesByMessageId.has(m.id) || repliesByMessageId.get(m.id)!.length === 0
  );

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Conversations{" "}
        <span className="text-muted-foreground font-normal text-sm">
          ({messagesWithReplies.length})
        </span>
      </h2>

      {isLoading && messagesWithReplies.length === 0 ? (
        <p className="text-muted-foreground text-sm">Loading conversations...</p>
      ) : messagesWithReplies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No replied conversations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messagesWithReplies.map((message) => {
            const messageReplies = repliesByMessageId.get(message.id) || [];
            return (
              <div
                key={message.id}
                className="bg-card border border-border rounded-lg p-5 space-y-4"
              >
                {/* Original Message */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Your Message</p>
                  <p className="text-sm text-foreground">{message.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(message.created_at).toLocaleDateString()} ·{" "}
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>

                {/* Admin Replies */}
                {messageReplies.map((reply) => (
                  <div key={reply.id} className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-2">Admin Reply</p>
                    <p className="text-sm text-foreground">{reply.reply_message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(reply.created_at).toLocaleDateString()} ·{" "}
                      {new Date(reply.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}

          {messagesAwaitingReply.length > 0 && (
            <div className="bg-card border border-dashed border-border rounded-lg p-5 text-center text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {messagesAwaitingReply.length} message
                {messagesAwaitingReply.length !== 1 ? "s" : ""} awaiting admin reply
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
