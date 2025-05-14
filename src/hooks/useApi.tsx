import { useState, useCallback } from "react";

// Configuration de base de l'API
const API_BASE_URL = "http://localhost:3000/api";

// Types d'erreurs
interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// Options pour les requêtes
interface RequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

// Type pour les réponses
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi() {
  // État global pour suivre si une requête est en cours dans l'application
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);

  // Fonction principale pour effectuer les requêtes
  const request = useCallback(
    async <T,>(
      endpoint: string,
      method: string = "GET",
      body?: any,
      options: RequestOptions = {}
    ): Promise<ApiResponse<T>> => {
      // État initial
      let responseData: T | null = null;
      let error: ApiError | null = null;

      try {
        setGlobalLoading(true);

        // Récupération du token depuis le localStorage
        const accessToken = localStorage.getItem("accessToken");

        // Construction des headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...options.headers,
        };

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        // Options de la requête
        const fetchOptions: RequestInit = {
          method,
          headers,
          credentials: options.withCredentials ?? true ? "include" : "same-origin",
          signal: options.signal,
          ...(body && { body: JSON.stringify(body) }),
        };

        // URL complète
        const url = `${API_BASE_URL}${endpoint}`;

        // Exécution de la requête
        const response = await fetch(url, fetchOptions);

        // Vérification du statut de la réponse
        if (!response.ok) {
          let errorMessage = "Une erreur est survenue";
          let errorData = null;

          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Si la réponse n'est pas au format JSON
            errorMessage = response.statusText;
          }

          throw {
            status: response.status,
            message: errorMessage,
            data: errorData,
          };
        }

        // Traitement de la réponse
        if (response.status !== 204) {
          // No Content
          responseData = await response.json();
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          error = {
            status: 499, // Client Closed Request
            message: "Requête annulée",
          };
        } else if (err instanceof Error) {
          error = {
            status: 0,
            message: err.message,
          };
        } else {
          error = err as ApiError;
        }
      } finally {
        setGlobalLoading(false);
      }

      return { data: responseData, loading: false, error };
    },
    []
  );

  // Méthodes HTTP
  const get = useCallback(
    <T,>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, "GET", undefined, options),
    [request]
  );

  const post = useCallback(
    <T,>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>(endpoint, "POST", data, options),
    [request]
  );

  const put = useCallback(
    <T,>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>(endpoint, "PUT", data, options),
    [request]
  );

  const patch = useCallback(
    <T,>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>(endpoint, "PATCH", data, options),
    [request]
  );

  const del = useCallback(
    <T,>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, "DELETE", undefined, options),
    [request]
  );

  // Hook personnalisé pour exécuter une requête et gérer son état
  const useRequest = <T,>(
    endpoint: string,
    method: string = "GET",
    body?: any,
    options: RequestOptions = {}
  ) => {
    const [state, setState] = useState<ApiResponse<T>>({
      data: null,
      loading: false,
      error: null,
    });

    const execute = useCallback(
      async (customBody?: any) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
          const response = await request<T>(
            endpoint,
            method,
            customBody || body,
            options
          );

          setState({
            data: response.data,
            loading: false,
            error: response.error,
          });

          return response;
        } catch (error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error as ApiError,
          }));
          throw error;
        }
      },
      [endpoint, method, body, options]
    );

    return { ...state, execute };
  };

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    useRequest,
    loading: globalLoading,
  };
}
