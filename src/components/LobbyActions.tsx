import React, { useState } from 'react';
import { CreateQuizFormData, Quizz } from '../types'; // Assurez-vous que Quizz est importé depuis vos types

// Simule les valeurs de l'enum GAMEMODES du backend
const GAMEMODES = {
  POINTS: 'points',
  BATTLE_ROYAL: 'battleRoyal',
};

interface LobbyActionsProps {
  isOwner: boolean;
  hasActiveQuiz: boolean;
  activeQuizDetails?: Pick<Quizz, 'gameMode' | 'pointsToReach' | 'maxLives'> | null; // Détails du quiz actif
  onGenerateQuiz: (formData: CreateQuizFormData) => void;
  onLeaveLobby: () => void;
  onStartQuiz: () => void; // Nouvelle prop pour démarrer le quiz
  lobbyId: string;
}

const LobbyActions: React.FC<LobbyActionsProps> = ({
  isOwner,
  hasActiveQuiz,
  activeQuizDetails,
  onGenerateQuiz,
  onLeaveLobby,
  onStartQuiz,
}) => {
  const [gameMode, setGameMode] = useState<string>(GAMEMODES.POINTS);
  const [pointsToReach, setPointsToReach] = useState<number>(100);
  const [maxLives, setMaxLives] = useState<number>(3);

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: CreateQuizFormData = {
      gameMode,
    };
    if (gameMode === GAMEMODES.POINTS) {
      formData.pointsToReach = pointsToReach > 0 ? pointsToReach : 1;
    } else if (gameMode === GAMEMODES.BATTLE_ROYAL) {
      formData.maxLives = maxLives > 0 ? maxLives : 1;
    }
    onGenerateQuiz(formData);
  };

  const getGameModeDisplayName = (mode: string | undefined) => {
    if (mode === GAMEMODES.POINTS) return "Points Challenge";
    if (mode === GAMEMODES.BATTLE_ROYAL) return "Battle Royal";
    return "N/A";
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-700 to-cyan-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-300 animate-tilt"></div>
      <div className="relative bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 rounded-xl border border-pink-700 shadow-xl space-y-6">
        
        {isOwner && !hasActiveQuiz && (
          <form onSubmit={handleQuizSubmit} className="space-y-4">
            <div>
              <label htmlFor="gameMode" className="block text-purple-300 font-semibold mb-2 uppercase tracking-wider text-xs cyberpunk-glitch-small">Game Mode:</label>
              <select
                id="gameMode"
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-gray-800 bg-opacity-70 border-2 border-purple-500 text-cyan-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-600 transition-all duration-300"
              >
                <option value={GAMEMODES.POINTS}>Points Challenge</option>
                <option value={GAMEMODES.BATTLE_ROYAL}>Battle Royal</option>
              </select>
            </div>

            {gameMode === GAMEMODES.POINTS && (
              <div>
                <label htmlFor="pointsToReach" className="block text-purple-300 font-semibold mb-2 uppercase tracking-wider text-xs cyberpunk-glitch-small">Points to Reach:</label>
                <input
                  type="number"
                  id="pointsToReach"
                  value={pointsToReach}
                  onChange={(e) => setPointsToReach(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  className="w-full px-4 py-3 rounded-md bg-gray-800 bg-opacity-70 border-2 border-purple-500 text-cyan-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-600 placeholder-gray-500 transition-all duration-300"
                />
              </div>
            )}

            {gameMode === GAMEMODES.BATTLE_ROYAL && (
              <div>
                <label htmlFor="maxLives" className="block text-purple-300 font-semibold mb-2 uppercase tracking-wider text-xs cyberpunk-glitch-small">Max Lives:</label>
                <input
                  type="number"
                  id="maxLives"
                  value={maxLives}
                  onChange={(e) => setMaxLives(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  className="w-full px-4 py-3 rounded-md bg-gray-800 bg-opacity-70 border-2 border-purple-500 text-cyan-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-600 placeholder-gray-500 transition-all duration-300"
                />
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 text-white font-bold rounded-md hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-all duration-300 uppercase tracking-wider text-lg cyberpunk-font hover:scale-105 transform"
            >
              Configure Quizz Sequence
            </button>
          </form>
        )}

        {hasActiveQuiz && activeQuizDetails && (
          <div className="space-y-4 p-4 border-2 border-dashed border-purple-700 rounded-lg bg-gray-800 bg-opacity-60">
            <h3 className="text-xl font-bold cyberpunk-font text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 neon-text text-center">
              Quizz Configured
            </h3>
            <p className="text-purple-300">
              <span className="font-semibold uppercase tracking-wider text-xs">Mode:</span>
              <span className="ml-2 text-cyan-200">{getGameModeDisplayName(activeQuizDetails.gameMode)}</span>
            </p>
            {activeQuizDetails.gameMode === GAMEMODES.POINTS && activeQuizDetails.pointsToReach && (
              <p className="text-purple-300">
                <span className="font-semibold uppercase tracking-wider text-xs">Target:</span>
                <span className="ml-2 text-cyan-200">{activeQuizDetails.pointsToReach} Points</span>
              </p>
            )}
            {activeQuizDetails.gameMode === GAMEMODES.BATTLE_ROYAL && activeQuizDetails.maxLives && (
              <p className="text-purple-300">
                <span className="font-semibold uppercase tracking-wider text-xs">Condition:</span>
                <span className="ml-2 text-cyan-200">{activeQuizDetails.maxLives} Lives</span>
              </p>
            )}
            {isOwner && (
              <button
                onClick={onStartQuiz}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white font-bold rounded-md hover:shadow-[0_0_25px_rgba(34,197,94,0.8)] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-300 uppercase tracking-wider text-lg cyberpunk-font hover:scale-105 transform"
              >
                Start Game
              </button>
            )}
            {!isOwner && (
                <p className="text-center text-cyan-400 cyberpunk-font mt-3">Waiting for Host to start the game...</p>
            )}
          </div>
        )}
        
        <button
          onClick={onLeaveLobby}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-700 via-red-600 to-orange-600 text-white font-bold rounded-md hover:shadow-[0_0_20px_rgba(220,38,38,0.7)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-300 uppercase tracking-wider cyberpunk-font hover:scale-105 transform"
        >
          Disconnect from Channel
        </button>
      </div>
    </div>
  );
};

export default LobbyActions;