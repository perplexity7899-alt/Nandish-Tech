import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Check, ExternalLink, Github, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { checkProjectAccess, initiatePayment } from "@/integrations/razorpay";
import { toast } from "sonner";
import ProjectImageCarousel from "@/components/portfolio/ProjectImageCarousel";

export default function ClientProjectsCatalog() {
  const { projects, isLoading: projectsLoading } = useProjects();
  const { user } = useAuth();
  const [projectAccess, setProjectAccess] = useState<Record<string, any>>({});
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);

  // Check access for all projects when user changes
  useEffect(() => {
    const fetchAccess = async () => {
      if (!user) return;
      
      const accessMap: Record<string, any> = {};
      for (const project of projects) {
        const access = await checkProjectAccess(user.id, project.id);
        accessMap[project.id] = access;
      }
      setProjectAccess(accessMap);
    };

    if (projects.length > 0) {
      fetchAccess();
    }
  }, [user, projects]);

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <p className="text-lg text-muted-foreground font-medium">No Projects Available</p>
        <p className="text-sm text-muted-foreground/70 mt-2">Check back later for new projects!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Available <span className="text-gradient">Projects</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse and purchase access to premium projects. Free projects are instantly accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const access = projectAccess[project.id];
          const isPaid = project.pricing?.is_paid;
          const price = project.pricing?.price || 0;

          return (
            <div
              key={project.id}
              className="glass-card overflow-hidden hover-lift group relative flex flex-col h-full"
            >
              {/* Payment Status Badge */}
              <div className="absolute top-3 right-3 z-20">
                {isPaid ? (
                  <>
                    {access?.hasAccess ? (
                      <Badge className="bg-green-500/20 text-green-700 border-green-200 flex items-center gap-1 text-xs px-2 py-0.5">
                        <Check className="w-3 h-3" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/20 text-orange-700 border-orange-200 flex items-center gap-1 text-xs px-2 py-0.5">
                        <Lock className="w-3 h-3" />
                        Premium
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                    Free Access
                  </Badge>
                )}
              </div>

              {/* Project Image */}
              <div className="relative w-full h-40 overflow-hidden bg-muted">
                <ProjectImageCarousel
                  images={project.images || []}
                  primaryImage={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-3 flex flex-col">
                {/* Title and Description */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {project.description}
                  </p>
                </div>

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs px-2 py-0.5">
                        {tech}
                      </Badge>
                    ))}
                    {project.techStack.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        +{project.techStack.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="flex-1" />

                {/* Action Buttons */}
                <div className="space-y-2 border-t border-border pt-3">
                  {/* Links Row */}
                  <div className="flex gap-1.5">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (isPaid && !access?.liveAccess) {
                            e.preventDefault();
                            toast.error("Unlock this project to view the live demo");
                          }
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all inline-flex items-center justify-center gap-1 ${
                          access?.liveAccess || !isPaid
                            ? "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-lg cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden sm:inline">Demo</span>
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (isPaid && !access?.codeAccess) {
                            e.preventDefault();
                            toast.error("Unlock this project to view the source code");
                          }
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all inline-flex items-center justify-center gap-1 ${
                          access?.codeAccess || !isPaid
                            ? "bg-accent/10 text-accent hover:bg-accent/20 hover:shadow-lg cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                      >
                        <Github className="w-3 h-3" />
                        <span className="hidden sm:inline">Code</span>
                      </a>
                    )}
                  </div>

                  {/* Purchase Button */}
                  {isPaid && !access?.hasAccess && (
                    <Button
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to purchase projects");
                          return;
                        }
                        setLoadingPayment(project.id);
                        initiatePayment({
                          projectId: project.id,
                          projectTitle: project.title,
                          price: price,
                          userEmail: user.email || "",
                          userName: user.user_metadata?.full_name || "User",
                          userId: user.id,
                        }).finally(() => setLoadingPayment(null));
                      }}
                      disabled={loadingPayment === project.id}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 rounded-lg text-sm transition-all hover:shadow-lg"
                    >
                      {loadingPayment === project.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />
                          Processing...
                        </>
                      ) : (
                        `Unlock - ₹${price}`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
