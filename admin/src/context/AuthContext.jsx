import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem("adminUser") || "null"));

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setAdmin(null);
  };

  const value = useMemo(() => ({ token, admin, login, logout, isAuthenticated: Boolean(token) }), [token, admin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
