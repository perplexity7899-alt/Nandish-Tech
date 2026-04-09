import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) {
        console.warn("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (err) {
      console.error("Exception checking admin role:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let isComponentMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isComponentMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set loading to false immediately - check admin in background
        setLoading(false);
        
        // Don't await admin check - do it in background
        if (session?.user) {
          checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isComponentMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Don't await - check admin in background
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    }).catch(() => {
      if (isComponentMounted) {
        setLoading(false);
      }
    });

    // Safety timeout - ensure loading is false after 3 seconds
    const timeout = setTimeout(() => {
      if (isComponentMounted) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      isComponentMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      
      if (authError) {
        return { error: authError as Error };
      }
      
      // Also create profile record directly (in addition to trigger)
      if (authData?.user) {
        try {
          await supabase.from("profiles").insert({
            user_id: authData.user.id,
            full_name: fullName,
            email: email,
          });
        } catch (profileErr) {
          // Profile might already exist from trigger, that's okay
          console.warn("Profile creation skipped (may already exist):", profileErr);
        }
      }
      
      return { error: null };
    } catch (err: any) {
      console.error("Sign up error:", err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (err: any) {
      console.error("Sign in error:", err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
