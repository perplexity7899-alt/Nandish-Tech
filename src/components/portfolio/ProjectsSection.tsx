import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Loader, Lock, Check } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkProjectAccess, initiatePayment } from "@/integrations/razorpay";
import { Button } from "@/components/ui/button";
import ProjectImageCarousel from "./ProjectImageCarousel";
import { toast } from "sonner";

export default function ProjectsSection() {
  const { projects, isLoading, error } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectAccess, setProjectAccess] = useState<Record<string, any>>({});
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);

  // Check access for all projects when user changes
  useEffect(() => {
    const fetchAccess = async () => {
      const accessMap: Record<string, any> = {};
      
      for (const project of projects) {
        if (user) {
          const access = await checkProjectAccess(user.id, project.id);
          accessMap[project.id] = access;
        } else {
          // No user logged in, set no access for paid projects
          accessMap[project.id] = { 
            hasAccess: false, 
            codeAccess: false, 
            liveAccess: false 
          };
        }
      }
      
      setProjectAccess(accessMap);
    };

    if (projects.length > 0) {
      fetchAccess();
    }
  }, [user, projects]);

  if (isLoading) {
    return (
      <section id="projects" className="section-padding">
        <div className="section-container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading projects...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="section-padding">
        <div className="section-container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <div className="text-center py-16 text-muted-foreground">
            <p>Error loading projects. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding">
      <div className="section-container">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Featured <span className="text-gradient">Projects</span>
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          A selection of recent work that showcases my expertise.
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No projects added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {projects.map((project) => {
              const access = projectAccess[project.id];
              const isPaid = project.pricing?.is_paid;

              return (
                <div key={project.id} className="glass-card overflow-hidden hover-lift group relative flex flex-col">
                  {/* Payment Status Badge - Positioned at top */}
                  <div className="absolute top-3 right-3 z-20">
                    {isPaid && access?.hasAccess ? (
                      <Badge className="bg-green-500 text-white border-green-600 shadow-lg">
                        <Check className="w-3 h-3 mr-1.5" /> Paid
                      </Badge>
                    ) : isPaid ? (
                      <Badge className="bg-orange-500 text-white border-orange-600 shadow-lg">
                        <Lock className="w-3 h-3 mr-1.5" /> Locked
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white border-blue-600 shadow-lg">
                        Free
                      </Badge>
                    )}
                  </div>

                  {/* Lock overlay removed - not needed */}

                  <ProjectImageCarousel
                    images={project.images}
                    primaryImage={project.image}
                    title={project.title}
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-display text-base font-semibold text-foreground flex-1 pr-2 line-clamp-1">{project.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs px-2 py-0.5">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    {/* Access controls */}
                    <div className="space-y-2 mb-0 pt-2 border-t border-border mt-auto">
                      {/* Paid project with access - show unlocked buttons */}
                      {isPaid && access?.hasAccess ? (
                        <div className="space-y-2">
                          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-2 mb-1">
                            <p className="text-xs text-green-800 dark:text-green-200 font-semibold text-center">
                              ✅ You have access to this project
                            </p>
                          </div>
                          {access.liveAccess && project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                            >
                              <ExternalLink size={16} /> View Live Demo
                            </a>
                          )}
                          {access.codeAccess && project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                            >
                              <Github size={16} /> View Source Code
                            </a>
                          )}
                        </div>
                      ) : isPaid ? (
                        // Paid project without access - show payment button
                        <div className="space-y-2">
                          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-2 mb-1">
                            <p className="text-xs text-orange-800 dark:text-orange-200 font-medium text-center">
                              🔒 Premium Content - Purchase to unlock
                            </p>
                          </div>
                          {user ? (
                            <Button
                              type="button"
                              onClick={() => {
                                setLoadingPayment(project.id);
                                initiatePayment({
                                  projectId: project.id,
                                  projectTitle: project.title,
                                  price: project.pricing?.price || 0,
                                  userEmail: user.email || "",
                                  userName: user.user_metadata?.full_name || "User",
                                  userId: user.id,
                                }).finally(() => setLoadingPayment(null));
                              }}
                              disabled={loadingPayment === project.id}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm disabled:opacity-50 cursor-pointer"
                            >
                              {loadingPayment === project.id ? (
                                <>
                                  <Loader className="w-4 h-4 mr-2 animate-spin inline" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  💳 Unlock for ₹{project.pricing?.price}
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => navigate('/register')}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                              🔓 Login to Unlock
                            </Button>
                          )}
                        </div>
                      ) : (
                        // Free project - show access buttons
                        <div className="space-y-2">
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-1">
                            <p className="text-xs text-blue-800 dark:text-blue-200 font-semibold text-center">
                              ⭐ Free Project - View Anytime
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                              >
                                <ExternalLink size={14} /> Live
                              </a>
                            )}
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                              >
                                <Github size={14} /> Code
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
