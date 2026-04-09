import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectImageCarouselProps {
  images?: string[];
  primaryImage: string;
  title: string;
}

export default function ProjectImageCarousel({
  images,
  primaryImage,
  title,
}: ProjectImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Always include primary image first, then carousel images
  const allImages = [
    primaryImage,
    ...(images?.filter((img) => img !== primaryImage) || []),
  ].filter((img) => img); // Filter out empty strings
  
  const hasMultipleImages = allImages.length > 1;

  // Auto-advance carousel every 1 second when not hovering
  useEffect(() => {
    if (!hasMultipleImages || isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, 1000); // Changed from 1000ms to be explicit

    return () => clearInterval(interval);
  }, [hasMultipleImages, isHovering, allImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  return (
    <div
      className="relative w-full bg-muted rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Container */}
      <div className="aspect-video relative overflow-hidden">
        {allImages[currentIndex] && (
          <img
            src={allImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        )}

        {/* Loading fallback */}
        {!allImages[currentIndex] && (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Loading image...</span>
          </div>
        )}
      </div>

      {/* Navigation Arrows - Only show on hover with multiple images */}
      {hasMultipleImages && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-8" : "bg-white/50"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Hover hint for carousel */}
      {hasMultipleImages && !isHovering && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-white text-xs">Hover to pause • Click to change</span>
        </div>
      )}
    </div>
  );
}
