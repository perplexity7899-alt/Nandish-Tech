import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignProjectParams {
  project_id: string;
  client_id: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

interface UpdateProjectStatusParams {
  client_project_id: string;
  status: "in_progress" | "completed" | "pending" | "on_hold";
  notes?: string;
  end_date?: string;
}

export function useAdminClientProjects() {
  const queryClient = useQueryClient();

  // Assign project to client
  const assignProjectMutation = useMutation({
    mutationFn: async (params: AssignProjectParams) => {
      console.log("📝 Assigning project to client:", params);

      const { data, error } = await (supabase as any)
        .from("client_projects")
        .insert({
          project_id: params.project_id,
          client_id: params.client_id,
          description: params.description,
          start_date: params.start_date,
          end_date: params.end_date,
          notes: params.notes,
          status: "in_progress",
        })
        .select();

      if (error) {
        console.error("❌ Error assigning project:", error);
        throw new Error(error.message || "Failed to assign project");
      }

      console.log("✅ Project assigned:", data?.[0]);
      return data?.[0];
    },
    onSuccess: () => {
      toast.success("Project assigned to client!");
      queryClient.invalidateQueries({ queryKey: ["client-projects"] });
    },
    onError: (error: any) => {
      console.error("🚨 Assignment error:", error);
      toast.error(error?.message || "Failed to assign project");
    },
  });

  // Update project status
  const updateStatusMutation = useMutation({
    mutationFn: async (params: UpdateProjectStatusParams) => {
      console.log("✏️ Updating project status:", params);

      const { data, error } = await (supabase as any)
        .from("client_projects")
        .update({
          status: params.status,
          notes: params.notes,
          end_date: params.end_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.client_project_id)
        .select();

      if (error) {
        console.error("❌ Error updating status:", error);
        throw error;
      }

      console.log("✅ Status updated:", data?.[0]);
      return data?.[0];
    },
    onSuccess: () => {
      toast.success("Project status updated!");
      queryClient.invalidateQueries({ queryKey: ["client-projects"] });
    },
    onError: (error: any) => {
      console.error("🚨 Update error:", error);
      toast.error(error?.message || "Failed to update status");
    },
  });

  return {
    assignProject: (params: AssignProjectParams) => assignProjectMutation.mutateAsync(params),
    updateStatus: (params: UpdateProjectStatusParams) => updateStatusMutation.mutateAsync(params),
    isAssigning: assignProjectMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
