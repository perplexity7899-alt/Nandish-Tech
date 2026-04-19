import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string[];
  technologies: string[];
  link?: string;
  featured?: boolean;
}

const portfolioProjects: PortfolioProject[] = [
  {
    id: "1",
    title: "Modern Landing Page",
    description: "High-converting landing page for SaaS products with animations and modern design.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    category: ["Landing Page", "SaaS"],
    technologies: ["React", "SaaS", "TypeScript"],
    link: "#",
    featured: true,
  },
  {
    id: "2",
    title: "Real Estate Portal",
    description: "Full-featured property listing platform with search, filters, and user dashboard.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    category: ["Web App", "Real Estate"],
    technologies: ["React", "Web App", "Real Estate", "Full Stack"],
    link: "#",
    featured: true,
  },
  {
    id: "3",
    title: "E-commerce Store",
    description: "Complete online store with cart, checkout, payment integration, and admin panel.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    category: ["E-commerce", "Stripe"],
    technologies: ["E-commerce", "Stripe", "Admin", "TypeScript"],
    link: "#",
    featured: true,
  },
  {
    id: "4",
    title: "Learning Management System",
    description: "Educational platform with courses, quizzes, progress tracking, and certificates.",
    image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?w=600&h=400&fit=crop",
    category: ["LMS", "Education"],
    technologies: ["LMS", "Education", "Dashboard"],
    link: "#",
    featured: true,
  },
  {
    id: "5",
    title: "Portfolio Website",
    description: "Stunning portfolio site for creatives with project galleries and contact forms.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    category: ["Portfolio", "Design"],
    technologies: ["Portfolio", "Design", "Responsive"],
    link: "#",
    featured: true,
  },
  {
    id: "6",
    title: "Admin Dashboard",
    description: "Comprehensive admin interface with analytics, charts, and data management.",
    image: "https://images.pexels.com/photos/3194521/pexels-photo-3194521.jpeg?w=600&h=400&fit=crop",
    category: ["Dashboard", "Analytics"],
    technologies: ["Dashboard", "Analytics", "Admin"],
    link: "#",
    featured: true,
  },
  {
    id: "7",
    title: "Dashboard Analytics",
    description: "Real-time analytics dashboard with charts, metrics, and data visualization.",
    image: "https://images.pexels.com/photos/3194521/pexels-photo-3194521.jpeg?w=600&h=400&fit=crop",
    category: ["Dashboard", "Analytics"],
    technologies: ["React", "Dashboard", "Analytics", "Data Visualization"],
    link: "#",
    featured: false,
  },
  {
    id: "8",
    title: "Project Management Tool",
    description: "Collaborative project management with tasks, teams, and real-time updates.",
    image: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?w=600&h=400&fit=crop",
    category: ["Web App", "Dashboard"],
    technologies: ["React", "Web App", "TypeScript", "Real-time"],
    link: "#",
    featured: false,
  },
  {
    id: "9",
    title: "Mobile Responsive Site",
    description: "Fully responsive website optimized for all devices with excellent performance.",
    image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?w=600&h=400&fit=crop",
    category: ["Responsive", "Design"],
    technologies: ["React", "Responsive", "Design", "Mobile"],
    link: "#",
    featured: false,
  },
  {
    id: "10",
    title: "SaaS Platform",
    description: "Complete SaaS solution with user authentication, billing, and feature management.",
    image: "https://images.pexels.com/photos/3194521/pexels-photo-3194521.jpeg?w=600&h=400&fit=crop",
    category: ["SaaS", "Web App"],
    technologies: ["SaaS", "React", "Full Stack", "Payment Processing"],
    link: "#",
    featured: false,
  },
];

const allCategories = [
  "All Projects",
  "Landing Page",
  "SaaS",
  "Web App",
  "Real Estate",
  "E-commerce",
  "Dashboard",
  "Analytics",
  "LMS",
  "Education",
  "Responsive",
  "Design",
];

export default function PortfolioGallery() {
  const [selectedCategory, setSelectedCategory] = useState("All Projects");

  const filteredProjects =
    selectedCategory === "All Projects"
      ? portfolioProjects
      : portfolioProjects.filter((project) =>
          project.category.includes(selectedCategory)
        );

  return (
    <section id="portfolio" className="section-padding bg-muted/30">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            My <span className="text-gradient">Portfolio</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Explore some of the projects I've delivered for clients across various industries
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No projects found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="glass-card overflow-hidden hover-lift group cursor-pointer transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {project.featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {project.description}
                  </p>

                  {/* Category Badges */}
                  <div className="flex flex-wrap gap-2">
                    {project.category.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
