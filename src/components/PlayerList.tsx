import { User } from "../types";

export interface PlayerListProps {
  players: User[];
  currentUser?: User | null; // Pour potentiellement mettre en évidence l'utilisateur actuel
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUser }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-300 animate-tilt"></div>
      <div className="relative bg-gray-900 bg-opacity-75 backdrop-blur-sm p-6 rounded-xl border border-cyan-700 shadow-lg h-full">
        <h2 className="text-2xl font-bold cyberpunk-font text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 neon-text mb-6 text-center uppercase tracking-wider">
          Active Operators
        </h2>
        {players.length > 0 ? (
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
            {players.map((player) => (
              <li
                key={player.id}
                className={`flex items-center p-3 rounded-md transition-all duration-300 border-2 ${
                  player.id === currentUser?.id
                    ? 'bg-purple-800 bg-opacity-50 border-pink-500 shadow-lg'
                    : 'bg-gray-800 bg-opacity-60 border-purple-700 hover:border-cyan-500'
                }`}
              >
                <img
                  src={player.avatar ? `https://cdn.discordapp.com/avatars/${player.discordId}/${player.avatar}.png` : '/default-profile.png'}
                  alt={player.username}
                  className="w-10 h-10 rounded-full border-2 border-cyan-600 mr-3 object-cover"
                />
                <span className={`font-medium text-lg ${player.id === currentUser?.id ? 'text-pink-300' : 'text-cyan-200'}`}>
                  {player.username}
                </span>
                {/* Optionnel: indicateur de propriétaire */}
                {/* {lobbyData?.owner._id === player._id && <span className="ml-auto text-xs text-purple-400 cyberpunk-font">[HOST]</span>} */}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-purple-300 cyberpunk-font">Awaiting connections...</p>
        )}
      </div>
    </div>
  );
};

export default PlayerList;