import { useClientDeliveries } from "@/hooks/useClientDeliveries";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

export default function ClientDeliveries() {
  const { deliveries, isLoading } = useClientDeliveries();
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  // Auto-rotate images every 1.5 seconds
  useEffect(() => {
    // Initialize current image index for each delivery
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
            console.log(`🔄 Rotating ${delivery.id}: ${current} -> ${updated[delivery.id]} (total: ${allImages.length})`);
          }
        });
        return updated;
      });
    }, 1500); // Change image every 1.5 seconds

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
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No project deliveries yet</p>
        <p className="text-sm text-muted-foreground/70">Check back for code updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Project Deliveries</h2>
        <p className="text-muted-foreground">
          Code updates and deliveries from your projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {deliveries.map((delivery) => {
          const images = delivery.project?.images || [];
          const primaryImage = delivery.project?.image || "";
          const allImages = [primaryImage, ...images].filter(Boolean);
          const currentIndex = currentImageIndex[delivery.id] || 0;
          const displayImage = allImages[currentIndex] || primaryImage;

          return (
            <div
              key={delivery.id}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Project Image - Increased Height */}
              {displayImage && (
                <div className="relative h-56 bg-muted overflow-hidden">
                  <img
                    src={displayImage}
                    alt={delivery.project?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Version Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      v{delivery.version}
                    </Badge>
                  </div>
                  {/* Image Counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {currentIndex + 1}/{allImages.length}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {delivery.project?.title || "Project"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {delivery.project?.description}
                  </p>
                </div>

                {/* Tech Stack */}
                {delivery.project?.tech_stack && delivery.project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {delivery.project.tech_stack.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {delivery.project.tech_stack.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{delivery.project.tech_stack.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Delivery Notes Preview */}
                {delivery.delivery_notes && (
                  <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Delivery Notes</p>
                    <p className="text-xs text-foreground line-clamp-2">
                      {delivery.delivery_notes}
                    </p>
                  </div>
                )}

                {/* Code Updates Preview */}
                {delivery.code_updates && (
                  <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Code Updates</p>
                    <p className="text-xs text-foreground font-mono line-clamp-2">
                      {delivery.code_updates}
                    </p>
                  </div>
                )}

                {/* Footer with date and links */}
                <div className="pt-3 border-t border-border space-y-3">
                  <p className="text-xs text-muted-foreground">
                    📦 Delivered: {format(new Date(delivery.delivered_at), "MMM dd, yyyy")}
                  </p>

                  {/* Project Links */}
                  {(delivery.project?.live_url || delivery.project?.github_url) && (
                    <div className="flex gap-2">
                      {delivery.project.live_url && (
                        <a
                          href={delivery.project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Live
                        </a>
                      )}
                      {delivery.project.github_url && (
                        <a
                          href={delivery.project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
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
  );
}
