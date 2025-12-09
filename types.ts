export interface Player {
  id: string;
  name: string;
  joinedAt: number;
}

export enum MatchStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  score1: number | null;
  score2: number | null;
  status: MatchStatus;
  timestamp: number;
}

export interface PlayerStats {
  id: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type ViewState = 'dashboard' | 'players' | 'matches' | 'rankings';
