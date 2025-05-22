import React from 'react';
import { Quizz, QuizzPhase, User } from '../../types';
import QuizInProgressLayout from './QuizInProgressLayout';

interface PointsQuizViewProps {
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
  // Ajoutez d'autres props si nécessaire
}

const PointsQuizView: React.FC<PointsQuizViewProps> = ({
  quizz: quiz,
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
  const currentQuestion = quiz.questions[questionIndex];
  const totalQuestions = quiz.questions.length;

  const currentUserScore = currentUser && quiz.playerPoints ? quiz.playerPoints[currentUser.id] : 0;

  // TODO: Logique pour déterminer si le joueur peut répondre
  const isAnsweringAllowed = true; // À affiner

  return (
    <div className="container mx-auto py-8">
      <QuizInProgressLayout
        question={currentQuestion}
        questionNumber={questionIndex + 1}
        totalQuestions={totalQuestions}
        onSelectAnswer={onSelectAnswer}
        isAnsweringAllowed={isAnsweringAllowed}
        playersList={playersList} // Liste des joueurs à passer si nécessaire
        playersListData={quiz.playerPoints!} // Passer les points des joueurs
        gameMode='points' // Mode de jeu
        timeLeft={timeLeft}
        quizzPhase={quizzPhase}
        selectedAnswerId={selectedAnswerId}
        revealedCorrectAnswerId={revealedCorrectAnswerId}
        playerSubmittedAnswerId={playerSubmittedAnswerId}

      >
        {/* Informations spécifiques au mode Points */}
        <div className="text-center">
          <h3 className="text-xl text-pink-400 cyberpunk-font mb-2">Points Challenge</h3>
          {currentUser && (
            <p className="text-2xl font-bold">
              <span className="text-purple-300">Score : </span>
              <span className="text-cyan-300 neon-text-strong">
                {currentUserScore ?? 0}
              </span>
              <span className="text-purple-300"> / {quiz.pointsToReach} Pts</span>
            </p>
          )}
          {/* TODO: Afficher un classement des joueurs si nécessaire */}
        </div>
      </QuizInProgressLayout>
    </div>
  );
};

export default PointsQuizView;