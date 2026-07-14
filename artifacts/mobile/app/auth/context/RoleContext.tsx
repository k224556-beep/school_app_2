import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import SessionService from "../services/SessionService";
import { LoginSession, Role } from "../models";

interface RoleContextValue {
  session: LoginSession | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<LoginSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const s = await SessionService.getSession();
    setSession(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await SessionService.clearSession();
    setSession(null);
  }, []);

  return (
    <RoleContext.Provider value={{ session, role: session?.role ?? null, loading, refresh, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}

export default RoleContext;
