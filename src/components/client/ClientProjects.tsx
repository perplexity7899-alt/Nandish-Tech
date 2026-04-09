import { useClientDeliveries } from "@/hooks/useClientDeliveries";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

export default function ClientProjects() {
  const { deliveries, isLoading } = useClientDeliveries();
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  // Auto-rotate images every 1.5 seconds for deliveries
  useEffect(() => {
    const initialized: Record<string, number> = {};
    deliveries.forEach((delivery) => {
      const images = delivery.project?.images || [];
      const primaryImage = delivery.project?.image || "";
      const allImages = [primaryImage, ...images].filter(Boolean);
      if (allImages.length > 1 && !currentImageIndex[delivery.id]) {
        initialized[delivery.id] = 0;
      }
    });
    if (Object.keys(initialized).length > 0) {
      setCurrentImageIndex((prev) => ({ ...prev, ...initialized }));
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const updated = { ...prev };
        deliveries.forEach((delivery) => {
          const images = delivery.project?.images || [];
          const primaryImage = delivery.project?.image || "";
          const allImages = [primaryImage, ...images].filter(Boolean);
          
          if (allImages.length > 1) {
            const current = prev[delivery.id] ?? 0;
            updated[delivery.id] = (current + 1) % allImages.length;
          }
        });
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [deliveries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No projects yet</p>
        <p className="text-sm text-muted-foreground/70">Check back later for updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Deliveries Section */}
      {deliveries.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Project Deliveries
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Code updates and deliveries from your projects
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {deliveries.map((delivery) => {
              const images = delivery.project?.images || [];
              const primaryImage = delivery.project?.image || "";
              const allImages = [primaryImage, ...images].filter(Boolean);
              const currentIndex = currentImageIndex[delivery.id] ?? 0;
              const displayImage = allImages[currentIndex] || primaryImage;

              return (
                <div
                  key={delivery.id}
                  className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Project Image - Compact */}
                  {displayImage && (
                    <div className="relative h-24 sm:h-32 bg-muted overflow-hidden">
                      <img
                        src={displayImage}
                        alt={delivery.project?.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Version Badge */}
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                        <Badge variant="secondary" className="text-xs font-semibold bg-primary/90 text-white">
                          v{delivery.version}
                        </Badge>
                      </div>
                      {/* Image Counter */}
                      {allImages.length > 1 && (
                        <div className="absolute bottom-1 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded text-center">
                          {currentIndex + 1}/{allImages.length}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content - Compact */}
                  <div className="p-3 sm:p-4 space-y-2">
                    {/* Title */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {delivery.project?.title || "Project"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {delivery.project?.description}
                      </p>
                    </div>

                    {/* Tech Stack - Minimal */}
                    {delivery.project?.tech_stack && delivery.project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {delivery.project.tech_stack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs px-2 py-0.5">
                            {tech}
                          </Badge>
                        ))}
                        {delivery.project.tech_stack.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{delivery.project.tech_stack.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Quick Info */}
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <p className="mb-2">
                        📦 {format(new Date(delivery.delivered_at), "MMM dd, yyyy")}
                      </p>

                      {/* Project Links - Compact */}
                      {(delivery.project?.live_url || delivery.project?.github_url) && (
                        <div className="flex gap-1">
                          {delivery.project.live_url && (
                            <a
                              href={delivery.project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-2 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-medium transition-colors text-center"
                            >
                              Live
                            </a>
                          )}
                          {delivery.project.github_url && (
                            <a
                              href={delivery.project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-2 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-medium transition-colors text-center"
                            >
                              Code
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
