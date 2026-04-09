import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Image, Loader } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@/types/portfolio";

export default function ProjectsManager() {
  const {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    isAddingProject,
    isUpdatingProject,
    isDeletingProject,
  } = useProjects();
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);

  const empty: Project = { 
    id: "", 
    title: "", 
    description: "", 
    image: "", 
    images: [], 
    techStack: [], 
    liveUrl: "", 
    githubUrl: "" 
  };

  const openNew = () => { 
    try {
      const newId = crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}-${Math.random()}`;
      console.log("🆕 Opening new project form with ID:", newId);
      setEditing({ ...empty, id: newId }); 
      setIsNew(true);
      console.log("📝 Editing state set to:", { ...empty, id: newId });
    } catch (error) {
      console.error("❌ Error creating new project:", error);
    }
  };
  const openEdit = (p: Project) => { 
    setEditing({ ...p }); 
    setIsNew(false); 
  };
  const close = () => { 
    setEditing(null); 
    setIsNew(false); 
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) { 
      toast.error("Title is required"); 
      return; 
    }
    
    if (!editing.description.trim()) {
      toast.error("Description is required");
      return;
    }
    
    if (!editing.image.trim()) {
      toast.error("Primary image URL is required");
      return;
    }

    if (!editing.techStack || editing.techStack.length === 0) {
      toast.error("Tech stack is required");
      return;
    }

    // Validate that at least primary image exists
    const validImages = editing.images?.filter((img) => img.trim() !== "") || [];
    if (validImages.length === 0 && !editing.image.trim()) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      if (isNew) {
        const { id, ...projectData } = editing;
        await addProject(projectData);
      } else {
        await updateProject(editing);
      }
      close();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Check console for details.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const addImageUrl = () => {
    if (!editing) return;
    const newImages = [...(editing.images || []), ""];
    setEditing({ ...editing, images: newImages });
  };

  const updateImageUrl = (index: number, url: string) => {
    if (!editing) return;
    const newImages = [...(editing.images || [])];
    newImages[index] = url;
    setEditing({ ...editing, images: newImages });
  };

  const removeImageUrl = (index: number) => {
    if (!editing) return;
    const newImages = editing.images?.filter((_, i) => i !== index) || [];
    setEditing({ ...editing, images: newImages });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground w-full sm:w-auto">Projects (Database)</h2>
        <Button 
          size="sm" 
          onClick={() => {
            console.log("🔵 Add Project button clicked!");
            console.log("Current states - isAdding:", isAddingProject, "isUpdating:", isUpdatingProject, "isDeleting:", isDeletingProject);
            openNew();
          }}
          disabled={isAddingProject || isUpdatingProject || isDeletingProject}
          className="whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Project
        </Button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6 space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{isNew ? "New Project" : "Edit Project"}</h3>
            <button onClick={close} disabled={isNew ? isAddingProject : isUpdatingProject}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input 
              placeholder="Project title" 
              value={editing.title} 
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              disabled={isNew ? isAddingProject : isUpdatingProject}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea 
              placeholder="Project description" 
              value={editing.description} 
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              disabled={isNew ? isAddingProject : isUpdatingProject}
              rows={4}
            />
          </div>
          {/* Primary Image */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Primary Image (Featured) <span className="text-destructive">*</span>
            </label>
            <Input 
              placeholder="https://example.com/image.jpg" 
              value={editing.image} 
              onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              disabled={isNew ? isAddingProject : isUpdatingProject}
            />
            {editing.image && (
              <img src={editing.image} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
            )}
          </div>

          {/* Multiple Images for Carousel */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-foreground">Project Images (Carousel)</label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addImageUrl}
                disabled={isNew ? isAddingProject : isUpdatingProject}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Image
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Add 2 or more images to enable carousel (auto-slides every second, pauses on hover)</p>
            
            {editing.images && editing.images.length > 0 ? (
              <div className="space-y-3">
                {editing.images.map((img, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-medium text-muted-foreground">Image {idx + 1}</span>
                      {img && (
                        <button
                          onClick={() => removeImageUrl(idx)}
                          className="ml-auto p-1 hover:bg-destructive/10 rounded transition-colors"
                          disabled={isNew ? isAddingProject : isUpdatingProject}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder={`Image URL ${idx + 1}`}
                      value={img}
                      onChange={(e) => updateImageUrl(idx, e.target.value)}
                      disabled={isNew ? isAddingProject : isUpdatingProject}
                    />
                    {img && (
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No carousel images yet</p>
            )}
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tech Stack <span className="text-destructive">*</span>
            </label>
            <Input 
              placeholder="React, Node.js, TypeScript, Tailwind CSS" 
              value={editing.techStack.join(", ")} 
              onChange={(e) => setEditing({ ...editing, techStack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              disabled={isNew ? isAddingProject : isUpdatingProject}
            />
            <p className="text-xs text-muted-foreground">Enter technologies separated by commas</p>
          </div>

          {/* Live URL and GitHub URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Live URL</label>
              <Input 
                placeholder="https://example.com" 
                value={editing.liveUrl} 
                onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                disabled={isNew ? isAddingProject : isUpdatingProject}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">GitHub URL</label>
              <Input 
                placeholder="https://github.com/username/repo" 
                value={editing.githubUrl} 
                onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })}
                disabled={isNew ? isAddingProject : isUpdatingProject}
              />
            </div>
          </div>
          <Button 
            onClick={save}
            disabled={isNew ? isAddingProject : isUpdatingProject}
            className="w-full"
          >
            {(isNew ? isAddingProject : isUpdatingProject) && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {isNew ? "Add" : "Save Changes"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading projects from database...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-4">
                {p.image && <img src={p.image} alt={p.title} className="w-16 h-12 object-cover rounded" />}
                <div>
                  <p className="font-medium text-foreground text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.techStack.join(" · ")}</p>
                  {p.images && p.images.length > 0 && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <Image className="w-3 h-3" /> {p.images.length} carousel image{p.images.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEdit(p)} 
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  disabled={isDeletingProject}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => handleDelete(p.id)} 
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isDeletingProject}
                >
                  {isDeletingProject ? (
                    <Loader className="w-4 h-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-destructive" />
                  )}
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No projects yet. Add your first one!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
