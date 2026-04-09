import { Code2, Palette, Smartphone, Server, Database, Zap, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const categories = [
  {
    id: "data",
    name: "Data Science Projects",
    description: "ML, AI, data analysis and visualization projects",
    icon: Database,
    color: "text-indigo-500",
    badge: "Popular",
    bgColor: "bg-indigo-50",
  },
  {
    id: "web",
    name: "Web Development",
    description: "Full-stack, MERN, React and modern web projects",
    icon: Code2,
    color: "text-blue-500",
    badge: "Trending",
    bgColor: "bg-blue-50",
  },
  {
    id: "mobile",
    name: "Computer Science",
    description: "BCA, MCA, B.Tech and CS engineering projects",
    icon: Smartphone,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    id: "design",
    name: "Business Studies",
    description: "MBA, BBA, finance and management projects",
    icon: Palette,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: "backend",
    name: "Customized Projects",
    description: "Tailored solutions built to your exact requirements",
    icon: Server,
    color: "text-pink-500",
    badge: "New",
    bgColor: "bg-pink-50",
  },
];

export default function CategoriesSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Find Projects by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Browse our curated collection across every discipline
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`#projects`}
                className={`group glass-card p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${category.bgColor} hover:border-primary/50`}
              >
                {category.badge && (
                  <div className="mb-4">
                    <Badge className="bg-primary/90 text-primary-foreground text-xs font-semibold">
                      {category.badge}
                    </Badge>
                  </div>
                )}
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center ${category.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{category.description}</p>
                <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                  Browse projects
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}

          {/* View All Projects Featured Card */}
          <Link
            to={`#projects`}
            className="group glass-card p-8 bg-slate-900 text-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-center items-center text-center"
          >
            <div className="mb-4">
              <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">
              View All Projects
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Explore our full library of 200+ projects
            </p>
            <div className="flex items-center gap-2 text-orange-500 font-medium text-sm group-hover:gap-3 transition-all">
              See all
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
