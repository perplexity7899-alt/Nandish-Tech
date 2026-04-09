import { useServices } from "@/hooks/useServices";
import { Code, Palette, Server, MessageSquare, Loader2, ArrowRight } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Palette,
  Server,
  MessageSquare,
};

const colorMap: Record<string, { text: string; bg: string }> = {
  Code: { text: "text-blue-500", bg: "bg-blue-50" },
  Palette: { text: "text-purple-500", bg: "bg-purple-50" },
  Server: { text: "text-orange-500", bg: "bg-orange-50" },
  MessageSquare: { text: "text-pink-500", bg: "bg-pink-50" },
};

export default function ServicesSection() {
  const { services, isLoading } = useServices();

  if (isLoading) {
    return (
      <section id="services" className="section-padding">
        <div className="section-container flex items-center justify-center min-h-72">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-padding">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            My <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            How I can help bring your ideas to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Code;
            const colors = colorMap[service.icon] || colorMap["Code"];
            return (
              <div 
                key={service.id} 
                className={`group glass-card p-8 hover:shadow-lg transition-all duration-300 cursor-pointer ${colors.bg} hover:border-primary/50`}
              >
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-lg bg-white/50 flex items-center justify-center ${colors.text}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                  Learn more
                  <span className="transition-transform group-hover:translate-x-1"><ArrowRight className="w-4 h-4" /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
