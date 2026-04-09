import { CheckCircle, Zap, Truck, Award } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Quality Assured",
    description: "All projects are thoroughly tested and documented",
  },
  {
    icon: Zap,
    title: "24/7 Support",
    description: "Round-the-clock expert support whenever you need help",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Get your project instantly upon purchase",
  }
];

export default function FeaturesSection() {
  return (
    <section className="section-padding section-alt-bg">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Why Choose <span className="text-gradient">Us</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Delivering excellence across every project dimension
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass-card p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
