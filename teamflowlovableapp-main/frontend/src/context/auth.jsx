/**
 * Auth provider — reads users from the teamflow.data store in localStorage.
 * Admin creates all user accounts. Each user logs in with their own email+password.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { fetcher } from "../services/api";

const Ctx = createContext(undefined);
const SESSION_KEY = "teamflow.session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* noop */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 300));

    // Read users from the live backend
    try {
      const users = await fetcher('/users');
      const found = users.find(
        (u) => (u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase()) && u.password === password
      );

      if (!found) {
        throw new Error("Invalid credentials. Check with your admin.");
      }

      // Store session without exposing password
      const { password: _pw, ...sessionUser } = found;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    } catch (error) {
      if (error.message.includes("Invalid email")) throw error;
      throw new Error("Failed to connect to the authentication server.");
    }

  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const dashboardPathFor = (role) =>
  role === "admin" ? "/admin" : role === "leader" ? "/leader" : "/member";
