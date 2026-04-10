import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ProjectDelivery {
  id: string;
  project_id: string;
  client_id: string;
  version: number;
  delivery_notes: string;
  code_updates: string;
  delivered_at: string;
  updated_at: string;
  project?: {
    title: string;
    description: string;
    image: string;
    tech_stack: string[];
    live_url: string;
    github_url: string;
  };
}

export function useClientDeliveries() {
  const { user } = useAuth();

  // Fetch client's project deliveries (only paid/unlocked projects)
  const {
    data: deliveries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["client-deliveries", user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("📦 Fetching client deliveries for user:", user.id);

      try {
        // Fetch all deliveries for the current user
        const { data, error } = await (supabase as any)
          .from("project_deliveries")
          .select("*, project:projects(*)")
          .eq("client_id", user.id)
          .order("delivered_at", { ascending: false });

        if (error) {
          console.error("❌ Error fetching deliveries:", error);
          throw error;
        }

        console.log("✅ Client deliveries fetched:", data);
        data?.forEach((d: any) => {
          console.log(`📍 Delivery ${d.id}: project=${d.project?.title || "NO TITLE"}`);
        });
        
        // Filter deliveries to show only paid projects (projects with is_paid=true)
        const paidDeliveries = (data || []).filter((delivery: any) => {
          const isPaid = delivery.project?.pricing?.is_paid;
          return isPaid === true || isPaid === undefined; // Show if explicitly paid or if no pricing info
        });

        console.log(`✅ Filtered ${paidDeliveries.length} paid deliveries from ${data?.length} total`);
        return paidDeliveries || [];
      } catch (err: any) {
        console.error("❌ Fetch error:", err.message);
        return [];
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
    throwOnError: false,
    enabled: !!user,
  });

  return {
    deliveries,
    isLoading,
    error,
    refetch,
  };
}
