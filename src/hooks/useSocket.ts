import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
}

const socketInstances: Record<string, Socket> = {};

export function useSocket({ namespace = "/", autoConnect = true }: UseSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const nsp = namespace.startsWith("/") ? namespace : `/${namespace}`;
  const { accessToken } = useAuth();

  useEffect(() => {
    const url = "http://localhost:3000";
    let instance = socketInstances[nsp];

    if (!instance) {
      instance = io(`${url}${nsp}`, {
        autoConnect,
        auth: accessToken ? { token: accessToken } : undefined,
        transports: ["websocket"],
      });
      socketInstances[nsp] = instance;
    } else if (accessToken) {
      // Met à jour le accessToken si besoin
      instance.auth = { token: accessToken };
    }

    setSocket(instance);

    // Pas de disconnect ici pour garder le singleton vivant
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nsp, accessToken]);

  return socket;
}