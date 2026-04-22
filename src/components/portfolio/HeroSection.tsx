import { usePortfolio } from "@/context/PortfolioContext";
import heroBg from "@/assets/hero-bg.jpg";
import { Github, Linkedin, Twitter, ExternalLink } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: Github,
  Github: Github,
  LinkedIn: Linkedin,
  Linkedin: Linkedin,
  Twitter: Twitter,
  X: Twitter,
};

export default function HeroSection() {
  const { data } = usePortfolio();
  const { heading, subheading, ctaText, ctaLink } = data.hero;
  const socials = data.socials || [];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-foreground/70" />

      <div className="relative z-10 section-container text-center max-w-3xl animate-fade-up">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
          {heading}
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 leading-relaxed">
          {subheading}
        </p>
        <a
          href={ctaLink}
          className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm tracking-wide"
        >
          {ctaText}
        </a>

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            {socials.map((social) => {
              const Icon = iconMap[social.platform] || ExternalLink;
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-all duration-300 group"
                  title={social.platform}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
