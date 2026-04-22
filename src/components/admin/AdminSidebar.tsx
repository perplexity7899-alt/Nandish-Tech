import { LayoutDashboard, FolderOpen, User, Wrench, MessageSquare, LogOut, ArrowLeft, Send, Menu, X, DollarSign, Users, CreditCard, FileText, Mail, Share2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export type AdminTab = "dashboard" | "projects" | "deliver" | "purchases" | "about" | "services" | "serviceoffers" | "messages" | "pricing" | "clients" | "payments" | "custom-replies" | "admin-mail" | "socials" | "sample-works";

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
  { id: "sample-works", label: "Sample Works", icon: Star },
  { id: "custom-replies", label: "Custom Project Replies", icon: FileText },
  { id: "deliver", label: "Deliver", icon: Send },
  { id: "admin-mail", label: "Mail to Clients", icon: Mail },
  { id: "purchases", label: "Purchases", icon: DollarSign },
  { id: "payments", label: "Payment Settings", icon: CreditCard },
  { id: "about", label: "About", icon: User },
  { id: "socials", label: "Social Links", icon: Share2 },
  { id: "services", label: "Services", icon: Wrench },
  { id: "serviceoffers", label: "Services I Offer", icon: DollarSign },
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
          ? "fixed inset-y-0 left-0 z-40 transition-transform duration-300 overflow-y-auto"
          : "hidden md:flex transition-transform duration-300"
      }`}>
        <div className="p-4 md:p-6 border-b border-primary-foreground/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-base md:text-lg font-bold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">NT</span>
              </div>
              <span className="hidden sm:inline">Nandish-Tech</span>
            </h2>
            <NotificationBell />
          </div>
          <p className="text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 md:p-4 space-y-0.5 overflow-y-auto">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onChange(id);
                onMobileMenuToggle?.(false);
              }}
              className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                active === id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary-foreground/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
              {id === "messages" && unreadCount > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 md:p-4 space-y-1 border-t border-primary-foreground/10 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm hover:bg-primary-foreground/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" /> View Site
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm hover:bg-primary-foreground/5 transition-colors text-destructive"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" /> Logout
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
