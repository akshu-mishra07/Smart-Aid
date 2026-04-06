import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface AdminAuth {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuth>({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const STORAGE_KEY = "smart_aid_admin_token";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      fetch(`${BASE}/api/admin/check`, {
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then((res) => {
          if (res.ok) {
            setToken(stored);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || "Login failed" };
      }

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem(STORAGE_KEY, data.token);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
