import { statusMatch } from "@/app/(HeroSection)/agenda/types/TypesAgend";

export interface MatchTinyDetails {
  idMatch: string;
  phase: string;
  tourmentId: string;
  tournamentName: string;
  status: statusMatch;
  team1: TeamNameIdRecord;
  team2: TeamNameIdRecord;
  category: string;
}




export interface Match {
  id?: string;
  categoryId?: string;
  matchDate?: MatchDate;
  phase?: MatchPhase;
  wonTeam?: Team | null;
  lostTeam?: Team | null;
  tournament_id?: string;
  numberJourney?: number;
  status?: statusMatch;
  referee?: User | null;
  results?: MatchResults | null;
}

export interface MatchResults {
  idMatch?: string;
  homeTeam?: InfoTeamMatch;
  awayTeam?: InfoTeamMatch;
  refereeId?: string;
  matchDate?: string;
  status?: statusMatch;
}

export interface InfoTeamMatch {
  name?: string;
  id?: string;
  goalsWin?: Goals;
  goalsAgainst?: Goals;
  points?: Points;
  infoPlayerMatchStats?: PlayerMatchStats[];
}


export interface InfoTeamMatchWithoutPlayers  {
  name?: string;
  id?: string;
  goalsWin?: Goals;
  goalsAgainst?: Goals;
  points?: Points;
}

export interface PlayerMatchStats {
  id?: string | null;
  idTeam?: string;
  idPlayer?: string;
  namePlayer?: string;
  goals?: Goals;
  points?: Points;
  attended?: boolean;
  jerseyNumber?: JerseyNumber;
  cards?: Cards;
}

export interface Goals {
  value: number;
}

export interface Points {
  value: number;
}

export interface JerseyNumber {
  value: number;
}

export interface Cards {
  yellowCards?: number;
  redCards?: number;
}

export interface Team {
  id?: string;
  name?: TeamName;
  logo?: TeamLogo;
  category?: Category;
  numberOfPlayers?: number;
  stats?: TeamStats;
  active?: boolean;
  players?: Player[];
}

export interface TeamStats {
  id?: string;
  idTeam?: string;
  nameTeam?: string;
  matchesPlayed?: number;
  goalsWin?: number;
  goalsAgainst?: number;
  points?: number;
  matchesWon?: number;
  matchesDrawn?: number;
  matchesLost?: number;
  qualified?: boolean;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  jerseyNumber: number;
  age: number;
  photoUrl: string;
  playerStatus: PlayerStatus;
  captain: boolean;
  email: string;
  goals: number;
  points: number;
  yellowCards: number;
  redCards: number;
  team: {
    id: string;
    name: string;
  };
}
export interface User {
  id?: string;
  credentials?: UserCredentials;
  role?: UserRole;
  status?: UserStatus;
  Urlphoto?: string;
  email?: string;
}

export interface UserCredentials {
  username?: string;
  passwordHash?: string;
}

export interface Category {
  id?: string;
  name?: CategoryName;
  ageRange?: AgeRange;
  urlPhoto?: string;
  teams?: Team[];
}

export interface TeamNameIdRecord {
  teamId?: string;
  name?: string;
}

export interface MatchDate {
  value?: string;
}

export interface TeamName {
  value?: string;
}

export interface TeamLogo {
  url?: string;
}

export interface CategoryName {
  value?: string;
}

export interface AgeRange {
  min?: number;
  max?: number;
}

export interface Email {
  value?: string;
}

// Enums remain the same (they don't need optional modifiers)
export enum MatchStatus {
  JUGADO = "JUGADO",
  POSPONIDO = "POSPONIDO",
  PENDIENTE = "PENDIENTE",
  SELECCIONADO = "SELECCIONADO",
  CANCELADO = "CANCELADO",
}

export enum MatchPhase {
  ROUND_ROBIN = "ROUND_ROBIN",
  OCTAVOS_PRIMERA = "OCTAVOS_PRIMERA",
  OCTAVOS_SEGUNDA = "OCTAVOS_SEGUNDA",
  CUARTOS_PRIMERA = "CUARTOS_PRIMERA",
  CUARTOS_SEGUNDA = "CUARTOS_SEGUNDA",
  SEMIFINAL_PRIMERA = "SEMIFINAL_PRIMERA",
  SEMIFINAL_SEGUNDA = "SEMIFINAL_SEGUNDA",
  TERCER_LUGAR = "TERCER_LUGAR",
  FINAL_PRIMERA = "FINAL_PRIMERA",
  FINAL_SEGUNDA = "FINAL_SEGUNDA",
}

export enum PlayerStatus {
  ACTIVO = "ACTIVO",
  LESIONADO = "LESIONADO",
  INACTIVO = "INACTIVO",
}

export enum UserRole {
  ADMINISTRADOR = "ADMINISTRADOR",
  ARBITRO = "ARBITRO",
  JUGADOR = "JUGADOR",
}

export enum UserStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}



export interface PlayerMatchStats {
  id?: string | null
  idTeam?: string
  idPlayer?: string
  namePlayer?: string
  goals?: Goals
  points?: Points
  jerseyNumber?: JerseyNumber
  cards?: Cards
  attended?: boolean // Add this line
}


export type MatchUpdatePayload = {
  idMatch: string;
  homeTeam: {
    name: string;
    id: string;
    goalsWin: { value: number };
    goalsAgainst: { value: number };
    infoPlayerMatchStats: Array<{
      idTeam: string;
      idPlayer: string;
      namePlayer: string;
      goals: { value: number };
      points: { value: number };
      jerseyNumber: { value: number };
      cards: { yellowCards: number; redCards: number };
      attended: boolean
    }>;
  };
  awayTeam: {
    name: string;
    id: string;
    goalsWin: { value: number };
    goalsAgainst: { value: number };
    infoPlayerMatchStats: Array<{
      idTeam: string;
      idPlayer: string;
      namePlayer: string;
      goals: { value: number };
      points: { value: number };
      jerseyNumber: { value: number };
      cards: { yellowCards: number; redCards: number };
      attended: boolean
    }>;
  };
};



