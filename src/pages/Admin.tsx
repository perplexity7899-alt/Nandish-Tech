import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar, { type AdminTab } from "@/components/admin/AdminSidebar";
import DashboardOverview from "@/components/admin/DashboardOverview";
import ClientsManager from "@/components/admin/ClientsManager";
import ProjectsManager from "@/components/admin/ProjectsManager";
import DeliverProjects from "@/components/admin/DeliverProjects";
import AboutManager from "@/components/admin/AboutManager";
import ServicesManager from "@/components/admin/ServicesManager";
import MessagesPanel from "@/components/admin/MessagesPanel";
import PricingManager from "@/components/admin/PricingManager";

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminSessionValid, setIsAdminSessionValid] = useState(
    sessionStorage.getItem("admin-session-valid") === "true"
  );

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin,
  });

  const unread = messages.filter((m) => !m.read).length;

  useEffect(() => {
    if (isLoggingOut && !user) {
      sessionStorage.removeItem("admin-session-valid");
      navigate("/");
    }
  }, [isLoggingOut, user, navigate]);

  useEffect(() => {
    // If user logged out, clear admin session
    if (!user) {
      setIsAdminSessionValid(false);
      sessionStorage.removeItem("admin-session-valid");
    }
  }, [user]);

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

  if (!user || !isAdmin || !isAdminSessionValid) {
    return <AdminLogin onLogin={() => {
      setIsAdminSessionValid(true);
      sessionStorage.setItem("admin-session-valid", "true");
    }} />;
  }

  const logout = async () => {
    setIsLoggingOut(true);
    navigate("/");
    signOut().catch(console.error);
  };

  const panels: Record<AdminTab, React.ReactNode> = {
    dashboard: <DashboardOverview />,
    clients: <ClientsManager />,
    projects: <ProjectsManager />,
    deliver: <DeliverProjects />,
    about: <AboutManager />,
    services: <ServicesManager />,
    messages: <MessagesPanel />,
    pricing: <PricingManager />,
  };

  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar 
        active={tab} 
        onChange={(newTab) => {
          setTab(newTab);
          setMobileMenuOpen(false);
        }}
        onLogout={logout} 
        unreadCount={unread}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={setMobileMenuOpen}
      />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-0">
        {panels[tab]}
      </main>
    </div>
  );
}
