import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ClientMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ["client-messages", user?.id],
    queryFn: async () => {
      console.log("Fetching messages for user:", user?.id);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Messages fetched from DB:", data);
      return data || [];
    },
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 300,
    refetchIntervalInBackground: true,
    networkMode: "always",
  });

  // Force refetch on interval to ensure UI updates
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      console.log("Force refetching messages...");
      queryClient.refetchQueries({ queryKey: ["client-messages", user.id] });
    }, 500);

    return () => clearInterval(interval);
  }, [user?.id, queryClient]);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        My Messages <span className="text-muted-foreground font-normal text-sm">({messages.length})</span>
      </h2>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">You haven't sent any messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/80">{m.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(m.created_at).toLocaleDateString()} · {new Date(m.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="shrink-0">
                  {m.read ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <CheckCircle className="w-3.5 h-3.5" /> Read
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
