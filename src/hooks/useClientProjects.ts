import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface ClientProject {
  id: string;
  project_id: string;
  client_id: string;
  status: "in_progress" | "completed" | "pending" | "on_hold";
  description: string;
  start_date: string;
  end_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  project?: {
    title: string;
    description: string;
    image: string;
    tech_stack: string[];
  };
}

export function useClientProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch client's assigned projects
  const {
    data: clientProjects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["client-projects", user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("📊 Fetching client projects...");

      try {
        const { data, error } = await (supabase as any)
          .from("client_projects")
          .select("*, project:projects(*)")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Error fetching client projects:", error);
          throw error;
        }

        console.log("✅ Client projects fetched:", data);
        return data || [];
      } catch (err: any) {
        console.error("❌ Fetch error:", err.message);
        throw err;
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
    throwOnError: false,
    enabled: !!user,
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return {
    clientProjects,
    isLoading,
    error,
    refetch,
    getStatusColor,
  };
}
