import { useState, useEffect } from "react";
import { useAbout } from "@/hooks/useAbout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Loader } from "lucide-react";

export default function AboutManager() {
  const { aboutData, isLoading, updateAbout, isUpdatingAbout } = useAbout();
  const [bio, setBio] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [toolInput, setToolInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);

  // Sync with aboutData when it loads
  useEffect(() => {
    if (aboutData) {
      setBio(aboutData.bio || "");
      setSkills(aboutData.skills || []);
      setTools(aboutData.tools || []);
    }
  }, [aboutData]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const addTool = () => {
    if (toolInput.trim() && !tools.includes(toolInput.trim())) {
      setTools([...tools, toolInput.trim()]);
      setToolInput("");
    }
  };

  const save = async () => {
    try {
      await updateAbout({ bio, skills, tools });
    } catch (error) {
      console.error("Error saving about:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading about data...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">About Section</h2>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
          <Textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            rows={4}
            disabled={isUpdatingAbout}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Skills</label>
          <div className="flex gap-2 mb-2">
            <Input 
              value={skillInput} 
              onChange={(e) => setSkillInput(e.target.value)} 
              placeholder="Add skill" 
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              disabled={isUpdatingAbout}
            />
            <Button 
              variant="secondary" 
              onClick={addSkill}
              disabled={isUpdatingAbout}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1">
                {s}
                <button 
                  onClick={() => setSkills(skills.filter((x) => x !== s))}
                  disabled={isUpdatingAbout}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Tools</label>
          <div className="flex gap-2 mb-2">
            <Input 
              value={toolInput} 
              onChange={(e) => setToolInput(e.target.value)} 
              placeholder="Add tool" 
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTool())}
              disabled={isUpdatingAbout}
            />
            <Button 
              variant="secondary" 
              onClick={addTool}
              disabled={isUpdatingAbout}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">
                {t}
                <button 
                  onClick={() => setTools(tools.filter((x) => x !== t))}
                  disabled={isUpdatingAbout}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={save}
          disabled={isUpdatingAbout}
        >
          {isUpdatingAbout && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          {isUpdatingAbout ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
