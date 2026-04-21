import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ServiceContactForm from "./ServiceContactForm";
import { getIconComponent } from "@/lib/utils";

interface PricingService {
  id: string;
  title: string;
  description: string;
  price: string;
  price_unit: string;
  features: string[];
  icon: string;
  popular: boolean;
}

export default function PricingServicesSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PricingService | null>(null);
  const [services, setServices] = useState<PricingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("servicesoffer")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        // Fallback to empty array - admin can add services
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleGetStarted = (service: PricingService) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Services I <span className="text-gradient">Offer</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional web development and digital solutions tailored to your business needs
          </p>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <div
                  key={service.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl flex flex-col h-full ${
                    service.popular
                      ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-primary text-primary-foreground font-medium rounded-full">
                        Popular
                      </Badge>
                    </div>
                  )}

                  {/* Icon Container */}
                  <div className="pt-6 px-8">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                      service.popular
                        ? "bg-primary/20"
                        : "bg-muted"
                    }`}>
                      {IconComponent ? (
                        <IconComponent className="w-12 h-12 text-primary" />
                      ) : null}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-8 pb-8 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-6 flex-grow">
                      {service.description}
                    </p>

                    {/* Pricing */}
                    <div className="mb-6 pb-6 border-b border-border/50">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">₹{service.price}</span>
                        <span className="text-muted-foreground text-sm">{service.price_unit}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            service.popular
                              ? "bg-green-500/20"
                              : "bg-green-500/10"
                          }`}>
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-foreground leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleGetStarted(service)}
                      className={`w-full font-medium py-2 rounded-lg transition-all ${
                        service.popular
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
                          : "bg-muted hover:bg-primary/20 text-foreground border border-border/50 hover:border-primary/30"
                      }`}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Services coming soon. Please check back later!
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 p-8 bg-muted/40 rounded-2xl text-center border border-border/50">
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Custom Solutions Available
          </h3>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            Have a unique project requirement? Let's discuss your specific needs and create a custom solution tailored to you.
          </p>
          <Button 
            onClick={() => {
              const customService: PricingService = {
                id: "custom",
                title: "Custom Project",
                description: "Custom solution tailored to your needs",
                price: "Custom",
                price_unit: "quote",
                features: [],
                icon: "Settings",
                popular: false,
              };
              handleGetStarted(customService);
            }}
            variant="outline" 
            className="hover:bg-primary hover:text-primary-foreground"
          >
            Contact Me for Custom Quote
          </Button>
        </div>
      </div>

      {/* Service Contact Form Modal */}
      <ServiceContactForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        selectedService={selectedService}
      />
    </section>
  );
}
