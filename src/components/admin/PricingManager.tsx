import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit2, Save, X, Loader2 } from "lucide-react";

export default function PricingManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Fetch projects with pricing
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects-pricing"],
    queryFn: async () => {
      const { data: projectsData, error: projectsError } = await (supabase as any)
        .from("projects")
        .select("*");
      
      if (projectsError) throw projectsError;

      // Get pricing for each project
      const { data: pricingData, error: pricingError } = await (supabase as any)
        .from("projects_pricing")
        .select("*");

      if (pricingError) throw pricingError;

      // Merge pricing with projects
      return projectsData.map((project: any) => ({
        ...project,
        pricing: pricingData?.find((p: any) => p.project_id === project.id) || null,
      }));
    },
  });

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setEditingData({
      [project.id]: {
        price: project.pricing?.price || 0,
        is_paid: project.pricing?.is_paid || false,
        code_access: project.pricing?.code_access || false,
        live_access: project.pricing?.live_access || false,
      },
    });
  };

  const handleSave = async (project: any) => {
    setSaving(true);
    const data = editingData[project.id];

    try {
      if (project.pricing) {
        // Update existing pricing
        const { error } = await (supabase as any)
          .from("projects_pricing")
          .update({
            price: data.price,
            is_paid: data.is_paid,
            code_access: data.code_access,
            live_access: data.live_access,
          })
          .eq("id", project.pricing.id);

        if (error) throw error;
      } else {
        // Create new pricing
        const { error } = await (supabase as any)
          .from("projects_pricing")
          .insert({
            project_id: project.id,
            price: data.price,
            is_paid: data.is_paid,
            code_access: data.code_access,
            live_access: data.live_access,
          });

        if (error) throw error;
      }

      toast.success("Pricing updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects-pricing"] });
      setEditingId(null);
    } catch (error: any) {
      toast.error("Failed to update pricing: " + error.message);
    } finally {
      setSaving(false);
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
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Project Pricing</h3>
        <p className="text-sm text-muted-foreground">Manage pricing and access for each project</p>
      </div>

      <div className="space-y-4">
        {projects.map((project: any) => (
          <div key={project.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-foreground">{project.title}</h4>
                <p className="text-sm text-muted-foreground">{project.id}</p>
              </div>
              {editingId === project.id ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSave(project)}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(project)}
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>

            {editingId === project.id ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Is Paid Project?
                  </label>
                  <select
                    value={editingData[project.id]?.is_paid ? "true" : "false"}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        [project.id]: {
                          ...editingData[project.id],
                          is_paid: e.target.value === "true",
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="false">Free</option>
                    <option value="true">Paid</option>
                  </select>
                </div>

                {editingData[project.id]?.is_paid && (
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={editingData[project.id]?.price}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          [project.id]: {
                            ...editingData[project.id],
                            price: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="Enter price"
                      className="bg-background/50"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Access Permissions:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingData[project.id]?.code_access}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          [project.id]: {
                            ...editingData[project.id],
                            code_access: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-foreground">Code Access</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingData[project.id]?.live_access}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          [project.id]: {
                            ...editingData[project.id],
                            live_access: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-foreground">Live Access</label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-medium">Status:</span>{" "}
                  {project.pricing?.is_paid ? (
                    <span className="text-green-600">Paid - ₹{project.pricing.price}</span>
                  ) : (
                    <span className="text-blue-600">Free</span>
                  )}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Access:</span>{" "}
                  {project.pricing ? (
                    <>
                      {project.pricing.code_access && <span className="text-green-600">Code ✓ </span>}
                      {project.pricing.live_access && <span className="text-green-600">Live ✓</span>}
                    </>
                  ) : (
                    "Not configured"
                  )}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
