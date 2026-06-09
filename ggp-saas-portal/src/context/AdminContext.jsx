import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { adminApi, getAdminToken, setAdminToken } from "../api/adminClient";

const AdminContext = createContext(null);

function clearAdminSession() {
  setAdminToken(null);
  localStorage.removeItem("saas_admin");
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAdminSession();
    setAdmin(null);
  }, []);

  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener("saas:admin-auth-expired", onExpired);
    return () => window.removeEventListener("saas:admin-auth-expired", onExpired);
  }, [logout]);

  useEffect(() => {
    const token = getAdminToken();
    const raw = localStorage.getItem("saas_admin");
    if (!token || !raw) {
      clearAdminSession();
      setLoading(false);
      return;
    }
    try {
      setAdmin(JSON.parse(raw));
    } catch {
      clearAdminSession();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await adminApi.login({ email, password });
    setAdminToken(data.token);
    localStorage.setItem("saas_admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const isAuthenticated = Boolean(admin && getAdminToken());

  return (
    <AdminContext.Provider value={{ admin, login, logout, loading, isAuthenticated }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
