import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("smartClinicUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("smartClinicToken");
    if (!token) return;

    setLoading(true);
    authApi.me()
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem("smartClinicUser", JSON.stringify(freshUser));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  async function login(payload) {
    const data = await authApi.login(payload);
    localStorage.setItem("smartClinicToken", data.token);
    localStorage.setItem("smartClinicUser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    localStorage.setItem("smartClinicToken", data.token);
    localStorage.setItem("smartClinicUser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("smartClinicToken");
    localStorage.removeItem("smartClinicUser");
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
