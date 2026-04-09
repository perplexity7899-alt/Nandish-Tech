import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Service } from "@/types/portfolio";

export function useServices() {
  const queryClient = useQueryClient();

  // Fetch all services
  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      console.log("📊 Fetching services from Supabase...");

      try {
        const { data, error } = await (supabase as any)
          .from("services")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("❌ Error fetching services:", error);
          throw error;
        }

        // Transform snake_case from database to camelCase
        const transformedServices = (data || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
        })) as Service[];

        console.log("✅ Services fetched:", transformedServices.length, transformedServices);
        return transformedServices;
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

  // Add service
  const addServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, "id">) => {
      console.log("📝 Adding service:", service);

      const { data, error } = await (supabase as any)
        .from("services")
        .insert({
          title: service.title,
          description: service.description,
          icon: service.icon,
        })
        .select();

      if (error) {
        console.error("❌ Error adding service:", error);
        throw new Error(error.message || "Failed to add service");
      }

      const newData = data?.[0];
      if (!newData) throw new Error("No data returned from insert");

      const transformedService: Service = {
        id: newData.id,
        title: newData.title,
        description: newData.description,
        icon: newData.icon,
      };

      console.log("✅ Service added:", transformedService);
      return transformedService;
    },
    onSuccess: (newService) => {
      toast.success("Service added successfully!");
      queryClient.setQueryData(["services"], (old: Service[] | undefined) => {
        return old ? [...old, newService] : [newService];
      });
    },
    onError: (error: any) => {
      console.error("🚨 Add error:", error);
      toast.error(error?.message || "Failed to add service");
    },
  });

  // Update service
  const updateServiceMutation = useMutation({
    mutationFn: async (service: Service) => {
      console.log("✏️ Updating service:", service);

      const { data, error } = await (supabase as any)
        .from("services")
        .update({
          title: service.title,
          description: service.description,
          icon: service.icon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id)
        .select();

      if (error) {
        console.error("❌ Error updating service:", error);
        throw error;
      }

      const updatedData = data?.[0];
      if (!updatedData) throw new Error("No data returned from update");

      const transformedService: Service = {
        id: updatedData.id,
        title: updatedData.title,
        description: updatedData.description,
        icon: updatedData.icon,
      };

      console.log("✅ Service updated:", transformedService);
      return transformedService;
    },
    onSuccess: (updatedService) => {
      toast.success("Service updated successfully!");
      queryClient.setQueryData(["services"], (old: Service[] | undefined) => {
        return old ? old.map(s => s.id === updatedService.id ? updatedService : s) : [updatedService];
      });
    },
    onError: (error: any) => {
      console.error("🚨 Update error:", error);
      toast.error(error?.message || "Failed to update service");
    },
  });

  // Delete service
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      console.log("🗑️ Deleting service:", serviceId);

      const { error } = await (supabase as any)
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) {
        console.error("❌ Error deleting service:", error);
        throw error;
      }

      console.log("✅ Service deleted");
    },
    onSuccess: (_, serviceId) => {
      toast.success("Service deleted successfully!");
      queryClient.setQueryData(["services"], (old: Service[] | undefined) => {
        return old ? old.filter(s => s.id !== serviceId) : [];
      });
    },
    onError: (error: any) => {
      console.error("🚨 Delete error:", error);
      toast.error(error?.message || "Failed to delete service");
    },
  });

  return {
    services,
    isLoading,
    error,
    refetch,
    addService: (service: Omit<Service, "id">) => addServiceMutation.mutateAsync(service),
    updateService: (service: Service) => updateServiceMutation.mutateAsync(service),
    deleteService: (id: string) => deleteServiceMutation.mutateAsync(id),
    isAddingService: addServiceMutation.isPending,
    isUpdatingService: updateServiceMutation.isPending,
    isDeletingService: deleteServiceMutation.isPending,
  };
}
