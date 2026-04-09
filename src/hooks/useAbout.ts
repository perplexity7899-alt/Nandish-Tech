import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AboutData } from "@/types/portfolio";

export function useAbout() {
  const queryClient = useQueryClient();

  // Fetch about data
  const {
    data: aboutData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      console.log("📊 Fetching about data from Supabase...");

      try {
        const { data, error } = await (supabase as any)
          .from("about")
          .select("*")
          .single(); // Expect single row

        if (error) {
          // If no data exists, return default empty about
          if (error.code === "PGRST116") {
            console.log("ℹ️ No about data found, using defaults");
            return {
              bio: "",
              skills: [],
              tools: [],
            } as AboutData;
          }
          console.error("❌ Error fetching about:", error);
          throw error;
        }

        // Transform snake_case from database to camelCase
        const about: AboutData = {
          bio: data.bio || "",
          skills: data.skills || [],
          tools: data.tools || [],
        };

        console.log("✅ About data fetched:", about);
        return about;
      } catch (err: any) {
        console.error("❌ Fetch error:", err.message);
        throw err;
      }
    },
    staleTime: 60000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
    throwOnError: false,
  });

  // Update about
  const updateAboutMutation = useMutation({
    mutationFn: async (about: AboutData) => {
      console.log("✏️ Updating about:", about);

      try {
        // Try to update existing record
        const { data, error } = await (supabase as any)
          .from("about")
          .update({
            bio: about.bio,
            skills: about.skills,
            tools: about.tools,
            updated_at: new Date().toISOString(),
          })
          .not("id", "is", null) // Update first record
          .select()
          .single();

        if (error) {
          // If no record exists, create one
          if (error.code === "PGRST116") {
            console.log("Creating new about record...");
            const { data: newData, error: insertError } = await (supabase as any)
              .from("about")
              .insert({
                bio: about.bio,
                skills: about.skills,
                tools: about.tools,
              })
              .select()
              .single();

            if (insertError) {
              console.error("❌ Error inserting about:", insertError);
              throw insertError;
            }

            return newData;
          }

          console.error("❌ Error updating about:", error);
          throw error;
        }

        console.log("✅ About updated:", data);
        return data;
      } catch (err: any) {
        console.error("❌ Update error:", err.message);
        throw err;
      }
    },
    onSuccess: (updatedData) => {
      toast.success("About section updated!");

      // Transform and update cache
      const transformedAbout: AboutData = {
        bio: updatedData.bio || "",
        skills: updatedData.skills || [],
        tools: updatedData.tools || [],
      };

      queryClient.setQueryData(["about"], transformedAbout);
    },
    onError: (error: any) => {
      console.error("🚨 Update error:", error);
      toast.error(error?.message || "Failed to update about section");
    },
  });

  return {
    aboutData: aboutData || {
      bio: "",
      skills: [],
      tools: [],
    },
    isLoading,
    error,
    refetch,
    updateAbout: (about: AboutData) => updateAboutMutation.mutateAsync(about),
    isUpdatingAbout: updateAboutMutation.isPending,
  };
}
