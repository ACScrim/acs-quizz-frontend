import { createPortal } from 'react-dom';
import { Quizz, User } from '../../types';

interface LastQuizzModalLeaderboardProps {
  show?: boolean;
  onClose?: () => void;
  quizz: Quizz | null; // Remplacez 'any' par le type approprié pour votre quizz
  players: User[]
}

const LastQuizzModalLeaderboard = ({ show, onClose, quizz, players }: LastQuizzModalLeaderboardProps) => {
  if (!show || !quizz) return null;

  // Trier les joueurs par score (décroissant) ou par vies (décroissant)
  const sortedPlayerIds = Object.keys(quizz.playerPoints || quizz.playerLives || {}).sort((a, b) => {
    if (quizz.playerPoints) {
      return (quizz.playerPoints[b] || 0) - (quizz.playerPoints[a] || 0);
    }
    if (quizz.playerLives) {
      return (quizz.playerLives[b] || 0) - (quizz.playerLives[a] || 0);
    }
    return 0;
  });

  return createPortal(
    <div className='fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm p-4'>
      <div className='relative group w-full max-w-lg'>
        {/* Effet de bordure néon animé */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        
        <div className='relative bg-gray-900 bg-opacity-90 border-2 border-purple-700 rounded-xl shadow-2xl p-6 sm:p-8 text-white'>
          <h2 className='cyberpunk-font text-3xl sm:text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 neon-text-strong'>
            {quizz.gameMode === 'battleRoyal' ? 'Survivors' : 'Leaderboard'}
          </h2>
          
          <ul className='space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar'>
            {sortedPlayerIds.map((playerId, index) => {
              const player = players.find(p => p.id === playerId);
              const score = quizz.playerPoints ? quizz.playerPoints[playerId] : undefined;
              const lives = quizz.playerLives ? quizz.playerLives[playerId] : undefined;
              const isCurrentUser = player?.id === /* TODO: Get current user ID from context or props */ ''; 

              return (
                <li 
                  key={playerId} 
                  className={`flex justify-between items-center p-3 rounded-md border border-gray-700 transition-all duration-200
                              ${isCurrentUser ? 'bg-purple-600 bg-opacity-30 border-purple-500 shadow-lg' : 'bg-gray-800 bg-opacity-70 hover:bg-gray-700'}`}
                >
                  <div className="flex items-center">
                    <span className={`cyberpunk-font text-lg mr-3 w-6 text-center ${index < 3 ? 'text-yellow-400 neon-text' : 'text-gray-400'}`}>
                      {index + 1}.
                    </span>
                    <img 
                      src={player?.avatar ? `https://cdn.discordapp.com/avatars/${player.discordId}/${player.avatar}.png` : '/default-profile.png'} 
                      alt={player?.username || 'Player'} 
                      className="w-8 h-8 rounded-full mr-3 border-2 border-cyan-500"
                    />
                    <span className={`cyberpunk-font text-xl ${isCurrentUser ? 'text-pink-400 font-semibold' : 'text-cyan-300'}`}>
                      {player?.username || 'Unknown Player'}
                    </span>
                  </div>
                  {score !== undefined && (
                    <span className='cyberpunk-font text-xl text-pink-400 neon-text-strong'>{score} pts</span>
                  )}
                  {lives !== undefined && (
                    <span className={`cyberpunk-font text-xl ${lives > 0 ? 'text-green-400' : 'text-red-500'} neon-text-strong`}>
                      {lives} {lives === 1 ? 'vie' : 'vies'}
                    </span>
                  )}
                </li>
              );
            })}
            {sortedPlayerIds.length === 0 && (
              <p className="text-center text-gray-400 py-4">No scores to display yet.</p>
            )}
          </ul>

          <button
            onClick={onClose}
            className='mt-8 w-full py-3 px-6 cyberpunk-font uppercase tracking-wider
                       bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 
                       text-white font-bold rounded-lg transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75
                       shadow-[0_0_10px_rgba(6,182,212,0.5),_0_0_10px_rgba(192,38,211,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7),_0_0_15px_rgba(192,38,211,0.7)]'
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
    'last-quizz-modal-leaderboard'
  );
};

export default LastQuizzModalLeaderboard;
