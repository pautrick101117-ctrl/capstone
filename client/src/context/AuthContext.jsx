import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "barangay-iba-auth";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: "", user: null, notifications: [], expiresAt: null };
  });
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const persist = (value) => {
    setSession(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  };

  const clearSession = () => {
    setSession({ token: "", user: null, notifications: [], expiresAt: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (session.expiresAt) {
      const remaining = session.expiresAt - Date.now();
      if (remaining <= 0) {
        clearSession();
      } else {
        timeoutRef.current = window.setTimeout(() => clearSession(), remaining);
      }
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [session.expiresAt]);

  useEffect(() => {
    if (!session.token) return;

    api("/auth/me", { token: session.token })
      .then((data) => {
        persist({ ...session, user: data.user, notifications: data.notifications || session.notifications });
      })
      .catch(() => clearSession());
  }, []);

  const login = async ({ usernameOrEmail, password, adminOnly = false }) => {
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { usernameOrEmail, password, adminOnly },
      });

      const expiresAt = Date.now() + data.sessionTimeoutMinutes * 60 * 1000;
      persist({
        token: data.token,
        user: data.user,
        notifications: [],
        expiresAt,
      });

      const me = await api("/auth/me", { token: data.token });
      persist({
        token: data.token,
        user: me.user,
        notifications: me.notifications || [],
        expiresAt,
      });

      return me.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => clearSession();

  const requestVerificationCode = async (payload) =>
    api("/auth/request-code", { method: "POST", body: payload });

  const register = async (formData) =>
    api("/auth/register", { method: "POST", body: formData });

  const refreshNotifications = async () => {
    if (!session.token) return [];
    const data = await api("/notifications", { token: session.token });
    persist({ ...session, notifications: data.notifications || [] });
    return data.notifications || [];
  };

  const refreshProfile = async () => {
    if (!session.token) return null;
    const data = await api("/auth/me", { token: session.token });
    persist({ ...session, user: data.user, notifications: data.notifications || [] });
    return data.user;
  };

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      notifications: session.notifications,
      isAuthenticated: Boolean(session.token && session.user),
      loading,
      login,
      logout,
      requestVerificationCode,
      register,
      refreshNotifications,
      refreshProfile,
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
