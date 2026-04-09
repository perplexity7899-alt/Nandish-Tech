import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Send, Loader2, Edit2, X } from "lucide-react";
import { toast } from "sonner";

interface DeliveryRecord {
  id: string;
  project_id: string;
  client_id: string;
  version: number;
  delivery_notes: string;
  code_updates: string;
  delivered_at: string;
  client_email?: string;
  client_name?: string;
  project_title?: string;
}

export default function DeliverProjects() {
  const { projects } = useProjects();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [codeUpdates, setCodeUpdates] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editCode, setEditCode] = useState("");

  // Fetch all clients from RPC function (joins with auth.users for email fallback)
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["all-clients-list"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .rpc("get_all_clients");
        
        if (error) {
          console.error("❌ Error fetching clients from RPC:", error);
          // Fallback to profiles table query
          const fallback = await (supabase as any)
            .from("profiles")
            .select("id, user_id, full_name, email, created_at, updated_at")
            .order("created_at", { ascending: false });
          
          if (fallback.error) throw fallback.error;
          return fallback.data || [];
        }
        
        console.log("✅ Clients fetched from RPC:", data);
        return data || [];
      } catch (err) {
        console.error("❌ Error fetching clients:", err);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Fetch delivery history for selected client
  const { data: deliveryHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ["delivery-history", selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];

      const { data, error } = await (supabase as any)
        .from("project_deliveries")
        .select("*")
        .eq("client_id", selectedClient)
        .order("delivered_at", { ascending: false });

      if (error) throw error;
      return (data || []) as DeliveryRecord[];
    },
    enabled: !!selectedClient,
  });

  const handleDeliver = async () => {
    if (!selectedClient || !selectedProject) {
      toast.error("Please select client and project");
      return;
    }

    if (!deliveryNotes.trim() || !codeUpdates.trim()) {
      toast.error("Please add delivery notes and code updates");
      return;
    }

    setIsDelivering(true);
    try {
      // Get existing deliveries for this client-project combo to increment version
      const existingCount = deliveryHistory.filter(
        d => d.project_id === selectedProject && d.client_id === selectedClient
      ).length;

      const { error } = await (supabase as any)
        .from("project_deliveries")
        .insert({
          project_id: selectedProject,
          client_id: selectedClient,
          version: existingCount + 1,
          delivery_notes: deliveryNotes,
          code_updates: codeUpdates,
          delivered_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Project delivered successfully!");
      setDeliveryNotes("");
      setCodeUpdates("");
      setSelectedProject("");
      refetchHistory();
    } catch (error: any) {
      console.error("❌ Delivery error:", error);
      toast.error(error?.message || "Failed to deliver project");
    } finally {
      setIsDelivering(false);
    }
  };

  const handleUpdateDelivery = async (id: string) => {
    if (!editNotes.trim() || !editCode.trim()) {
      toast.error("Please add notes and code updates");
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("project_deliveries")
        .update({
          delivery_notes: editNotes,
          code_updates: editCode,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Delivery updated successfully!");
      setEditingId(null);
      setEditNotes("");
      setEditCode("");
      refetchHistory();
    } catch (error: any) {
      console.error("❌ Update error:", error);
      toast.error(error?.message || "Failed to update delivery");
    }
  };

  const getProjectTitle = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.title || "Project";
  };

  const getClientInfo = (clientId: string) => {
    const client = clients.find((c: any) => c.user_id === clientId);
    const email = client?.email?.trim() || client?.email || "No email found";
    const name = client?.full_name?.trim() || client?.full_name || "Unknown";
    
    console.log("📧 Client Info for", clientId, "->", { name, email, client });
    
    return {
      name,
      email,
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Deliver Projects</h2>
        <p className="text-muted-foreground">
          Assign projects to clients and track code updates
        </p>
      </div>

      {/* Client Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> Select Client
        </h3>

        {isLoadingClients ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading clients...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No clients found</p>
          </div>
        ) : (
          <>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Choose a client to deliver projects to" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.full_name || c.email || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedClient && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {getClientInfo(selectedClient).name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getClientInfo(selectedClient).email}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delivery Form */}
      {selectedClient && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5" /> Deliver New Project
          </h3>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Select Project</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Delivery Notes</label>
            <Textarea
              placeholder="Describe what's included in this delivery, features, bug fixes, etc..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Code Updates</label>
            <Textarea
              placeholder="List all code changes, new files, modifications, etc. This will update the original project code..."
              value={codeUpdates}
              onChange={(e) => setCodeUpdates(e.target.value)}
              className="min-h-32 font-mono text-xs"
            />
          </div>

          <Button onClick={handleDeliver} disabled={isDelivering} className="w-full">
            {isDelivering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Delivering...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Deliver to Client
              </>
            )}
          </Button>
        </div>
      )}

      {/* Delivery History */}
      {selectedClient && deliveryHistory.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Delivery History for {getClientInfo(selectedClient).name}
          </h3>

          <div className="space-y-4">
            {deliveryHistory.map((delivery) => (
              <div key={delivery.id} className="border border-border rounded-lg p-4">
                {editingId === delivery.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Delivery Notes
                      </label>
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="min-h-20"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Code Updates
                      </label>
                      <Textarea
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="min-h-28 font-mono text-xs"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateDelivery(delivery.id)}
                        className="flex-1"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {getProjectTitle(delivery.project_id)} - v{delivery.version}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(delivery.delivered_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingId(delivery.id);
                          setEditNotes(delivery.delivery_notes);
                          setEditCode(delivery.code_updates);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Delivery Notes
                      </p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {delivery.delivery_notes}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Code Updates
                      </p>
                      <div className="bg-muted rounded p-2 max-h-32 overflow-y-auto">
                        <p className="text-xs font-mono text-foreground whitespace-pre-wrap break-words line-clamp-4">
                          {delivery.code_updates}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedClient && deliveryHistory.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No deliveries for this client yet</p>
        </div>
      )}
    </div>
  );
}
