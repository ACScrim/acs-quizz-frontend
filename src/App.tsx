import DiscordLogin from "./components/DiscordLogin";
import Navbar from "./components/Navbar";
import CreateLobby from "./components/CreateLobby";
import { useAuth } from "./hooks/useAuth";
import LobbyList from "./components/LobbyList";

function App() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grille du fond */}
      <div className="absolute inset-0 z-0 grid-bg"></div>
      
      {/* Horizon synthwave */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-fuchsia-900 via-purple-800 to-transparent z-0"></div>
      
      {/* Sun */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 w-60 h-60 rounded-full bg-gradient-to-b from-pink-500 to-red-600 blur-md z-0 synthwave-sun"></div>
      
      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-20 scanlines"></div>
      
      {/* Glitch effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-10 glitch-effect"></div>
      
      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-20 vignette"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <Navbar />
        <div className="pt-8 pb-20">
          {!user && <DiscordLogin />}
          {user && (
            <div className="space-y-12">
              <CreateLobby />
              <LobbyList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;