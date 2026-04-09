import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { PortfolioData, Project, Service, ContactMessage } from "@/types/portfolio";
import { loadData, saveData, STORAGE_KEY } from "@/data/portfolioData";
import { toast } from "sonner";
interface PortfolioContextType {
  data: PortfolioData;
  updateHero: (hero: PortfolioData["hero"]) => void;
  updateAbout: (about: PortfolioData["about"]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addMessage: (msg: Omit<ContactMessage, "id" | "date" | "read">) => void;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(loadData);
  const prevMessageCount = useRef(data.messages.length);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refresh data from localStorage
  const refreshFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const newData: PortfolioData = JSON.parse(stored);
        setData((prevData) => {
          // Only update if data has changed
          if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
            console.log("📡 Portfolio data updated from storage");
            // Notify admin if new messages arrived
            if (newData.messages.length > prevMessageCount.current) {
              const newCount = newData.messages.length - prevMessageCount.current;
              toast.info(`${newCount} new message${newCount > 1 ? "s" : ""} received!`, {
                description: "Check the Messages panel",
              });
            }
            prevMessageCount.current = newData.messages.length;
            return newData;
          }
          return prevData;
        });
      }
    } catch (error) {
      console.error("Error refreshing from storage:", error);
    }
  }, []);

  // Sync across browser tabs via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        console.log("🔄 Storage event detected, refreshing data");
        refreshFromStorage();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refreshFromStorage]);

  // Poll for changes every 500ms (for same-tab updates)
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      refreshFromStorage();
    }, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [refreshFromStorage]);

  const update = useCallback((updater: (prev: PortfolioData) => PortfolioData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      prevMessageCount.current = next.messages.length;
      return next;
    });
  }, []);

  const ctx: PortfolioContextType = {
    data,
    updateHero: (hero) => update((d) => ({ ...d, hero })),
    updateAbout: (about) => update((d) => ({ ...d, about })),
    addProject: (project) => update((d) => ({ ...d, projects: [...d.projects, project] })),
    updateProject: (project) => update((d) => ({ ...d, projects: d.projects.map((p) => (p.id === project.id ? project : p)) })),
    deleteProject: (id) => update((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) })),
    addService: (service) => update((d) => ({ ...d, services: [...d.services, service] })),
    updateService: (service) => update((d) => ({ ...d, services: d.services.map((s) => (s.id === service.id ? service : s)) })),
    deleteService: (id) => update((d) => ({ ...d, services: d.services.filter((s) => s.id !== id) })),
    addMessage: (msg) =>
      update((d) => ({
        ...d,
        messages: [...d.messages, { ...msg, id: crypto.randomUUID(), date: new Date().toISOString(), read: false }],
      })),
    markMessageRead: (id) => update((d) => ({ ...d, messages: d.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) })),
    deleteMessage: (id) => update((d) => ({ ...d, messages: d.messages.filter((m) => m.id !== id) })),
  };

  return <PortfolioContext.Provider value={ctx}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
