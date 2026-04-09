import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Check, ExternalLink, FileText, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { checkProjectAccess, initiatePayment } from "@/integrations/razorpay";
import { toast } from "sonner";

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
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No projects available yet</p>
        <p className="text-sm text-muted-foreground/70">Check back later for new projects!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Available Projects
        </h3>
        <p className="text-sm text-muted-foreground">
          Browse and purchase access to all available projects. Free projects are instantly accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => {
          const access = projectAccess[project.id];
          const isPaid = project.pricing?.is_paid;
          const price = project.pricing?.price || 0;

          return (
            <div
              key={project.id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 space-y-3">
                {/* Header with title and status badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isPaid ? (
                      <>
                        {access?.hasAccess ? (
                          <Badge className="bg-green-500/20 text-green-700 border-green-200 flex items-center gap-1 whitespace-nowrap">
                            <Check className="w-3 h-3" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/20 text-orange-700 border-orange-200 flex items-center gap-1 whitespace-nowrap">
                            <Lock className="w-3 h-3" />
                            Paid
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 whitespace-nowrap">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs px-2 py-0.5">
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

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  {/* Links */}
                  <div className="flex gap-2">
                    {/* Live Link - Show if free or has access with liveAccess permission */}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                          access?.liveAccess || !isPaid
                            ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                        onClick={(e) => {
                          if (isPaid && !access?.liveAccess) {
                            e.preventDefault();
                            toast.info("Unlock this project to view live demo");
                          }
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Live
                      </a>
                    )}

                    {/* Code Link - Show if free or has access with codeAccess permission */}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                          access?.codeAccess || !isPaid
                            ? "bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                        onClick={(e) => {
                          if (isPaid && !access?.codeAccess) {
                            e.preventDefault();
                            toast.info("Unlock this project to view source code");
                          }
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        Code
                      </a>
                    )}
                  </div>

                  {/* Purchase Button */}
                  {isPaid && !access?.hasAccess ? (
                    <Button
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to purchase");
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
                      className="h-auto py-1.5 px-3 text-xs bg-green-600 hover:bg-green-700 shrink-0"
                    >
                      {loadingPayment === project.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />
                          Processing...
                        </>
                      ) : (
                        `₹${price}`
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
