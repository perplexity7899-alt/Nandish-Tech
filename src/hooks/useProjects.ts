import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Project } from "@/types/portfolio";

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch all projects
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("📊 Fetching projects from Supabase...");
      
      try {
        const { data, error } = await (supabase as any)
          .from("projects")
          .select("*, projects_pricing(*)")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Error fetching projects:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        // Transform snake_case from database to camelCase for TypeScript
        const projects = (data || []).map((p: any) => {
          const pricingData = Array.isArray(p.projects_pricing) 
            ? p.projects_pricing[0] 
            : p.projects_pricing;
          
          return {
            id: p.id,
            title: p.title,
            description: p.description,
            image: p.image,
            images: p.images || [],
            techStack: p.tech_stack || [],
            liveUrl: p.live_url || "",
            githubUrl: p.github_url || "",
            pricing: pricingData ? {
              id: pricingData.id,
              projectId: pricingData.project_id,
              price: pricingData.price,
              currency: pricingData.currency,
              is_paid: pricingData.is_paid,
              code_access: pricingData.code_access,
              live_access: pricingData.live_access,
            } : undefined,
          };
        }) as Project[];

        console.log("✅ Projects fetched:", projects.length, projects);
        console.log("📦 Pricing data sample:", projects[0]?.pricing);
        return projects;
      } catch (err: any) {
        console.error("❌ Fetch error:", err.message);
        throw err;
      }
    },
    staleTime: 60000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
    throwOnError: false, // Don't throw - let the component handle empty state
  });

  // Add project
  const addProjectMutation = useMutation({
    mutationFn: async (project: Omit<Project, "id">) => {
      console.log("📝 Adding project:", project);
      
      // Check authentication and role
      const { data: { user } } = await supabase.auth.getUser();
      console.log("🔐 Current user:", user?.id, "Email:", user?.email);
      
      if (!user) {
        throw new Error("You must be logged in to add projects");
      }
      
      // Check if user is admin
      try {
        const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin"
        });
        console.log("👤 Is Admin:", isAdmin, "Error:", roleError);
      } catch (err) {
        console.log("⚠️ Could not check admin role:", err);
      }
      
      // Filter out empty image URLs
      const filteredImages = (project.images || []).filter((img) => img.trim() !== "");
      
      const { data, error } = await (supabase as any)
        .from("projects")
        .insert({
          title: project.title,
          description: project.description,
          image: project.image,
          images: filteredImages.length > 0 ? filteredImages : [],
          tech_stack: project.techStack.filter((tech) => tech.trim() !== ""),
          live_url: project.liveUrl,
          github_url: project.githubUrl,
        })
        .select();

      if (error) {
        console.error("❌ Error adding project:", error);
        console.error("Error code:", error.code);
        console.error("Error details:", error.details);
        console.error("Error message:", error.message);
        throw new Error(error.message || "Failed to add project");
      }

      // Transform snake_case from database to camelCase
      const newData = data?.[0];
      if (!newData) throw new Error("No data returned from insert");
      
      const transformedProject: Project = {
        id: newData.id,
        title: newData.title,
        description: newData.description,
        image: newData.image,
        images: newData.images || [],
        techStack: newData.tech_stack || [],
        liveUrl: newData.live_url || "",
        githubUrl: newData.github_url || "",
      };

      console.log("✅ Project added:", transformedProject);
      return transformedProject;
    },
    onSuccess: (newProject) => {
      toast.success("Project added successfully!");
      // Update cache with new project
      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        return old ? [newProject, ...old] : [newProject];
      });
    },
    onError: (error: any) => {
      console.error("🚨 Mutation error:", error);
      toast.error(error?.message || "Failed to add project");
    },
  });

  // Update project
  const updateProjectMutation = useMutation({
    mutationFn: async (project: Project) => {
      console.log("✏️ Updating project:", project);
      
      // Filter out empty image URLs
      const filteredImages = (project.images || []).filter((img) => img.trim() !== "");
      
      const { data, error } = await (supabase as any)
        .from("projects")
        .update({
          title: project.title,
          description: project.description,
          image: project.image,
          images: filteredImages.length > 0 ? filteredImages : [],
          tech_stack: project.techStack.filter((tech) => tech.trim() !== ""),
          live_url: project.liveUrl,
          github_url: project.githubUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)
        .select();

      if (error) {
        console.error("❌ Error updating project:", error);
        throw error;
      }

      // Transform snake_case from database to camelCase
      const updatedData = data?.[0];
      if (!updatedData) throw new Error("No data returned from update");
      
      const transformedProject: Project = {
        id: updatedData.id,
        title: updatedData.title,
        description: updatedData.description,
        image: updatedData.image,
        images: updatedData.images || [],
        techStack: updatedData.tech_stack || [],
        liveUrl: updatedData.live_url || "",
        githubUrl: updatedData.github_url || "",
      };

      console.log("✅ Project updated:", transformedProject);
      return transformedProject;
    },
    onSuccess: (updatedProject) => {
      toast.success("Project updated successfully!");
      // Update cache with modified project
      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        return old ? old.map(p => p.id === updatedProject.id ? updatedProject : p) : [updatedProject];
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update project");
    },
  });

  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      console.log("🗑️ Deleting project:", projectId);
      const { error } = await (supabase as any)
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("❌ Error deleting project:", error);
        throw error;
      }

      console.log("✅ Project deleted");
    },
    onSuccess: (_, projectId) => {
      toast.success("Project deleted successfully!");
      // Remove deleted project from cache
      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        return old ? old.filter(p => p.id !== projectId) : [];
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete project");
    },
  });

  return {
    projects,
    isLoading,
    error,
    refetch,
    addProject: (project: Omit<Project, "id">) => addProjectMutation.mutateAsync(project),
    updateProject: (project: Project) => updateProjectMutation.mutateAsync(project),
    deleteProject: (id: string) => deleteProjectMutation.mutateAsync(id),
    isAddingProject: addProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  };
}
