import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

const CreateLobby: React.FC = () => {
  const [lobbyName, setLobbyName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

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
      console.log("Lobby:", lobby);
    })

    return () => {
      socket.off("error");
    }
  }, [socket, socket?.connected]);

  return (
    <div className="max-w-md mx-auto relative">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 rounded-xl blur-md opacity-70"></div>
      <div className="bg-black bg-opacity-80 backdrop-blur-sm border-2 border-cyan-400 rounded-xl p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
        
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300 mb-6 cyberpunk-font neon-text">
          CREATE LOBBY
        </h2>
        
        <div className="mb-6 relative">
          <label htmlFor="lobbyName" className="block text-cyan-300 font-bold mb-2 uppercase tracking-wide text-sm">Lobby Name:</label>
          <input
            type="text"
            id="lobbyName"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="w-full px-4 py-3 rounded bg-black bg-opacity-60 border-2 border-cyan-500 text-cyan-100 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-300"
            placeholder="Enter lobby name..."
          />
        </div>
        
        <div className="mb-8">
          <label className="inline-flex items-center text-cyan-300 hover:text-pink-300 transition-colors cursor-pointer">
            <div className="relative mr-3">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only"
              />
              <div className="w-10 h-5 bg-black rounded-full border border-cyan-500 toggle-bg"></div>
              <div className={`absolute left-0.5 top-0.5 bg-cyan-500 w-4 h-4 rounded-full transition-transform ${isPrivate ? 'translate-x-5 bg-pink-500' : ''}`}></div>
            </div>
            Private Lobby
          </label>
        </div>
        
        <button
          onClick={handleCreateLobby}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-black font-bold rounded hover:from-cyan-400 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 uppercase tracking-wide hover:scale-105 transform hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
        >
          Create Lobby
        </button>
      </div>
    </div>
  );
};

export default CreateLobby;