import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  liveLink?: string;
  githubLink?: string;
  featured?: boolean;
  year?: string;
}

const portfolioProjects: PortfolioProject[] = [
  {
    id: "1",
    title: "Modern Landing Page",
    description: "High-converting landing page for SaaS products with animations and modern design.",
    image: "https://images.unsplash.com/photo-1460925895917-adf4e565f900?w=500&h=300&fit=crop",
    category: "Landing Page",
    tags: ["Landing Page", "SaaS", "React"],
    liveLink: "#",
    githubLink: "#",
    featured: true,
    year: "2024",
  },
  {
    id: "2",
    title: "Real Estate Portal",
    description: "Full-featured property listing platform with search, filters, and user dashboard.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop",
    category: "Real Estate",
    tags: ["Web App", "Real Estate", "Full Stack"],
    liveLink: "#",
    githubLink: "#",
    featured: true,
    year: "2024",
  },
  {
    id: "3",
    title: "E-commerce Store",
    description: "Complete online store with cart, checkout, payment integration, and admin panel.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=300&fit=crop",
    category: "E-commerce",
    tags: ["E-commerce", "Stripe", "Admin"],
    liveLink: "#",
    githubLink: "#",
    featured: true,
    year: "2024",
  },
  {
    id: "4",
    title: "Analytics Dashboard",
    description: "Real-time analytics dashboard with charts, metrics, and data visualization.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=300&fit=crop",
    category: "Dashboard",
    tags: ["Dashboard", "Analytics", "React"],
    liveLink: "#",
    githubLink: "#",
    featured: false,
    year: "2023",
  },
  {
    id: "5",
    title: "Learning Management System",
    description: "Complete LMS platform with courses, students management, and progress tracking.",
    image: "https://images.unsplash.com/photo-1516534775068-bb57b6439066?w=500&h=300&fit=crop",
    category: "LMS",
    tags: ["LMS", "Education", "Full Stack"],
    liveLink: "#",
    githubLink: "#",
    featured: false,
    year: "2023",
  },
  {
    id: "6",
    title: "Healthcare App",
    description: "Mobile-responsive healthcare application for patient management and appointments.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop",
    category: "Web App",
    tags: ["Web App", "Healthcare", "Responsive"],
    liveLink: "#",
    githubLink: "#",
    featured: false,
    year: "2023",
  },
  {
    id: "7",
    title: "SaaS Platform",
    description: "Enterprise SaaS platform with user authentication, billing, and team management.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    category: "SaaS",
    tags: ["SaaS", "React", "Node.js"],
    liveLink: "#",
    githubLink: "#",
    featured: false,
    year: "2023",
  },
  {
    id: "8",
    title: "Portfolio Website",
    description: "Personal portfolio website with projects showcase, blog, and contact form.",
    image: "https://images.unsplash.com/photo-1522542550221-31bfe34a2369?w=500&h=300&fit=crop",
    category: "Portfolio",
    tags: ["Portfolio", "React", "Design"],
    liveLink: "#",
    githubLink: "#",
    featured: false,
    year: "2023",
  },
  {
    id: "9",
    title: "Social Media App",
    description: "Social networking platform with posts, comments, likes, and real-time notifications.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop",
    category: "Web App",
    tags: ["Web App", "Social", "Real-time"],
    liveLink: "#",
    githubLink: "#",
    featured: false,
    year: "2023",
  },
];

const categories = [
  "All Projects",
  "Landing Page",
  "SaaS",
  "React",
  "Web App",
  "Real Estate",
  "Full Stack",
  "E-commerce",
  "Stripe",
  "Admin",
  "Dashboard",
  "Analytics",
  "LMS",
  "Education",
  "Healthcare",
  "Node.js",
  "Portfolio",
  "Real-time",
];

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [filteredProjects, setFilteredProjects] = useState(portfolioProjects);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === "All Projects") {
      setFilteredProjects(portfolioProjects);
    } else {
      setFilteredProjects(
        portfolioProjects.filter(
          (project) =>
            project.category === category || project.tags.includes(category)
        )
      );
    }
  };

  const featuredProjects = portfolioProjects.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section - Add padding-top for fixed navbar */}
      <section className="section-padding pt-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="section-container text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            My <span className="text-gradient">Portfolio</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore some of the projects I've delivered for clients across various industries
          </p>
        </div>

        {/* Categories Filter */}
        <div className="section-container">
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.slice(0, 15).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {selectedCategory === "All Projects" && (
        <section className="section-padding">
          <div className="section-container">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Highlighted work that represents my best efforts
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="glass-card overflow-hidden hover-lift group"
                >
                  <div className="relative overflow-hidden h-48 bg-muted">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-muted/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {project.liveLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live
                          </a>
                        </Button>
                      )}
                      {project.githubLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-12" />
          </div>
        </section>
      )}

      {/* All Projects Grid */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {selectedCategory === "All Projects"
              ? "All Projects"
              : `${selectedCategory} Projects`}
          </h2>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No projects found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="glass-card overflow-hidden hover-lift group"
                >
                  <div className="relative overflow-hidden h-48 bg-muted">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {project.title}
                      </h3>
                      {project.year && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {project.year}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-muted/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-muted/50"
                        >
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {project.liveLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live
                          </a>
                        </Button>
                      )}
                      {project.githubLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-b from-background to-primary/5">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {portfolioProjects.length}+
              </div>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {featuredProjects.length}+
              </div>
              <p className="text-muted-foreground">Featured Projects</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                50+
              </div>
              <p className="text-muted-foreground">Happy Clients</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                5+
              </div>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
