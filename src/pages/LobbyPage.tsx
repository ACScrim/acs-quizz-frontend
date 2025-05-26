import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LobbyActions from "../components/LobbyActions";
import LobbyDetails from "../components/LobbyDetails";
import Navbar from "../components/Navbar";
import PlayerList from "../components/PlayerList";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import { CreateQuizFormData, LobbyData, Quizz, QuizzPhase } from "../types";
import QuizErrorView from "../components/quiz/QuizErrorView";
import BattleRoyalQuizView from "../components/quiz/BattleRoyalQuizView";
import PointsQuizView from "../components/quiz/PointsQuizView";
import LastQuizzModalLeaderboard from "../components/quiz/LastQuizzModalLeaderboard";

const ROUND_DURATION = 10; // secondes pour répondre
const CORRECTION_DISPLAY_DURATION = 3; // secondes pour afficher la correction

const LobbyPage: React.FC = () => {
  const { id: lobbyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const api = useApi();
  const queryClient = useQueryClient();

  const [joinedSocketLobby, setJoinedSocketLobby] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [quizzPhase, setQuizzPhase] = useState<QuizzPhase>('answering');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [playerLocalAnswer, setPlayerLocalAnswer] = useState<string | null>(null);
  const [revealedCorrectAnswerId, setRevealedCorrectAnswerId] = useState<string | null>(null);
  const [playerSubmittedAnswerForDisplay, setPlayerSubmittedAnswerForDisplay] = useState<string | null>(null);
  const [showLastQuizzModalLeaderboard, setShowLastQuizzModalLeaderboard] = useState<Quizz | null>(null);


  const socket = useSocket({ namespace: "lobbies" });

  const { data: lobby, refetch: refetchLobby, isLoading, error } = useQuery<LobbyData | null>({
    queryKey: ["lobby", lobbyId, isAuthenticated],
    queryFn: async () => {
      if (!api || !isAuthenticated) return null;
      const response = await api.get<LobbyData>(`/lobbies/${lobbyId}`);
      if (response.error) {
        console.error("Error fetching lobby:", response.error);
        return null;
      }
      if (response.data?.activeQuizz) {
        // Initialiser l'index de la question et la phase si le quiz est déjà en cours
        setQuestionIndex(response.data.activeQuizz.questionIndex || 0);
        if (response.data.activeQuizz.status === 'in_progress') {
          setQuizzPhase('answering');
          setTimeLeft(ROUND_DURATION);
        } else if (response.data.activeQuizz.status === 'finished') {
          setQuizzPhase('game_over');
        }
      }
      return response.data;
    },
    // Désactiver le refetch automatique pour mieux contrôler avec les sockets
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const currentQuiz = lobby?.activeQuizz;
  const isOwner = currentUser?.id === lobby?.owner.id;

  useEffect(() => {
    if (!currentUser || !currentQuiz) return;
    if (currentQuiz.playerLives && Object.keys(currentQuiz.playerLives).length === 1) {
      if (currentQuiz.playerLives[currentUser.id] === 0) {
        // Si le joueur est le seul restant et qu'il n'a plus de vies, on termine le quiz
        socket?.emit("lobby:stop:quizz", lobbyId);
        console.log("You are the last player with no lives left. Ending quiz.");
      }
    }
  }, [currentQuiz, currentUser])

  // Minuteur principal du jeu
  useEffect(() => {
    if (!currentQuiz || currentQuiz.status !== 'in_progress' || quizzPhase === 'game_over') {
      return () => {
        // Nettoyage si nécessaire, mais le timerId est déjà nettoyé
      };
    }

    // Gérer la fin de la phase d'affichage de la correction
    if (timeLeft <= 0 && quizzPhase === 'showing_correction') {
      setQuizzPhase('round_over');
      setRevealedCorrectAnswerId(null);
      setPlayerSubmittedAnswerForDisplay(null); // Effacer la réponse soumise pour l'affichage

      if (isOwner) {
        console.log("Correction time's up. Requesting next question...");
        socket?.emit("lobby:quizz:next-question", { lobbyId: lobbyId, quizId: currentQuiz._id });
      }
      return () => { /* clearInterval(timerId) sera fait par le return principal */ };
    }

    // Si le temps est écoulé pour une autre phase ou si on n'est pas dans une phase avec timer actif, ne rien faire ici.
    if (timeLeft <= 0) {
      return () => { /* clearInterval(timerId) sera fait par le return principal */ };
    }

    const timerId = setInterval(() => {
      if (quizzPhase === "showing_correction") {
        setTimeLeft((prevTime) => Math.max(0, prevTime - 1)); // S'assurer que le temps ne devient pas négatif
      }
    }, 1000);

    return () => { clearInterval(timerId) }; // Nettoyer l'intervalle
  }, [timeLeft, quizzPhase, currentQuiz, socket, lobbyId, isOwner]); // playerLocalAnswer retiré des dépendances


  useEffect(() => {
    if (!socket || !lobby || !currentUser) return;
    if (!socket.connected) socket.connect();

    // Rejoindre la room du lobby à chaque (re)connexion
    if (!joinedSocketLobby && currentUser) {
      socket.emit("lobby:join", lobbyId);
    }

    // Gérer la réception d'une nouvelle question (ou la première)
    const handleNewQuestion = (quizzData: Quizz) => {
      queryClient.setQueryData(["lobby", lobbyId, isAuthenticated], (oldData: LobbyData | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, activeQuizz: quizzData };
      });
      setQuestionIndex(quizzData.questionIndex);
      setQuizzPhase('answering');
      setTimeLeft(ROUND_DURATION);
      setPlayerLocalAnswer(null);
      setRevealedCorrectAnswerId(null);
      setPlayerSubmittedAnswerForDisplay(null);
      console.log("New question received, index:", quizzData.questionIndex);
    };

    // NOUVEAU HANDLER : Le serveur indique que le temps de réponse est écoulé
    const handleAnsweringTimeUp = () => {
      if (quizzPhase === 'answering') { // S'assurer qu'on est bien dans cette phase
        console.log("Server says time's up! Submitting local answer:", playerLocalAnswer);
        socket?.emit("lobby:quizz:submit-answer", {
          lobbyId: lobbyId,
          quizId: currentQuiz?._id,
          answer: playerLocalAnswer, // Peut être null
        });
        setPlayerSubmittedAnswerForDisplay(playerLocalAnswer); // Garder une trace pour l'affichage
        // playerLocalAnswer n'est pas réinitialisé ici, car il a déjà été soumis.
        // Il sera réinitialisé à la prochaine question.
        setQuizzPhase('waiting_for_correction'); // Attendre que le serveur envoie les résultats
      }
    };

    // Gérer la fin du quiz
    const handleQuizFinished = (finishedQuizData: Quizz) => {
      queryClient.setQueryData(["lobby", lobbyId, isAuthenticated], (oldData: LobbyData | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, activeQuizz: null };
      });
      setQuizzPhase('game_over');
      setShowLastQuizzModalLeaderboard(finishedQuizData); // Afficher le modal de fin de quiz
      console.log("Quiz finished!");
    };

    const handleAnswerResult = (data: { isCorrect: boolean, correctAnswer: string }) => {
      console.log("Answer result received:", data);
      setRevealedCorrectAnswerId(data.correctAnswer);
      // playerSubmittedAnswerForDisplay est déjà défini au moment de la soumission
      setQuizzPhase('showing_correction');
      setTimeLeft(CORRECTION_DISPLAY_DURATION);
    };

    const handleScoresUpdate = (data: { playerPoints?: Record<string, number>; playerLives?: Record<string, number>; }) => {
      console.log("Scores updated:", data);
      queryClient.setQueryData(["lobby", lobbyId, isAuthenticated], (oldData: LobbyData | undefined) => {
        if (!oldData || !oldData.activeQuizz) return oldData;
        return {
          ...oldData,
          activeQuizz: {
            ...oldData.activeQuizz,
            playerPoints: data.playerPoints || oldData.activeQuizz.playerPoints,
            playerLives: data.playerLives || oldData.activeQuizz.playerLives,
          },
        };
      });
    };

    const handleAnsweringTimeLeft = (timeLeft: number) => {
      console.log("Time left for answering:", timeLeft);
      setTimeLeft(timeLeft);
    }

    const handleLobbyJoined = ({ quizz, lobbyId, timeLeft }: { quizz: Quizz, lobbyId: string, timeLeft: number }) => {
      console.log("Joined lobby:", lobbyId, "with quiz:", quizz);
      queryClient.setQueryData(["lobby", lobbyId, isAuthenticated], (oldData: LobbyData | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, activeQuizz: quizz };
      });
      setTimeLeft(timeLeft)
      setJoinedSocketLobby(true);
    }

    // ... (autres listeners: user-join, user-leave, lobby-left, quizz-generated)
    socket.on("lobby:quizz-generated", () => refetchLobby()); // ou mise à jour ciblée
    socket.on("lobby:quizz-started", handleNewQuestion); // Le démarrage est comme une nouvelle question (la première)
    socket.on("lobby:quizz-stopped", handleQuizFinished)
    socket.on("lobby:quizz:new-question", handleNewQuestion); // Pour les questions suivantes
    socket.on("lobby:quizz:answer-result", handleAnswerResult);
    socket.on("lobby:quizz:update-scores", handleScoresUpdate);
    socket.on("lobby:quizz:answering-time-up", handleAnsweringTimeUp);
    socket.on("lobby:quizz:answering-time-left", handleAnsweringTimeLeft);
    socket.on("lobby:joined", handleLobbyJoined);


    return () => {
      // ... (socket.off pour tous les listeners)
      socket.off("lobby:quizz-generated");
      socket.off("lobby:quizz-started", handleNewQuestion);
      socket.off("lobby:quizz-stopped", handleQuizFinished);
      socket.off("lobby:quizz:new-question", handleNewQuestion);
      socket.off("lobby:quizz:answer-result", handleAnswerResult);
      socket.off("lobby:quizz:update-scores", handleScoresUpdate);
      socket.off("lobby:quizz:answering-time-up", handleAnsweringTimeUp);
      socket.off("lobby:quizz:answering-time-left", handleAnsweringTimeLeft);
      socket.off("lobby:joined", handleLobbyJoined);
    };
  }, [socket, lobby, lobbyId, queryClient, refetchLobby, isAuthenticated, currentQuiz, playerLocalAnswer, quizzPhase, isOwner, joinedSocketLobby, currentUser]);

  const handleSelectAnswer = (answerId: string) => {
    if (quizzPhase === 'answering') {
      setPlayerLocalAnswer(answerId);
    }
  };

  const handleLeaveLobby = async () => {
    if (!socket || !lobbyId) return;
    socket.emit("lobby:leave", lobbyId);
    queryClient.invalidateQueries({ queryKey: ["lobbies", "mine", isAuthenticated] })
  };

  const handleGenerateQuiz = async (formData: CreateQuizFormData) => {
    if (!lobby) return;

    const quizDtoPayload = {
      lobby: lobby._id,
      questions: [], // Toujours un tableau vide comme demandé
      gameMode: formData.gameMode,
      ...(formData.gameMode === 'points' && { pointsToReach: formData.pointsToReach }),
      ...(formData.gameMode === 'battleRoyal' && { maxLives: formData.maxLives }),
    };

    if (!socket || !lobbyId) return;
    socket.emit("lobby:generate:quizz", quizDtoPayload);
  };

  const handleStartQuiz = () => {
    if (!socket || !lobby || !lobby.activeQuizz || !isOwner) return;
    socket.emit("lobby:start:quizz", { lobbyId: lobby._id, quizId: lobby.activeQuizz._id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="cyberpunk-font text-2xl text-cyan-400 neon-text">Loading Transmission...</p>
        {/* Vous pouvez ajouter un spinner/loader stylisé ici */}
      </div>
    );
  }

  if (error || !lobby) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4">
        <Navbar /> {/* Garder la navigation même en cas d'erreur */}
        <p className="cyberpunk-font text-3xl text-pink-500 neon-text-strong mb-4">CONNECTION ERROR</p>
        <p className="text-xl text-purple-300 mb-8">{error?.message || 'Lobby data unavailable.'}</p>
        <button
          onClick={() => navigate('/')}
          className="py-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-gray-900 font-bold rounded-md transition-all duration-300 uppercase tracking-wider"
        >
          Return to Grid
        </button>
      </div>
    );
  }

  if (currentQuiz && (currentQuiz.status === "in_progress" || currentQuiz.status === "pending" && quizzPhase !== 'game_over')) {
    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
      return <QuizErrorView message="Quiz questions are not loaded." />;
    }
    // Si le quiz est 'pending' mais que le propriétaire n'a pas encore cliqué sur "Start",
    // on pourrait afficher un écran d'attente différent pour les joueurs et un bouton "Start" pour le propriétaire.
    // Pour l'instant, on assume que si activeQuizz existe, on essaie de montrer l'interface du quiz.

    // Si le quiz est terminé, afficher un écran de résultats/fin
    if (quizzPhase === 'game_over') {
      // TODO: Créer un composant QuizResultsView
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4">
          <Navbar />
          <h2 className="cyberpunk-font text-3xl text-pink-500 neon-text-strong mb-4">QUIZ TERMINÉ !</h2>
          {/* Afficher les scores finaux ici, en utilisant currentQuiz.playerPoints/playerLives */}
          <button
            onClick={() => navigate(`/lobby/${lobbyId}`)} // Revenir au lobby ou à la liste des lobbies
            className="mt-8 py-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-gray-900 font-bold rounded-md transition-all duration-300 uppercase tracking-wider"
          >
            Retour au Lobby
          </button>
        </div>
      );
    }


    const questionData = currentQuiz.questions[questionIndex];
    if (!questionData && currentQuiz.status === "in_progress") {
      // Cela peut arriver brièvement si questionIndex est mis à jour avant que les données du quiz ne le soient complètement
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <p className="cyberpunk-font text-2xl text-cyan-400 neon-text">Synchronizing question...</p>
        </div>
      );
    }


    const commonQuizProps = {
      quizz: currentQuiz,
      currentUser: currentUser,
      questionIndex: questionIndex,
      onSelectAnswer: handleSelectAnswer,
      timeLeft: timeLeft,
      quizzPhase: quizzPhase, // Passez la phase actuelle
      selectedAnswerId: playerLocalAnswer,
      revealedCorrectAnswerId: revealedCorrectAnswerId,
      playerSubmittedAnswerId: playerSubmittedAnswerForDisplay,
      playersList: lobby.players, // Assurez-vous que c'est le bon format attendu par les vues
    };

    if (currentQuiz.gameMode === "battleRoyal") {
      return <BattleRoyalQuizView {...commonQuizProps} />;
    } else if (currentQuiz.gameMode === "points") {
      return <PointsQuizView {...commonQuizProps} />;
    } else {
      return <QuizErrorView message={`Unknown quiz game mode: ${currentQuiz.gameMode}`} />;
    }
  }

  // ... (Rendu du lobby normal si pas de quiz actif ou si le quiz est 'pending' et non démarré par l'owner)
  // Vous devrez peut-être ajuster cette logique pour afficher correctement LobbyActions
  // même si un quiz est 'pending'.

  return (
    <div className="relative z-10 px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <LobbyDetails
            name={lobby?.name || "Loading..."}
            ownerName={lobby?.owner.username || "N/A"}
            playerCount={lobby?.players.length || 0}
            maxPlayers={100} // ou lobby.maxPlayers
            lobbyCode={lobby?.code || "N/A"}
          />
          <LobbyActions
            isOwner={isOwner}
            onGenerateQuiz={handleGenerateQuiz}
            onLeaveLobby={handleLeaveLobby}
            lobbyId={lobbyId!}
            hasActiveQuiz={!!currentQuiz}
            onStartQuiz={handleStartQuiz}
            activeQuizDetails={currentQuiz ? { gameMode: currentQuiz.gameMode, pointsToReach: currentQuiz.pointsToReach, maxLives: currentQuiz.maxLives } : null}
          />
        </div>
        <div className="lg:col-span-1">
          <PlayerList players={lobby?.players || []} currentUser={currentUser} />
        </div>
      </div>
      <LastQuizzModalLeaderboard 
        quizz={showLastQuizzModalLeaderboard}
        players={lobby.players}
        show={!!showLastQuizzModalLeaderboard}
        onClose={() => setShowLastQuizzModalLeaderboard(null)}
      />
    </div>
  );
};

export default LobbyPage;