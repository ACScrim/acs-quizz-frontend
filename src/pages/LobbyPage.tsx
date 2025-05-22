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
import { CreateQuizFormData, LobbyData, Quizz } from "../types";

const LobbyPage: React.FC = () => {
  const { id: lobbyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const api = useApi();
  const queryClient = useQueryClient();

  // Quizz State
  const [questionIndex, setQuestionIndex] = useState(0);

  const socket = useSocket({ namespace: "lobbies" });

  const { data: lobby, refetch: refetchLobby, isLoading, error } = useQuery<LobbyData | null>({
    queryKey: ["lobby", lobbyId, isAuthenticated],
    queryFn: async () => {
      if (!api) return null;
      if (!isAuthenticated) return null;
      const response = await api.get<LobbyData>(`/lobbies/${lobbyId}`);
      if (response.error) {
        console.error("Error fetching lobby:", response.error);
        return null;
      }
      if (response.data?.activeQuizz) {
        setQuestionIndex(response.data.activeQuizz.questionIndex);
      }
      return response.data;
    },
  });

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
      return;
    }

    // Message envoyé aux autres utilisateurs du lobby
    socket.on("lobby:user-join", (user) => {

    });

    socket.on("lobby:user-leave", (user) => {

    });

    socket.on("lobby:left", () => {
      navigate('/');
    });

    socket.on("lobby:quizz-generated", (quizz: Quizz) => {
      console.log("Quizz generated:", quizz);
      if (quizz) {
        refetchLobby();
      }
    });

    socket.on("lobby:quizz-started", () => {
      setQuestionIndex(1);
    });

    return () => {
      socket.off("lobby:user-join");
      socket.off("lobby:user-leave");
      socket.off("lobby:left");
      socket.off("lobby:quizz-generated");
      socket.off("lobby:quizz-started");
    }
  }, [socket, socket?.connected]);

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
    if (!socket || !lobby || !lobby.activeQuizz) return;
    console.log("Attempting to start quiz:", lobby.activeQuizz._id);
    socket.emit("lobby:start:quizz", { lobbyId: lobby._id, quizId: lobby.activeQuizz._id });
    // La navigation sera gérée par l'événement "lobby:quizz-started"
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

  if (questionIndex > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="cyberpunk-font text-2xl text-cyan-400 neon-text">Quiz in progress... ({questionIndex} / {lobby.activeQuizz?.questions.length})</p>
        {/* Vous pouvez ajouter un composant de quiz ici */}
      </div>
    );
  }

  const isOwner = currentUser?.id === lobby.owner.id;
  const hasActiveQuiz = !!lobby.activeQuizz;

  return (
    // Le fond est géré par App.tsx, donc ici on se concentre sur le contenu
    <div className="relative z-10 px-8 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Colonne principale (Détails et Actions) */}
        <div className="lg:col-span-2 space-y-6">
          <LobbyDetails
            name={lobby.name}
            ownerName={lobby.owner.username}
            playerCount={lobby.players.length}
            maxPlayers={100}
            lobbyCode={lobby.code}
          />
          <LobbyActions
            isOwner={isOwner}
            onGenerateQuiz={handleGenerateQuiz}
            onLeaveLobby={handleLeaveLobby}
            lobbyId={lobby._id}
            hasActiveQuiz={hasActiveQuiz}
            onStartQuiz={handleStartQuiz}
            activeQuizDetails={lobby.activeQuizz}
          />
        </div>

        {/* Colonne latérale (Liste des joueurs) */}
        <div className="lg:col-span-1">
          <PlayerList players={lobby.players} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;