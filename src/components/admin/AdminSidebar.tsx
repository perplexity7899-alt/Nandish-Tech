import { LayoutDashboard, FolderOpen, User, Wrench, MessageSquare, LogOut, ArrowLeft, Send, Menu, X, DollarSign, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export type AdminTab = "dashboard" | "projects" | "deliver" | "purchases" | "about" | "services" | "messages" | "pricing" | "clients" | "payments";

interface Props {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  onLogout: () => void;
  unreadCount: number;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: (open: boolean) => void;
}

const items: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "deliver", label: "Deliver", icon: Send },
  { id: "purchases", label: "Purchases", icon: DollarSign },
  { id: "payments", label: "Payment Settings", icon: CreditCard },
  { id: "about", label: "About", icon: User },
  { id: "services", label: "Services", icon: Wrench },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

export default function AdminSidebar({ active, onChange, onLogout, unreadCount, mobileMenuOpen = false, onMobileMenuToggle }: Props) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay - Behind everything, allows clicks to pass through on desktop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-10 md:hidden bg-black/50"
          onClick={() => onMobileMenuToggle?.(false)}
        />
      )}

      {/* Sidebar - Desktop: Static, Mobile: Fixed Drawer */}
      <aside className={`w-64 min-h-screen bg-foreground text-primary-foreground/70 flex flex-col shrink-0 ${
        mobileMenuOpen
          ? "fixed inset-y-0 left-0 z-40 transition-transform duration-300"
          : "hidden md:flex transition-transform duration-300"
      }`}>
        <div className="p-6 border-b border-primary-foreground/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">NT</span>
              </div>
              <span>Nandish-Tech</span>
            </h2>
            <NotificationBell />
          </div>
          <p className="text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary-foreground/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === "messages" && unreadCount > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-1 border-t border-primary-foreground/10">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> View Site
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/5 transition-colors text-destructive"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => onMobileMenuToggle?.(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-foreground text-primary-foreground"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
}
