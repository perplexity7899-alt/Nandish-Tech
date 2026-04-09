import { useState, useEffect } from "react";
import { useServices } from "@/hooks/useServices";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Service } from "@/types/portfolio";

export default function ServicesManager() {
  const { services, isAddingService, isUpdatingService, isDeletingService, addService, updateService, deleteService } = useServices();
  const [editing, setEditing] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", icon: "Code" });

  useEffect(() => {
    if (editing) {
      setFormData({ title: editing.title, description: editing.description, icon: editing.icon });
    }
  }, [editing]);

  const openNew = () => { setEditing({ id: "", title: "", description: "", icon: "Code" }); setIsNew(true); };
  const openEdit = (s: Service) => { setEditing(s); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };

  const save = async () => {
    if (!formData.title.trim()) { throw new Error("Title is required"); }
    try {
      if (isNew) {
        await addService(formData);
      } else if (editing) {
        await updateService({ ...editing, ...formData });
      }
      close();
    } catch (error) {
      console.error("❌ Save error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Services</h2>
        <Button size="sm" onClick={openNew} disabled={isAddingService || isUpdatingService || isDeletingService}>
          <Plus className="w-4 h-4 mr-1" /> Add Service
        </Button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">{isNew ? "New Service" : "Edit Service"}</h3>
            <button onClick={close} disabled={isUpdatingService || isAddingService}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <Input 
            placeholder="Title" 
            value={formData.title}
            disabled={isUpdatingService || isAddingService}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
          />
          <Textarea 
            placeholder="Description" 
            value={formData.description}
            disabled={isUpdatingService || isAddingService}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
          />
          <Input 
            placeholder="Icon name (Code, Palette, Server, MessageSquare)" 
            value={formData.icon}
            disabled={isUpdatingService || isAddingService}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })} 
          />
          <Button 
            onClick={save} 
            disabled={isUpdatingService || isAddingService}
            className="w-full"
          >
            {isNew ? "Add Service" : "Save Changes"}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <div>
              <p className="font-medium text-foreground text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openEdit(s)} 
                disabled={isDeletingService || isUpdatingService || isAddingService}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button 
                onClick={() => deleteService(s.id)}
                disabled={isDeletingService || isUpdatingService || isAddingService}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
