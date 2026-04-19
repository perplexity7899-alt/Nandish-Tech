import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Send, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisteredUser {
  id: string;
  email: string;
  full_name: string;
}

interface AdminMessage {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminMailManager() {
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch all registered users from client_replies and profiles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["registered-users"],
    queryFn: async () => {
      const uniqueUsers = new Map<string, RegisteredUser>();

      // Fetch from client_replies table
      const { data: clientReplies, error: repliesError } = await (supabase as any)
        .from("client_replies")
        .select("client_name, client_email")
        .order("created_at", { ascending: false });

      if (repliesError) {
        console.error("Error fetching client_replies:", repliesError);
      }

      (clientReplies || []).forEach((reply: any) => {
        if (reply.client_email && !uniqueUsers.has(reply.client_email)) {
          uniqueUsers.set(reply.client_email, {
            id: reply.client_email,
            email: reply.client_email,
            full_name: reply.client_name || "Unknown",
          });
        }
      });

      // Fetch from profiles table (registered users)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email")
        .order("full_name", { ascending: true });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      (profiles || []).forEach((profile: any) => {
        const email = profile.email || "";
        if (email && !uniqueUsers.has(email)) {
          uniqueUsers.set(email, {
            id: profile.id || email,
            email: email,
            full_name: profile.full_name || "Unknown",
          });
        }
      });

      return Array.from(uniqueUsers.values()).sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );
    },
  });

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch sent messages for selected user
  const { data: sentMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["sent-messages", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      const { data, error } = await (supabase as any)
        .from("admin_messages")
        .select("*")
        .eq("recipient_email", selectedUser.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as AdminMessage[];
    },
    enabled: !!selectedUser,
  });

  const handleSendMessage = async () => {
    if (!selectedUser || !subject.trim() || !messageText.trim()) {
      toast.error("Please fill in all fields and select a user");
      return;
    }

    setIsSending(true);
    try {
      const adminUser = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from("admin_messages")
        .insert({
          user_id: null,
          recipient_email: selectedUser.email,
          subject: subject,
          message: messageText,
          admin_id: adminUser.data.user?.id,
          is_read: false,
        });

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      toast.success(`Message sent to ${selectedUser.full_name}!`);
      setSubject("");
      setMessageText("");
      refetchMessages();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(`Failed: ${error?.message || "Failed to send message"}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("admin_messages")
        .delete()
        .eq("id", messageId);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }

      toast.success("Message deleted!");
      refetchMessages();
    } catch (error: any) {
      console.error("Error deleting message:", error);
      toast.error(`Failed to delete: ${error?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Send Messages to Clients
        </h1>
        <p className="text-muted-foreground">
          Send direct messages to registered clients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Registered Users ({users.length})
            </h2>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {usersLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Compose Panel */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* Selected User Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {selectedUser.full_name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {selectedUser.email}
                </p>
              </div>

              {/* Compose Message */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  Compose Message
                </h3>
                
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Subject
                  </label>
                  <Input
                    placeholder="Message subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Message
                  </label>
                  <textarea
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !subject.trim() || !messageText.trim()}
                    className="flex-1 gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject("");
                      setMessageText("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Previous Messages */}
              {sentMessages.length > 0 && (
                <div className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground">
                    Message History
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {sentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-muted/50 rounded-lg p-4 border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">
                              {msg.subject}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleDateString(
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
                          <div className="flex items-center gap-2">
                            {msg.is_read && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                                Read
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg border-2 border-dashed border-border">
              <div className="text-center">
                <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Select a user to send a message
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
