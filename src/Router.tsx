import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './App'
import React, { Suspense } from 'react'

const WebSocketDemo = React.lazy(() => import('./pages/WebSocketDemo').then(mod => ({ default: mod.WebSocketDemo })))

const router = createBrowserRouter([
    {
        index: true,
        Component: App
    },
    {
        path: "/websocket",
        Component: () => (
            <Suspense fallback={<div>Chargement…</div>}>
                <WebSocketDemo />
            </Suspense>
        ),
    }
])

export const Router = () => {
    return (
        <RouterProvider router={router} />
    )
}