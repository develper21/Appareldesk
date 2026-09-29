import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { authApi } from "@/lib/api";
import { tokenStorage } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.get()) {
      setUser(null);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const res = await authApi.register({ name: fullName, email, password, phone });
      tokenStorage.set(res.accessToken);
      setUser(res.user);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      tokenStorage.set(res.accessToken);
      setUser(res.user);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = () => {
    tokenStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
