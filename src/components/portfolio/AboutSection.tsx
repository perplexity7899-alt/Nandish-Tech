import { useAbout } from "@/hooks/useAbout";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";

export default function AboutSection() {
  const { aboutData, isLoading } = useAbout();
  const { bio, skills, tools } = aboutData;

  if (isLoading) {
    return (
      <section id="about" className="section-padding section-alt-bg">
        <div className="section-container flex items-center justify-center py-16">
          <Loader className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading about section...</span>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-padding section-alt-bg">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            About <span className="text-gradient">Me</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {bio || "Loading..."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="glass-card p-8 hover:shadow-lg transition-all duration-300">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(skills || []).map((s) => (
                <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div className="glass-card p-8 hover:shadow-lg transition-all duration-300">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Tools</h3>
            <div className="flex flex-wrap gap-2">
              {(tools || []).map((t) => (
                <Badge key={t} variant="secondary" className="bg-accent text-accent-foreground">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
