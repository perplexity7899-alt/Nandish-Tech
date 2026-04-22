import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus, Loader, Edit2, Trash2 } from "lucide-react";

interface SampleWork {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url: string;
  github_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function SampleWorksManager() {
  const [sampleWorks, setSampleWorks] = useState<SampleWork[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load sample works from Supabase
  useEffect(() => {
    loadSampleWorks();
  }, []);

  const loadSampleWorks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sample_works")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSampleWorks(data || []);
    } catch (error) {
      console.error("Error loading sample works:", error);
      toast.error("Failed to load sample works");
    } finally {
      setIsLoading(false);
    }
  }

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTechStack([]);
    setTechInput("");
    setLiveUrl("");
    setGithubUrl("");
    setEditingId(null);
  };

  const addSampleWork = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("sample_works")
          .update({
            title: title.trim(),
            description: description.trim(),
            tech_stack: techStack,
            live_url: liveUrl.trim() || null,
            github_url: githubUrl.trim() || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Sample work updated successfully!");
      } else {
        // Add new
        const { error } = await supabase
          .from("sample_works")
          .insert([{
            title: title.trim(),
            description: description.trim(),
            tech_stack: techStack,
            live_url: liveUrl.trim() || null,
            github_url: githubUrl.trim() || null,
            order_index: sampleWorks.length,
            is_active: true,
          }]);

        if (error) throw error;
        toast.success("Sample work added successfully!");
      }

      resetForm();
      await loadSampleWorks();
    } catch (error) {
      console.error("Error saving sample work:", error);
      toast.error("Failed to save sample work");
    } finally {
      setIsSaving(false);
    }
  };

  const editWork = (work: SampleWork) => {
    setTitle(work.title);
    setDescription(work.description || "");
    setTechStack(work.tech_stack || []);
    setLiveUrl(work.live_url || "");
    setGithubUrl(work.github_url || "");
    setEditingId(work.id);
  };

  const deleteWork = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sample_works")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Sample work deleted successfully!");
      await loadSampleWorks();
    } catch (error) {
      console.error("Error deleting sample work:", error);
      toast.error("Failed to delete sample work");
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">Sample Works (Free Projects)</h2>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Add/Edit Form */}
        <div className="border-b border-border pb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {editingId ? "Edit Sample Work" : "Add New Sample Work"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
              <Input
                placeholder="e.g., E-Commerce Platform"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
              <Textarea
                placeholder="Brief description of the sample work"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tech Stack</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., React, Node.js"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  disabled={isSaving}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                />
                <Button onClick={addTech} disabled={isSaving} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1">
                    {tech}
                    <button
                      onClick={() => removeTech(tech)}
                      disabled={isSaving}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Live URL</label>
                <Input
                  placeholder="https://example.com"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  disabled={isSaving}
                  type="url"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">GitHub URL</label>
                <Input
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={isSaving}
                  type="url"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addSampleWork} disabled={isSaving} className="flex-1">
                {editingId ? "Update" : "Add"} Sample Work
              </Button>
              {editingId && (
                <Button onClick={resetForm} disabled={isSaving} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sample Works List */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Sample Works ({sampleWorks.length})</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Loading sample works...</span>
            </div>
          ) : sampleWorks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sample works added yet</p>
          ) : (
            <div className="space-y-4">
              {sampleWorks.map((work, idx) => (
                <div key={work.id} className="p-4 bg-muted rounded-lg border border-border/50">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {idx + 1}. {work.title}
                      </p>
                      {work.description && (
                        <p className="text-xs text-muted-foreground mt-1">{work.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => editWork(work)}
                        disabled={isSaving}
                        size="sm"
                        variant="outline"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <button
                        onClick={() => deleteWork(work.id)}
                        disabled={isSaving}
                        className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {work.tech_stack && work.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {work.tech_stack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {(work.live_url || work.github_url) && (
                    <div className="flex gap-3 mt-3 text-xs">
                      {work.live_url && (
                        <a href={work.live_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Live Demo
                        </a>
                      )}
                      {work.github_url && (
                        <a href={work.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
          💡 Tip: These are free/demo projects to showcase your work. Changes are saved automatically. The first 3 will appear in the "Sample Works" card on the homepage.
        </p>
      </div>
    </div>
  );
}
