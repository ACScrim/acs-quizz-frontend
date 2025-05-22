import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import { LobbyData } from "../types";
import { useAuth } from "../contexts/AuthContext";

const LobbyList = () => {
  const socket = useSocket({ namespace: "lobbies" });
  const api = useApi();
  const { isAuthenticated } = useAuth();

  const { data: lobbies, refetch: refetchLobbies } = useQuery<LobbyData[]>({
    queryKey: ["lobbies", isAuthenticated],
    queryFn: async () => {
      if (!api) return [];
      if (!isAuthenticated) return [];
      const response = await api.get<LobbyData[]>("/lobbies");
      if (response.error) {
        console.error("Error fetching lobbies:", response.error);
        return [];
      }
      return response.data || [];
    }
  });

  useEffect(() => {
    if (!socket) return;

    const onUpdate = () => {
      console.log("Lobby created");
      refetchLobbies();
    };

    if (!socket.connected) {
      socket.connect();
      return;
    }

    socket.on("lobby:created", onUpdate);
    
    return () => {
      socket.off("lobby:created", onUpdate);
    };
  }, [socket, socket?.connected]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 relative">
        {/* Effet de "scan" ou "glitch" sur le titre */}
        <div className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 opacity-50 blur-md animate-pulse-slow"></div>
        <h2 className="relative px-4 py-3 bg-gray-900 border-y-2 border-purple-500 text-center shadow-lg">
          <span className="text-3xl font-black uppercase tracking-widest cyberpunk-glitch text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-300 neon-text">Active Channels</span>
        </h2>
      </div>
      
      {lobbies && lobbies.length > 0 ? (
        <ul className="space-y-6">
          {lobbies.map((lobby: any) => (
            <li key={lobby._id} className="relative group transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-0 group-hover:opacity-75 transition-opacity duration-300 blur-sm"></div>
              <div className="relative bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-purple-700 group-hover:border-pink-500 rounded-lg p-5 flex items-center justify-between transition-colors duration-300 shadow-md">
                <div className="flex-grow space-y-1">
                  <h3 className="text-xl font-semibold text-pink-400 group-hover:text-cyan-300 transition-colors duration-300 tracking-wide">
                    {lobby.name}
                  </h3>
                  <p className="text-purple-300 text-sm flex items-center">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:bg-pink-400 mr-2.5 animate-ping-slow opacity-75 group-hover:opacity-100"></span>
                    <span className="mr-1">Operators:</span> <span className="text-cyan-200 group-hover:text-white">{lobby.players.length}</span><span className="text-purple-400">/{lobby.maxPlayers}</span>
                    <span className="ml-auto text-xs text-gray-500 group-hover:text-purple-300">ID: {lobby._id.slice(-6)}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => socket && socket.emit("lobby:join", lobby.id)}
                  className="ml-6 py-2 px-6 bg-gray-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 text-cyan-200 hover:text-white border border-cyan-500 hover:border-transparent font-semibold rounded-md transition-all duration-300 uppercase tracking-wider hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transform"
                >
                  Interface
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-purple-700 rounded-lg bg-gray-800 bg-opacity-30">
          <p className="text-pink-400 text-xl font-semibold cyberpunk-font">No Active Channels Detected</p>
          <p className="text-cyan-300 text-sm mt-3">Initiate a new datastream above or await broadcast.</p>
        </div>
      )}
    </div>
  );
}

export default LobbyList;