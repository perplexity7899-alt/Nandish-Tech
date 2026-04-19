import { useState } from "react";
import { Menu, X, LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "My Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-full">
        <a href="#home" className="font-display font-bold flex items-center gap-2 md:gap-5 group flex-shrink-0">
          <img src="/favicon.ico" alt="Nandish-Tech Logo" className="w-12 h-12 md:w-40 md:h-14 rounded-lg group-hover:shadow-lg group-hover:shadow-primary/50 transition-all" />
          <span className="text-primary font-bold tracking-tight text-lg md:text-2xl whitespace-nowrap">Nandish-Tech</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 ml-4">
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-1" /> Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-1" /> Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground ml-auto" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in w-full">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href} className="list-none">
                <a href={link.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                  {link.label}
                </a>
              </li>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { handleSignOut(); setOpen(false); }} className="w-full">
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">
                      <LogIn className="w-4 h-4 mr-1" /> Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="w-full">
                    <Button size="sm" className="w-full">
                      <UserPlus className="w-4 h-4 mr-1" /> Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
