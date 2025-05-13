import { useState, useEffect } from "react";

// Type pour les informations utilisateur
interface User {
  id: string;
  username: string;
  discordId?: string;
  avatar?: string;
  discriminator?: string;
  // Ajoutez d'autres propriétés selon les besoins
}

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
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedAccessToken = sessionStorage.getItem("accessToken");
    const storedUser = sessionStorage.getItem("user");

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur depuis le localStorage:",
          err
        );
      }
    }
  }, []);

  return {
    user,
    accessToken,
    logout,
  };
}
