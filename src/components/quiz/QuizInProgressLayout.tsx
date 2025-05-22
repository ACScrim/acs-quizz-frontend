import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Question, QuizzPhase, User } from '../../types'; // Assurez-vous que les types sont corrects

interface QuizInProgressLayoutProps {
  question: Question | undefined;
  questionNumber: number;
  totalQuestions: number;
  onSelectAnswer: (answer: string) => void; // ou answerIndex: number
  isAnsweringAllowed: boolean; // Pour désactiver les boutons après réponse ou si ce n'est pas le tour du joueur
  timeLeft: number; // Optionnel: pour un minuteur
  children?: React.ReactNode; // Pour afficher des infos spécifiques au mode de jeu
  playersList: User[];
  playersListData: Record<string, number>;
  gameMode: 'points' | 'battleRoyal' | string;

  // Nouvelles props pour l'état d'affichage
  quizzPhase: QuizzPhase;
  selectedAnswerId: string | null; // Réponse sélectionnée localement par le joueur
  revealedCorrectAnswerId: string | null; // La bonne réponse à surligner
  playerSubmittedAnswerId: string | null; // La réponse du joueur à surligner
}

const QuizInProgressLayout: React.FC<QuizInProgressLayoutProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSelectAnswer,
  timeLeft,
  children,
  playersList,
  playersListData,
  gameMode,
  quizzPhase,
  selectedAnswerId, // anciennement playerLocalAnswer
  revealedCorrectAnswerId,
  playerSubmittedAnswerId,
}) => {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser ? currentUser.id : null;
  // const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  // Réinitialiser la réponse sélectionnée quand la question change
  // React.useEffect(() => {
  //   setSelectedAnswerId(null);
  // }, [question?._id]);


  const handleAnswerClick = (answer: string) => {
    if (quizzPhase === 'answering') {
      onSelectAnswer(answer); // Utiliser l'ID de l'option de réponse
    }
  };

  const sortedPlayers = useMemo(() => {
    // Use playersListData to sort players and get their names and avatar in playersList
    const playersWithScores = [];
    for (const player of playersList) {
      const playerId = player.id;
      const playerScore = playersListData[playerId];
      if (playerScore !== undefined) {
        let isEliminated = false;
        switch (gameMode) {
          case 'battleRoyal':
            isEliminated = playerScore === 0; // Éliminé si score <= 0
            break;
          default:
            isEliminated = false;
            break;
        }
        playersWithScores.push({
          ...player,
          value: playerScore,
          isEliminated, // Si le joueur est éliminé
        });
      }
    }

    return playersWithScores.sort((a, b) => {
      if (gameMode === 'points') {
        return b.value - a.value; // Tri par points décroissants
      } else if (gameMode === 'battleRoyal') {
        return a.value - b.value; // Tri par vies croissants
      }
      return 0; // Par défaut, pas de tri
    });
  }, [playersList, playersListData, gameMode]);

  const isAnsweringPhase = quizzPhase === 'answering';

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 max-w-7xl mx-auto">
      {/* Colonne principale : Question et Réponses */}
      <div className="flex-grow lg:w-2/3">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-600 via-purple-700 to-pink-600 rounded-2xl blur opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-300 animate-tilt"></div>
          <div className="relative bg-gray-900 bg-opacity-90 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border-2 border-purple-700 shadow-2xl">
            {/* Header de la question */}
            <div className="mb-6 text-center">
              <p className="text-sm text-purple-300 uppercase tracking-wider cyberpunk-font">
                Question {questionNumber} / {totalQuestions}
              </p>
              {/* Afficher le minuteur */}
              <p className={`text-3xl font-mono neon-text-strong animate-pulse ${timeLeft <= 3 && isAnsweringPhase ? 'text-red-500' : 'text-pink-400'}`}>
                {timeLeft}s
              </p>
            </div>

            {/* Texte de la question */}
            {!question ? (
              <div className="text-center py-12 min-h-[60px]">
                <p className="text-xl text-pink-400 cyberpunk-font">Awaiting next transmission (question)...</p>
              </div>
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan-200 mb-8 leading-tight text-center min-h-[60px]">
                {question.question} {/* Assurez-vous que c'est bien question.text */}
              </h2>
            )}

            {/* Options de réponse */}
            {question && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswerId === option;
                  const isCorrect = revealedCorrectAnswerId === option;
                  const isPlayerSubmission = playerSubmittedAnswerId === option;

                  let buttonClass = 'bg-gray-800 border-purple-600 hover:border-cyan-500 text-purple-200 hover:text-cyan-100';
                  if (quizzPhase === 'showing_correction') {
                    if (isCorrect) {
                      buttonClass = 'bg-green-700 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.7)] scale-105';
                    } else if (isPlayerSubmission) { // La réponse soumise par le joueur, si elle n'est pas la bonne
                      buttonClass = 'bg-red-700 border-red-500 text-white opacity-70';
                    } else { // Les autres options non correctes et non soumises
                      buttonClass = 'bg-gray-800 border-gray-700 text-gray-500 opacity-60';
                    }
                  } else if (isSelected && isAnsweringPhase) { // Sélectionné par le joueur pendant la phase de réponse
                    buttonClass = 'bg-pink-600 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.7)] scale-105';
                  }

                  return (
                    <button
                      key={option || index}
                      onClick={() => handleAnswerClick(option)}
                      // Désactiver si ce n'est pas la phase de réponse ou si la correction est affichée
                      disabled={!isAnsweringPhase}
                      className={`
                            p-4 rounded-lg border-2 transition-all duration-200 ease-in-out
                            text-left text-lg font-medium cyberpunk-font focus:outline-none group/answer
                            ${buttonClass}
                            ${!isAnsweringPhase ? 'cursor-not-allowed opacity-70' : ''}
                        `}
                    >
                      <span className="mr-2 text-pink-400 group-hover/answer:text-cyan-300 transition-colors">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Espace pour les informations spécifiques au mode de jeu (sous la question) */}
            {children && <div className="mt-6 border-t-2 border-purple-800 pt-6">{children}</div>}
          </div>
        </div>
      </div>

      {/* Colonne latérale : Liste des Joueurs */}
      <div className="lg:w-1/3">
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-600 via-purple-700 to-cyan-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-300 animate-tilt"></div>
          <div className="relative bg-gray-900 bg-opacity-80 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-pink-700 shadow-xl h-full">
            <h3 className="text-xl font-bold cyberpunk-font text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 neon-text mb-4 text-center uppercase tracking-wider">
              Leaderboard
            </h3>
            {sortedPlayers.length > 0 ? (
              <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                {sortedPlayers.map((player) => (
                  <li
                    key={player.id}
                    className={`
                      flex justify-between items-center p-2.5 rounded-md transition-all duration-300 border
                      ${player.id === currentUserId
                        ? 'bg-purple-800 bg-opacity-60 border-pink-500 shadow-md'
                        : 'bg-gray-800 bg-opacity-50 border-purple-700 hover:border-cyan-600'
                      }
                      ${player.isEliminated ? 'opacity-50' : ''}
                    `}
                  >
                    <span className={`font-medium text-base truncate ${player.id === currentUserId ? 'text-pink-300' : 'text-cyan-200'}`}>
                      {player.username}
                      {player.isEliminated && <span className="text-red-400 ml-1 text-xs">(KO)</span>}
                    </span>
                    <span className={`font-semibold text-base ${player.id === currentUserId ? 'text-pink-300' : (gameMode === 'battleRoyal' && player.value <= 1 ? 'text-red-400 neon-text' : 'text-cyan-200')}`}>
                      {player.value} {gameMode === 'points' ? 'Pts' : (player.value === 1 ? 'Vie' : 'Vies')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-purple-300 cyberpunk-font">Awaiting player data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInProgressLayout;