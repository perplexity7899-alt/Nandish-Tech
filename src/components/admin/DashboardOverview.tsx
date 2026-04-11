import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Wrench, MessageSquare, Eye, Package, Send, CheckCircle, XCircle } from "lucide-react";

export default function DashboardOverview() {
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch project deliveries count
  const { data: deliveries = [] } = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_deliveries")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch project purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_purchases")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const unread = messages.filter((m) => !m.read).length;
  const approvedPurchases = purchases.filter((p) => p.payment_status === "approved").length;
  const rejectedPurchases = purchases.filter((p) => p.payment_status === "rejected").length;

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderOpen, color: "text-primary" },
    { label: "Services", value: services.length, icon: Wrench, color: "text-primary" },
    { label: "Messages", value: messages.length, icon: MessageSquare, color: "text-primary" },
    { label: "Unread", value: unread, icon: Eye, color: unread > 0 ? "text-destructive" : "text-primary" },
    { label: "Deliveries", value: deliveries.length, icon: Package, color: deliveries.length > 0 ? "text-accent" : "text-primary" },
    { label: "Approved Purchases", value: approvedPurchases, icon: CheckCircle, color: "text-green-600" },
    { label: "Rejected Purchases", value: rejectedPurchases, icon: XCircle, color: rejectedPurchases > 0 ? "text-destructive" : "text-primary" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">Dashboard</h2>
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
