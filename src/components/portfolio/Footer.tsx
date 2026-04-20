import { usePortfolio } from "@/context/PortfolioContext";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Twitter: Twitter,
};

export default function Footer() {
  const { data } = usePortfolio();
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-xl mb-4 text-primary-foreground">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Nandish-Tech</span>
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Building innovative digital solutions for your business
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="/#about" className="hover:text-primary-foreground transition-colors">About</a></li>
              <li><a href="/#services" className="hover:text-primary-foreground transition-colors">Services</a></li>
              <li><a href="/#projects" className="hover:text-primary-foreground transition-colors">Projects</a></li>
              <li><a href="/#contact" className="hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Web Development</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">UI/UX Design</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Consulting</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Connect</h4>
            <div className="flex items-center gap-4 mb-4">
              {data.socials.map((s) => {
                const Icon = iconMap[s.platform] || Github;
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-primary-foreground/70 hover:text-primary-foreground"
                    aria-label={s.platform}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <p className="text-sm text-primary-foreground/70">
              <a href="mailto:contactnandishtech@gmail.com" className="hover:text-primary-foreground transition-colors">contactnandishtech@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} Nandish-Tech. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Terms of Service
              </a>
              <button
                onClick={() => navigate("/admin")}
                className="text-xs text-primary-foreground/40 hover:text-primary-foreground/60 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
