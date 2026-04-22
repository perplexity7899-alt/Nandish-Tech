import { usePortfolio } from "@/context/PortfolioContext";
import heroBg from "@/assets/hero-bg.jpg";
import { Github, Linkedin, Twitter, ExternalLink, ArrowRight, X } from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: Github,
  Github: Github,
  LinkedIn: Linkedin,
  Linkedin: Linkedin,
  Twitter: Twitter,
  X: Twitter,
};

export default function HeroSection() {
  const { data } = usePortfolio();
  const { heading, subheading, ctaText, ctaLink } = data.hero;
  const socials = data.socials || [];
  const projects = data.projects || [];
  const [showMobileCard, setShowMobileCard] = useState(true);
  
  // Get first 3 projects as sample works
  const sampleWorks = projects.slice(0, 3);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-foreground/70" />

      <div className="relative z-10 section-container w-full">
        {/* Mobile Sample Works Card */}
        {sampleWorks.length > 0 && showMobileCard && (
          <div className="md:hidden mb-8 animate-fade-up px-4 sm:px-0">
            <div className="bg-card p-5 rounded-2xl border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Sample Works</h3>
                </div>
                <button
                  onClick={() => setShowMobileCard(false)}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {sampleWorks.map((project, idx) => (
                  <a
                    key={project.id}
                    href={project.liveUrl || "#projects"}
                    target={project.liveUrl ? "_blank" : undefined}
                    rel={project.liveUrl ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{project.techStack.slice(0, 2).join(", ")}</p>
                    </div>
                  </a>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all group"
                >
                  View All Projects
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side - Sample Works Card (Desktop) */}
          {sampleWorks.length > 0 && (
            <div className="hidden md:block col-span-5 animate-fade-up">
              <div className="bg-card/95 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-border/50 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Sample Works</h3>
                </div>
                
                <div className="space-y-4">
                  {sampleWorks.map((project, idx) => (
                    <a
                      key={project.id}
                      href={project.liveUrl || "#projects"}
                      target={project.liveUrl ? "_blank" : undefined}
                      rel={project.liveUrl ? "noopener noreferrer" : undefined}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-all duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.techStack.slice(0, 3).join(", ")}</p>
                      </div>
                    </a>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-border/50">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all group"
                  >
                    View All Projects
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Hero Content */}
          <div className={`col-span-1 ${sampleWorks.length > 0 ? "md:col-span-7" : "md:col-span-12"} animate-fade-up flex flex-col justify-center`}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              {heading}
            </h1>
            <p className="text-base sm:text-lg md:text-lg text-primary-foreground/70 mb-8 leading-relaxed max-w-xl">
              {subheading}
            </p>
            
            <div className="flex flex-col gap-6">
              <a
                href={ctaLink}
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm tracking-wide w-fit"
              >
                {ctaText}
              </a>

              {/* Social Links Card - Mobile */}
              {socials.length > 0 && (
                <div className="md:hidden bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/50 w-fit">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Connect</p>
                  <div className="flex gap-2">
                    {socials.map((social) => {
                      const Icon = iconMap[social.platform] || ExternalLink;
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-all duration-300 group hover:shadow-md"
                          title={social.platform}
                        >
                          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Links - Desktop */}
              {socials.length > 0 && (
                <div className="hidden md:flex gap-3">
                  {socials.map((social) => {
                    const Icon = iconMap[social.platform] || ExternalLink;
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-all duration-300 group hover:shadow-lg"
                        title={social.platform}
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
