import React from 'react';
import { Quizz, QuizzPhase, User } from '../../types';
import QuizInProgressLayout from './QuizInProgressLayout';

interface BattleRoyalQuizViewProps {
  quizz: Quizz;
  currentUser: User | null;
  questionIndex: number;
  onSelectAnswer: (answer: string) => void;
  playersList: User[]; // Liste des joueurs dans le lobby
  timeLeft: number;
  quizzPhase: QuizzPhase;
  selectedAnswerId: string | null;
  revealedCorrectAnswerId: string | null;
  playerSubmittedAnswerId: string | null;
  // Ajoutez d'autres props si nécessaire, comme isAnsweringAllowed
}

const BattleRoyalQuizView: React.FC<BattleRoyalQuizViewProps> = ({
  quizz,
  currentUser,
  questionIndex,
  onSelectAnswer,
  playersList,
  timeLeft,
  quizzPhase,
  selectedAnswerId,
  revealedCorrectAnswerId,
  playerSubmittedAnswerId,
}) => {
  const currentQuestion = quizz.questions[questionIndex];
  const totalQuestions = quizz.questions.length; // Ou une autre logique si le nombre de questions est dynamique

  const currentUserLives = currentUser && quizz.playerLives ? quizz.playerLives[currentUser.id] : quizz.maxLives;

  // TODO: Logique pour déterminer si le joueur peut répondre (pas éliminé, etc.)
  const isAnsweringAllowed = currentUserLives !== undefined && currentUserLives > 0;

  return (
    <div className="container mx-auto py-8">
      <QuizInProgressLayout
        question={currentQuestion}
        questionNumber={questionIndex + 1}
        totalQuestions={totalQuestions}
        isAnsweringAllowed={isAnsweringAllowed}
        playersList={playersList}
        playersListData={quizz.playerLives!}
        gameMode='battleRoyal'
        onSelectAnswer={onSelectAnswer}
        timeLeft={timeLeft}
        quizzPhase={quizzPhase}
        selectedAnswerId={selectedAnswerId}
        revealedCorrectAnswerId={revealedCorrectAnswerId}
        playerSubmittedAnswerId={playerSubmittedAnswerId}
      >
        {/* Informations spécifiques au Battle Royal */}
        <div className="text-center">
          <h3 className="text-xl text-pink-400 cyberpunk-font mb-2">Battle Royal Mode</h3>
          {currentUser && (
            <p className="text-2xl font-bold">
              <span className="text-purple-300">Vies restantes : </span>
              <span className="text-cyan-300 neon-text-strong animate-pulse">
                {currentUserLives ?? 'N/A'} / {quizz.maxLives}
              </span>
            </p>
          )}
          {/* TODO: Afficher la liste des autres joueurs et leur statut (vies) si nécessaire */}
        </div>
      </QuizInProgressLayout>
    </div>
  );
};

export default BattleRoyalQuizView;