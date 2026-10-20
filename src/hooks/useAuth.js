import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api.me();
      setUser(u);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  return { user, loading: user === undefined, error, logout, refresh };
}
