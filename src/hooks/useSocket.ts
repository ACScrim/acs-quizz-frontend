import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
}

const socketInstances: Record<string, Socket> = {};

export function useSocket({ namespace = "/", autoConnect = true }: UseSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const nsp = namespace.startsWith("/") ? namespace : `/${namespace}`;

  useEffect(() => {
    const url = "http://localhost:3000";
    let instance = socketInstances[nsp];
    const token = localStorage.getItem("accessToken");

    if (!instance) {
      instance = io(`${url}${nsp}`, {
        autoConnect,
        auth: token ? { token } : undefined,
        transports: ["websocket"],
      });
      socketInstances[nsp] = instance;
    } else if (token) {
      // Met à jour le token si besoin
      instance.auth = { token };
    }

    setSocket(instance);

    // Pas de disconnect ici pour garder le singleton vivant
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nsp]);

  return socket;
}