// Type pour les informations utilisateur
export interface User {
  id: string;
  username: string;
  discordId?: string;
  avatar?: string;
  discriminator?: string;
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
  questions: string[]; // IDs des questions
  lobby: string; // ID du lobby
  gameMode: string; // Mode de jeu (points, battle royal, etc.)
  pointsToReach?: number; // Seulement pour le mode "points"
  playerPoints?: Record<string, number>; // Points des joueurs
  maxLives?: number; // Seulement pour le mode "battle royal"
  playerLives?: Record<string, number>; // Vies des joueurs
  createdAt: string;
  updatedAt: string;
}
