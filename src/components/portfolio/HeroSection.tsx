import { usePortfolio } from "@/context/PortfolioContext";
import heroBg from "@/assets/hero-bg.jpg";

export default function HeroSection() {
  const { data } = usePortfolio();
  const { heading, subheading, ctaText, ctaLink } = data.hero;

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
      </div>
    </section>
  );
}
