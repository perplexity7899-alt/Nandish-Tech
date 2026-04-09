import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, User, LogOut, ArrowLeft, Mail, MessageCircle, FolderOpen, ShoppingCart, Menu, X } from "lucide-react";
import ClientMessages from "@/components/client/ClientMessages";
import ClientProfile from "@/components/client/ClientProfile";
import ClientOverview from "@/components/client/ClientOverview";
import ClientReplies from "@/components/client/ClientReplies";
import ClientProjects from "@/components/client/ClientProjects";
import ClientProjectsCatalog from "@/components/client/ClientProjectsCatalog";
import ContactSection from "@/components/portfolio/ContactSection";

type ClientTab = "dashboard" | "messages" | "replies" | "profile" | "projects" | "catalog" | "contact";

const items: { id: ClientTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "My Deliveries", icon: FolderOpen },
  { id: "catalog", label: "All Projects", icon: ShoppingCart },
  { id: "messages", label: "My Messages", icon: MessageSquare },
  { id: "replies", label: "Replies", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function ClientDashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ClientTab>("dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoggingOut && !user) {
      navigate("/");
    }
  }, [isLoggingOut, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Logging out...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    navigate("/");
    signOut().catch(console.error);
  };

  const panels: Record<ClientTab, React.ReactNode> = {
    dashboard: <ClientOverview />,
    projects: <ClientProjects />,
    catalog: <ClientProjectsCatalog />,
    messages: <ClientMessages />,
    replies: <ClientReplies />,
    profile: <ClientProfile />,
    contact: <ContactSection />,
  };

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar - Desktop: Static, Mobile: Fixed Drawer */}
      <aside
        className={`w-64 min-h-screen bg-foreground text-primary-foreground/70 flex flex-col shrink-0 ${
          mobileMenuOpen
            ? "fixed inset-y-0 left-0 z-40 transition-transform duration-300"
            : "hidden md:flex transition-transform duration-300"
        }`}
      >
        <div className="p-6 border-b border-primary-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-base font-bold text-primary-foreground truncate">
                {user?.user_metadata?.full_name || user?.email}
              </h2>
              <p className="text-xs text-primary-foreground/50">Client Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary-foreground/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-1 border-t border-primary-foreground/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/5 transition-colors text-destructive"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-foreground text-primary-foreground"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-4">
        {panels[tab]}
      </main>
    </div>
  );
}
