import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket"
import { useApi } from "../hooks/useApi";

const LobbyList = () => {
  const [lobbies, setLobbies] = useState([]);
  const socket = useSocket({ namespace: "lobbies" });
  const api = useApi();

  useEffect(() => {
    if (!socket) return;

    const onUpdate = () => {
      console.log("Lobby created");
      fetchLobbies();
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

  async function fetchLobbies() {
    if (!api) return;
    if (api.loading) return;
    const lobbies = (await api.get<any>("/lobbies")).data;
    setLobbies(lobbies);
  }

  useEffect(() => {
    fetchLobbies();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Nouveau design de titre */}
      <div className="mb-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 opacity-75 blur"></div>
        <h2 className="relative px-4 py-2 bg-black border-2 border-cyan-500 text-center">
          <span className="text-3xl font-black uppercase tracking-widest cyberpunk-glitch">Available Lobbies</span>
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500"></div>
          <div className="absolute -top-1 left-0 right-0 h-px bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400"></div>
        </h2>
      </div>
      
      {lobbies.length > 0 ? (
        <ul className="space-y-5">
          {lobbies.map((lobby: any) => (
            <li key={lobby.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-lg opacity-60 blur-sm group-hover:opacity-80 transition-all duration-300"></div>
              <div className="relative bg-black bg-opacity-70 backdrop-blur-sm border-l-4 border-cyan-400 group-hover:border-pink-500 rounded-lg p-5 flex items-center justify-between transition-all duration-300">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-pink-300 group-hover:text-cyan-300 transition-colors duration-300">
                    {lobby.name}
                  </h3>
                  <p className="text-cyan-200 text-sm">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
                    Players: <span className="text-pink-300">{lobby.players.length}</span>/{lobby.maxPlayers}
                  </p>
                </div>
                
                <button
                  onClick={() => socket && socket.emit("lobby:join", lobby.id)}
                  className="ml-4 py-2 px-6 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-pink-500 hover:to-cyan-500 text-black font-bold rounded transition-all duration-300 uppercase tracking-wider hover:scale-105 transform hover:shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                >
                  Join
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-pink-500 rounded-lg">
          <p className="text-pink-300 text-lg">No lobbies available</p>
          <p className="text-cyan-400 text-sm mt-2">Create one above!</p>
        </div>
      )}
    </div>
  );
}

export default LobbyList;