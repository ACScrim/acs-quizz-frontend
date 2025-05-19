import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router";

const CreateLobby: React.FC = () => {
  const [lobbyName, setLobbyName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const navigate = useNavigate();

  const socket = useSocket({
    namespace: "lobbies"
  });
  
  const handleCreateLobby = () => {
    const lobbyData = {
      name: lobbyName,
      isPublic: !isPrivate,
    };

    socket && socket.emit("lobby:create", lobbyData);
  };
  
  useEffect(() => {
    if (!socket) return;
    if (!socket.connected) socket.connect();

    socket.on("error", (error) => {
      console.error("Error from server:", error.details);
      alert(error.details);
    });

    socket.on("lobby:created", (lobby) => {
      navigate(`/lobby/${lobby._id}`);
    })

    return () => {
      socket.off("error");
    }
  }, [socket, socket?.connected]);

  return (
    <div className="max-w-md mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-purple-700 to-pink-600 rounded-xl blur opacity-60 group-hover:opacity-90 transition duration-1000 group-hover:duration-300 animate-tilt"></div>
      <div className="bg-gray-900 bg-opacity-85 backdrop-blur-md border border-purple-600 rounded-xl p-8 relative shadow-2xl">
        {/* Lignes décoratives type HUD/interface */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400 opacity-50"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-pink-400 opacity-50"></div>
        
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-400 mb-8 cyberpunk-font neon-text-strong text-center">
          INITIATE LOBBY
        </h2>
        
        <div className="mb-6 relative">
          <label htmlFor="lobbyName" className="block text-purple-300 font-semibold mb-2 uppercase tracking-wider text-xs cyberpunk-glitch-small">Lobby Datastream Name:</label>
          <input
            type="text"
            id="lobbyName"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-gray-800 bg-opacity-70 border-2 border-purple-500 text-cyan-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-600 placeholder-gray-500 transition-all duration-300"
            placeholder="Enter unique identifier..."
          />
        </div>
        
        <div className="mb-8">
          <label className="inline-flex items-center text-purple-300 hover:text-pink-300 transition-colors cursor-pointer group/checkbox">
            <div className="relative mr-3">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only peer" // Added peer
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full border border-purple-500 peer-checked:bg-pink-700 peer-checked:border-pink-500 transition-colors"></div>
              <div className={`absolute left-1 top-1 bg-purple-400 peer-checked:bg-pink-300 w-4 h-4 rounded-full transition-all duration-300 transform peer-checked:translate-x-5`}></div>
            </div>
            Secure Channel (Private)
          </label>
        </div>
        
        <button
          onClick={handleCreateLobby}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold rounded-md hover:shadow-[0_0_20px_rgba(236,72,153,0.7)] focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 transition-all duration-300 uppercase tracking-wider hover:scale-105 transform"
        >
          Establish Connection
        </button>
      </div>
    </div>
  );
};

export default CreateLobby;