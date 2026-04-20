import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit2, Save, X, Loader2, Plus, Trash2, Check } from "lucide-react";

interface ServiceOffer {
  id: string;
  title: string;
  description: string;
  price: string;
  price_unit: string;
  features: string[];
  icon: string;
  popular: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ServiceOfferManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingData, setEditingData] = useState<Partial<ServiceOffer>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");

  // Fetch service offers
  const { data: serviceOffers = [], isLoading } = useQuery({
    queryKey: ["serviceoffers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicesoffer")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ServiceOffer[];
    },
  });

  const handleEdit = (service: ServiceOffer) => {
    setEditingId(service.id);
    setEditingData({ ...service });
    setIsCreatingNew(false);
  };

  const handleNewService = () => {
    setEditingId(null);
    setIsCreatingNew(true);
    setEditingData({
      title: "",
      description: "",
      price: "",
      price_unit: "onwards",
      features: [],
      icon: "Code2",
      popular: false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreatingNew(false);
    setEditingData({});
    setNewFeature("");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setEditingData({
        ...editingData,
        features: [...(editingData.features || []), newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setEditingData({
      ...editingData,
      features: (editingData.features || []).filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!editingData.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editingData.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!editingData.price?.trim()) {
      toast.error("Price is required");
      return;
    }

    setSaving(true);

    try {
      if (isCreatingNew) {
        const { error } = await supabase.from("servicesoffer").insert({
          title: editingData.title,
          description: editingData.description,
          price: editingData.price,
          price_unit: editingData.price_unit || "onwards",
          features: editingData.features || [],
          icon: editingData.icon || "Code2",
          popular: editingData.popular || false,
        });

        if (error) throw error;
        toast.success("Service offer created successfully");
      } else if (editingId) {
        const { error } = await supabase
          .from("servicesoffer")
          .update({
            title: editingData.title,
            description: editingData.description,
            price: editingData.price,
            price_unit: editingData.price_unit || "onwards",
            features: editingData.features || [],
            icon: editingData.icon || "Code2",
            popular: editingData.popular || false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Service offer updated successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["serviceoffers"] });
      handleCancel();
    } catch (error: any) {
      toast.error("Error saving service offer: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service offer?")) {
      setDeleting(id);
      try {
        const { error } = await supabase
          .from("servicesoffer")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Service offer deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["serviceoffers"] });
      } catch (error: any) {
        toast.error("Error deleting service offer: " + error.message);
      } finally {
        setDeleting(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Services I Offer</h2>
        <Button
          size="sm"
          onClick={handleNewService}
          disabled={editingId !== null || isCreatingNew || saving || deleting !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Edit/Create Form */}
      {(editingId || isCreatingNew) && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">
              {isCreatingNew ? "New Service Offer" : "Edit Service Offer"}
            </h3>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Service Title *
              </label>
              <Input
                placeholder="e.g., Website Development"
                value={editingData.title || ""}
                onChange={(e) =>
                  setEditingData({ ...editingData, title: e.target.value })
                }
                disabled={saving}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Price *
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 25,000"
                  value={editingData.price || ""}
                  onChange={(e) =>
                    setEditingData({ ...editingData, price: e.target.value })
                  }
                  disabled={saving}
                  className="flex-1"
                />
                <Input
                  placeholder="onwards"
                  value={editingData.price_unit || ""}
                  onChange={(e) =>
                    setEditingData({
                      ...editingData,
                      price_unit: e.target.value,
                    })
                  }
                  disabled={saving}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Description *
            </label>
            <Textarea
              placeholder="Describe this service offer..."
              value={editingData.description || ""}
              onChange={(e) =>
                setEditingData({ ...editingData, description: e.target.value })
              }
              disabled={saving}
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Icon Name
              </label>
              <Input
                placeholder="e.g., Code2, Rocket, Zap"
                value={editingData.icon || ""}
                onChange={(e) =>
                  setEditingData({ ...editingData, icon: e.target.value })
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingData.popular || false}
                  onChange={(e) =>
                    setEditingData({
                      ...editingData,
                      popular: e.target.checked,
                    })
                  }
                  disabled={saving}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-foreground">
                  Mark as Popular
                </span>
              </label>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Features
            </label>
            <div className="space-y-2 mb-3">
              {(editingData.features || []).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted p-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                  <button
                    onClick={() => removeFeature(index)}
                    disabled={saving}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                disabled={saving}
              />
              <Button
                onClick={addFeature}
                disabled={saving || !newFeature.trim()}
                size="sm"
                variant="outline"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreatingNew ? "Create Service" : "Save Changes"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceOffers.map((service) => (
          <div
            key={service.id}
            className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{service.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹{service.price} {service.price_unit}
                </p>
              </div>
              {service.popular && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>

            <div className="text-xs text-muted-foreground">
              Features: {service.features?.length || 0}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleEdit(service)}
                disabled={deleting !== null || saving || editingId !== null}
                className="flex-1 px-3 py-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                disabled={deleting !== null || saving || editingId !== null}
                className="flex-1 px-3 py-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting === service.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {serviceOffers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No service offers yet</p>
          <Button
            onClick={handleNewService}
            className="mt-4"
            variant="outline"
          >
            Create your first service offer
          </Button>
        </div>
      )}
    </div>
  );
}
