export interface LobbyDetailsProps {
  name: string;
  ownerName: string;
  playerCount: number;
  maxPlayers: number;
  lobbyCode: string;
}

const LobbyDetails: React.FC<LobbyDetailsProps> = ({
  name,
  ownerName,
  playerCount,
  maxPlayers,
  lobbyCode,
}) => {

  const copyLobbyCode = () => {
    navigator.clipboard.writeText(lobbyCode)
      .then(() => {
        // Optionnel: afficher une notification "Copié !"
        console.log("Lobby code copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy lobby code: ", err);
      });
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-300 animate-tilt"></div>
      <div className="relative bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 rounded-xl border border-purple-700 shadow-xl">
        {/* Lignes décoratives */}
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-500 opacity-40 rounded-tl-lg"></div>
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-pink-500 opacity-40 rounded-br-lg"></div>

        <h1 className="text-3xl sm:text-4xl font-black cyberpunk-font text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 neon-text-strong mb-6 text-center break-all">
          {name}
        </h1>

        <div className="space-y-3 text-lg">
          <p>
            <span className="font-semibold text-purple-300 uppercase tracking-wider text-sm">Host:</span>
            <span className="ml-2 text-cyan-200 cyberpunk-glitch-small">{ownerName}</span>
          </p>
          <p>
            <span className="font-semibold text-purple-300 uppercase tracking-wider text-sm">Operators:</span>
            <span className="ml-2 text-cyan-200">{playerCount} / {maxPlayers}</span>
          </p>
          <div className="flex items-center">
            <span className="font-semibold text-purple-300 uppercase tracking-wider text-sm">Access Code:</span>
            <span 
              className="ml-2 text-pink-400 font-mono text-xl tracking-widest p-1 border border-pink-700 bg-gray-800 rounded-sm cursor-pointer hover:bg-pink-900 hover:border-pink-500 transition-all"
              onClick={copyLobbyCode}
              title="Copy Code"
            >
              {lobbyCode}
            </span>
            <button 
              onClick={copyLobbyCode} 
              className="ml-2 text-xs p-1 border border-transparent hover:border-cyan-400 rounded text-cyan-400 hover:text-cyan-300 transition-all"
              title="Copy Code"
            >
              [COPY]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyDetails;