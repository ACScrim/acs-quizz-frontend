import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Types d'état de connexion
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

// Options de configuration
interface SocketOptions {
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  query?: Record<string, string>;
  auth?: Record<string, any>;
  path?: string;
}

// Hook principal
export function useSocket(url: string, options: SocketOptions = {}) {
  // État de la connexion
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  // Référence au socket pour éviter de recréer le socket à chaque rendu
  const socketRef = useRef<Socket | null>(null);

  // Stock des callbacks d'événements
  const eventCallbacks = useRef<Map<string, Set<(...args: any[]) => void>>>(
    new Map()
  );

  // Initialisation de la connexion
  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    setStatus("connecting");

    const defaultOptions = {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    };

    try {
      // Création de l'instance Socket.IO
      const socket = io(url, {
        ...defaultOptions,
        ...options,
      });

      // Événements de base
      socket.on("connect", () => {
        setStatus("connected");
        setError(null);
      });

      socket.on("disconnect", (reason) => {
        setStatus("disconnected");
        console.log(`Socket déconnecté: ${reason}`);
      });

      socket.on("connect_error", (err) => {
        setStatus("error");
        setError(err);
        console.error("Erreur de connexion socket:", err);
      });

      socket.on("reconnect_attempt", (attempt) => {
        setStatus("connecting");
        console.log(`Tentative de reconnexion: ${attempt}`);
      });

      socket.on("reconnect_failed", () => {
        setStatus("error");
        setError(
          new Error("Nombre maximal de tentatives de reconnexion atteint")
        );
        console.error("Échec de la reconnexion");
      });

      // Enregistrer tous les callbacks existants
      if (socketRef.current) {
        eventCallbacks.current.forEach((listeners, event) => {
          listeners.forEach((callback) => {
            socket.on(event, callback);
          });
        });
      }

      socketRef.current = socket;
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err
          : new Error("Erreur lors de la création du socket")
      );
      console.error("Erreur d'initialisation du socket:", err);
    }
  }, [url, options]);

  // Déconnexion
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setStatus("disconnected");
    }
  }, []);

  // S'abonner à un événement
  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (!eventCallbacks.current.has(event)) {
        eventCallbacks.current.set(event, new Set());
      }

      eventCallbacks.current.get(event)?.add(callback);

      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }

      // Fonction de nettoyage pour useEffect
      return () => {
        const callbacks = eventCallbacks.current.get(event);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            eventCallbacks.current.delete(event);
          }
        }

        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    },
    []
  );

  // Émettre un événement
  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, ...args);
      return true;
    }
    return false;
  }, []);

  // Émettre un événement et attendre une réponse (patern request-response)
  const emitWithAck = useCallback(
    <T = any,>(event: string, ...args: any[]): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current || !socketRef.current.connected) {
          reject(new Error("Socket non connecté"));
          return;
        }

        try {
          socketRef.current.emit(event, ...args, (response: T) => {
            resolve(response);
          });
        } catch (err) {
          reject(err);
        }
      });
    },
    []
  );

  // Se connecter automatiquement au montage du composant si autoConnect est true
  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    // Nettoyage au démontage
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect, options.autoConnect]);

  // Renvoyer les méthodes et états
  return {
    socket: socketRef.current,
    status,
    error,
    connect,
    disconnect,
    on,
    emit,
    emitWithAck,
    isConnected: status === "connected",
  };
}
