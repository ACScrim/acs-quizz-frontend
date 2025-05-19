import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LobbyActions from "../components/LobbyActions";
import LobbyDetails from "../components/LobbyDetails";
import Navbar from "../components/Navbar";
import PlayerList from "../components/PlayerList";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { CreateQuizFormData, LobbyData, Quizz } from "../types";
import { useSocket } from "../hooks/useSocket";

const LobbyPage: React.FC = () => {
  const { id: lobbyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const api = useApi();

  const socket = useSocket({ namespace: "lobbies" });

  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLobbyData = async () => {
    if (!api || !lobbyId) return;
    setIsLoading(true);
    try {
      const response = await api.get<LobbyData>(`/lobbies/${lobbyId}`);
      if (response.data) {
        const responseQuizz = await api.get<Quizz>(`/quizzes/lobby/${lobbyId}`);
        if (responseQuizz.data) {
          response.data.activeQuizz = responseQuizz.data;
        }

        setLobbyData(response.data);
      } else {
        setError('Lobby not found or access denied.');
        // Optionnel: rediriger après un délai
        // setTimeout(() => navigate('/'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lobby data.');
      // setTimeout(() => navigate('/'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbyData();
  }, [lobbyId]);

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
        setLobbyData((prev) => ({
          ...prev!,
          activeQuizId: quizz._id,
        }));
      }
    });

    socket.on("lobby:quizz-started", () => {

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
  };

  const handleGenerateQuiz = async (formData: CreateQuizFormData) => {
    if (!lobbyData) return;

    const quizDtoPayload = {
      lobby: lobbyData._id,
      questions: [], // Toujours un tableau vide comme demandé
      gameMode: formData.gameMode,
      ...(formData.gameMode === 'points' && { pointsToReach: formData.pointsToReach }),
      ...(formData.gameMode === 'battleRoyal' && { maxLives: formData.maxLives }),
    };

    if (!socket || !lobbyId) return;
    socket.emit("lobby:generate:quizz", quizDtoPayload);
  };

  const handleStartQuiz = () => {
    if (!socket || !lobbyData || !lobbyData.activeQuizz) return;
    console.log("Attempting to start quiz:", lobbyData.activeQuizz._id);
    socket.emit("lobby:start:quizz", { lobbyId: lobbyData._id, quizId: lobbyData.activeQuizz._id });
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

  if (error || !lobbyData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4">
        <Navbar /> {/* Garder la navigation même en cas d'erreur */}
        <p className="cyberpunk-font text-3xl text-pink-500 neon-text-strong mb-4">CONNECTION ERROR</p>
        <p className="text-xl text-purple-300 mb-8">{error || 'Lobby data unavailable.'}</p>
        <button
          onClick={() => navigate('/')}
          className="py-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-gray-900 font-bold rounded-md transition-all duration-300 uppercase tracking-wider"
        >
          Return to Grid
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === lobbyData.owner.id;
  const hasActiveQuiz = !!lobbyData.activeQuizz;

  return (
    // Le fond est géré par App.tsx, donc ici on se concentre sur le contenu
    <div className="relative z-10 px-8 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Colonne principale (Détails et Actions) */}
        <div className="lg:col-span-2 space-y-6">
          <LobbyDetails
            name={lobbyData.name}
            ownerName={lobbyData.owner.username}
            playerCount={lobbyData.players.length}
            maxPlayers={100}
            lobbyCode={lobbyData.code}
          />
          <LobbyActions
            isOwner={isOwner}
            onGenerateQuiz={handleGenerateQuiz}
            onLeaveLobby={handleLeaveLobby}
            lobbyId={lobbyData._id}
            hasActiveQuiz={hasActiveQuiz}
            onStartQuiz={handleStartQuiz}
            activeQuizDetails={lobbyData.activeQuizz}
          />
        </div>

        {/* Colonne latérale (Liste des joueurs) */}
        <div className="lg:col-span-1">
          <PlayerList players={lobbyData.players} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;