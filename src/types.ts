// Type pour les informations utilisateur
export interface User {
  id: string;
  username: string;
  discordId?: string;
  avatar?: string;
  discriminator?: string;
  accessToken: string;
  refreshToken: string;
  // Ajoutez d'autres propriétés selon les besoins
}

export interface LobbyData {
  _id: string;
  name: string;
  owner: User;
  players: User[];
  // maxPlayers: number;
  code: string;
  isPublic: boolean;
  activeQuizz?: Quizz | null;
  // Ajoutez d'autres champs si nécessaire, comme l'état du quiz
}

export interface CreateQuizFormData {
  gameMode: string;
  pointsToReach?: number;
  maxLives?: number;
}

export interface Quizz {
  _id: string;
  questions: Question[]; // IDs des questions
  lobby: string; // ID du lobby
  gameMode: string; // Mode de jeu (points, battle royal, etc.)
  pointsToReach?: number; // Seulement pour le mode "points"
  playerPoints?: Record<string, number>; // Points des joueurs
  maxLives?: number; // Seulement pour le mode "battle royal"
  playerLives?: Record<string, number>; // Vies des joueurs
  createdAt: string;
  updatedAt: string;
  questionIndex: number; // Index de la question actuelle
  status: string; // Statut du quiz (not_started, in_progress, finished)
}

export interface Question {
  _id: string;
  question: string;
  answer: string;
  options: string[];
  type: QuestionType;
  category: QuestionCategory;
  difficulty: string;
}

export interface QuestionType {
  _id: string;
  type: string;
}

export interface QuestionCategory {
  _id: string;
  category: string;
}

export type QuizzPhase = 'answering' | 'waiting_for_correction' | 'showing_correction' | 'round_over' | 'game_over';