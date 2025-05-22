import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  logout: () => void;
  login: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = () => {
    localStorage.removeItem("acsquizz-user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (user: User) => {
    localStorage.setItem("acsquizz-user", JSON.stringify(user));
    setAccessToken(user.accessToken);
    setRefreshToken(user.refreshToken);
    setUser(user);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("acsquizz-user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (parsedUser) {
      setAccessToken(parsedUser.accessToken ?? null);
      setRefreshToken(parsedUser.refreshToken ?? null);
      setUser(parsedUser);
      setIsAuthenticated(!!parsedUser.accessToken);
    }
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, logout, login, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}