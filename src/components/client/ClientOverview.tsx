import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, Clock, Package } from "lucide-react";
import { useEffect } from "react";

export default function ClientOverview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["client-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 300,
    refetchIntervalInBackground: true,
    networkMode: "always",
  });

  // Fetch deliveries count
  const { data: deliveries = [] } = useQuery({
    queryKey: ["client-deliveries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_deliveries")
        .select("*")
        .eq("client_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Force refetch on interval
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      queryClient.refetchQueries({ queryKey: ["client-messages", user.id] });
    }, 500);

    return () => clearInterval(interval);
  }, [user?.id, queryClient]);

  const stats = [
    { label: "Total Messages", value: messages.length, icon: MessageSquare, color: "text-primary" },
    { label: "Read by Admin", value: messages.filter((m) => m.read).length, icon: Send, color: "text-primary" },
    { label: "Pending", value: messages.filter((m) => !m.read).length, icon: Clock, color: messages.filter((m) => !m.read).length > 0 ? "text-destructive" : "text-primary" },
    { label: "Deliveries", value: deliveries.length, icon: Package, color: deliveries.length > 0 ? "text-accent" : "text-primary" },
  ];

  return (
    <div>
      <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-2">
        Welcome, {user?.user_metadata?.full_name || "Client"}!
      </h2>
      <p className="text-muted-foreground text-xs sm:text-sm mb-6">Here's a summary of your activity.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
