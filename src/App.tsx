import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Navbar from "./components/Navbar";
import { useApi } from "./hooks/useApi";
import { useAuth } from "./contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

function App() {
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: myLobby } = useQuery<string | null>({
    queryKey: ["lobbies", "mine", isAuthenticated],
    queryFn: async () => {
      if (!api) return null;
      if (!isAuthenticated) return null;
      const response = await api.get<{ _id: string }>("/lobbies/mine");
      if (response.error) {
        // console.error("Error fetching my lobby:", response.error);
        return null;
      }
      return response.data?._id || null;
    }
  });

  useEffect(() => {
    if (location.pathname === "/") {
      if (isAuthenticated) {
        if (myLobby) {
          navigate(`/lobby/${myLobby}`);
        }
      }
    }
  }, [isAuthenticated, location.pathname, myLobby])

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden"> {/* Base plus sombre */}
      {/* Optionnel: Fond de pluie digitale/particules (nécessite CSS/JS pour un effet complet) */}
      <div className="absolute inset-0 z-0 opacity-20 digital-rain-bg"></div>

      {/* Grille de circuit imprimé */}
      <div className="absolute inset-0 z-0 opacity-25 circuit-grid-bg"></div>

      {/* Horizon Néon avec ligne brillante */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0">
        {/* Dégradé de l'horizon */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-purple-700 via-pink-600 to-transparent opacity-70"></div>
        {/* Ligne d'horizon brillante */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_3px_rgba(6,182,212,0.6)]"></div>
      </div>

      {/* Noyau de Données Pulsant (remplace le soleil) */}
      <div // Halo extérieur du noyau
        className="absolute"
        style={{
          bottom: '15%', // Ajustez la position verticale
          left: '50%',
          transform: 'translateX(-50%)',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(255, 0, 255, 0.5) 0%, rgba(0, 255, 255, 0.3) 60%, transparent 90%)',
          borderRadius: '50%',
          filter: 'blur(30px)', // Flou plus prononcé
          animation: 'pulseCore 4s infinite alternate ease-in-out',
          zIndex: 0,
        }}
      ></div>
      <div // Élément géométrique central du noyau
        className="absolute"
        style={{
          bottom: '15%', // Doit correspondre au halo
          left: '50%',
          transform: 'translateX(-50%) translateY(calc(-50% + 110px))', // Centre par rapport au halo
          width: '40px',
          height: '40px',
          background: 'white',
          clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', // Forme de cristal/diamant
          animation: 'spinCore 12s linear infinite, flickerCore 1.5s infinite alternate',
          boxShadow: '0 0 15px 3px white, 0 0 25px 8px #0ff, 0 0 35px 12px #f0f',
          zIndex: 0,
        }}
      ></div>

      {/* Scanlines (conservées, opacité ajustable) */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-15 scanlines"></div>

      {/* Effet de Glitch subtil (opacité ajustable) */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-5 glitch-effect"></div>

      {/* Vignette pour concentrer le regard */}
      <div className="pointer-events-none fixed inset-0 z-20 vignette-darker"></div>

      {/* Contenu de l'application */}
      <div className="relative z-10">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default App;