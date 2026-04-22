import { useState, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus, ExternalLink } from "lucide-react";
import type { SocialLink } from "@/types/portfolio";

export default function SocialsManager() {
  const { data } = usePortfolio();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [platformInput, setPlatformInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync with portfolio data
  useEffect(() => {
    if (data.socials) {
      setSocials(data.socials);
    }
  }, [data.socials]);

  const addSocial = () => {
    if (!platformInput.trim() || !urlInput.trim()) {
      toast.error("Please fill in both platform and URL");
      return;
    }

    // Check if platform already exists
    if (socials.some((s) => s.platform.toLowerCase() === platformInput.toLowerCase())) {
      toast.error("This platform already exists");
      return;
    }

    // Validate URL
    try {
      new URL(urlInput);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    const newSocial: SocialLink = {
      id: Date.now().toString(),
      platform: platformInput.trim(),
      url: urlInput.trim(),
    };

    setSocials([...socials, newSocial]);
    setPlatformInput("");
    setUrlInput("");
    toast.success("Social link added");
  };

  const removeSocial = (id: string) => {
    setSocials(socials.filter((s) => s.id !== id));
    toast.success("Social link removed");
  };

  const saveSocials = async () => {
    setIsSaving(true);
    try {
      // Update the portfolio data with new socials
      const updatedData = { ...data, socials };
      localStorage.setItem("portfolio_data", JSON.stringify(updatedData));
      
      // Notify other components of the change
      window.dispatchEvent(new StorageEvent("storage", {
        key: "portfolio_data",
        newValue: JSON.stringify(updatedData),
      }));

      toast.success("Social links updated successfully!");
    } catch (error) {
      console.error("Error saving socials:", error);
      toast.error("Failed to save social links");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">Social Links & Portfolio</h2>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Add New Social Link */}
        <div className="border-b border-border pb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Add New Social Link</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Platform Name</label>
              <Input
                placeholder="e.g., GitHub, LinkedIn, Twitter, Portfolio, etc."
                value={platformInput}
                onChange={(e) => setPlatformInput(e.target.value)}
                disabled={isSaving}
                onKeyDown={(e) => e.key === "Enter" && addSocial()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">URL</label>
              <Input
                placeholder="e.g., https://github.com/yourprofile"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isSaving}
                onKeyDown={(e) => e.key === "Enter" && addSocial()}
              />
            </div>
            <Button
              onClick={addSocial}
              disabled={isSaving}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" /> Add Social Link
            </Button>
          </div>
        </div>

        {/* Current Social Links */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Current Links ({socials.length})</h3>
          {socials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No social links added yet</p>
          ) : (
            <div className="space-y-3">
              {socials.map((social) => (
                <div
                  key={social.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{social.platform}</p>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate flex items-center gap-1"
                      >
                        {social.url}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSocial(social.id)}
                    disabled={isSaving}
                    className="p-1 hover:bg-destructive/10 rounded-md text-destructive transition-colors ml-2 flex-shrink-0"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={saveSocials}
          disabled={isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>

        <p className="text-xs text-muted-foreground">
          💡 Tip: These links will appear as icons in the hero section of your website. Supported platforms include GitHub, LinkedIn, Twitter, and any custom link.
        </p>
      </div>
    </div>
  );
}
