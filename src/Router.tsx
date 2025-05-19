import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        index: true,
        Component: React.lazy(() => 
          import("./pages/HomePage").then((mod) => ({
          default: mod.default
        })))
      },
      {
        path: "/lobby/:id",
        Component: React.lazy(() => 
        import("./pages/LobbyPage").then((mod) => ({
          default: mod.default
        })))
      }
    ]
  },
  {
    path: "/discord-callback",
    Component: React.lazy(() =>
      import("./pages/DiscordCallbackPage").then((mod) => ({
        default: mod.default,
      }))
    ),
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
