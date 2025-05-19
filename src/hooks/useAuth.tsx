import { useState, useEffect } from "react";
import type { User } from "../types";

interface useAuthReturn {
  user: User | null;
  accessToken: string | null;
  logout: () => void;
  // TODO : refreshtoken
}

export function useAuth(): useAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
 
    setAccessToken(storedAccessToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  return {
    user,
    accessToken,
    logout,
  };
}
