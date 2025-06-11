export type Person = {
    name: string;
    age: number;
  };


export type StateType = "empty" | "media" | "filled";
export type ROLE = "ADMINISTRADOR" | "PLAYER" | "USER" | "ARBITRO";
export type STATUSPLAYER = "ACTIVO" | "INACTIVO" | "SUSPENDIDO";

export type InfoPlayerForm  = {
  playerId: string;
  firstName: string;
  lastName : string;
  email: string;
  age: number;
  photoUrl: string;
  birthDate: string; // LocalDate becomes string in TS (YYYY-MM-DD)
  jerseyNumber: number;
  goals: number;
  points: number;
  yellowCards: number;
  redCards: number;
  playerStatus: string;
  captain: boolean;
  teamId: string;
  teamName: string;
};




export type InfoBasicPlayer  = {
  firstName: string;  // Must match 
  lastName : string;
  email: string;
  photoUrl: string;
  role: ROLE;
  isCaptain: boolean; 
  age: number;
  birthDate: string;
  error: string;
};

export interface StatsFormData {
  team: string;
  jerseyNumber: number;
  goals: number;
  points: number;
  playerStatus: string;
  yellowCards: number;
  redCards: number;
  error: string;


}

export interface StatsFormHandle {
  getCurrentData: () => StatsFormData;
}






export type PropsPlayer = {
  className?: string;
  data?: Person;
  formData: InfoPlayerForm;
};

export type PropsTeam ={
    className?: string;
    children?: React.ReactNode;
    loading?: boolean;
    newTeam: boolean;
    infoTeam?: InfoPlayerForm[];
    dataTeamDetails?: dataTeam
  };


  

  export type dataTeam = {
    id: string;
    name: string;
    categoryId: string;
    numMembers: number;
    goals: number;
    goalsReceived: number;
    points: number;
    matches: number;
    logo: string;
    // Add these new fields
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    qualified: boolean;
    // Optional: Include full category if needed
    category?: {
      id: string;
      name: string;
      imageUrl: string | null;
      ageRange: {
        minAge: number;
        maxAge: number;
      };
    };
  };
// src/types/player-types.ts
export interface PlayerDetailsRecord {
  id: string; // Changed from playerId to match Java Player class
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
    // Changed from teamId to match nested team structure
    id: string;
    name: string;
  };
}

export interface PlayerCreateRecord {
  id: string; // Changed from playerId
  firstName: string;
  lastName: string;
  birthDate: string;
  jerseyNumber: number;
  age: number; // Fixed case from Age to age
  photo: string;
  teamId: string; // Keep teamId for creation
  captain: boolean;
  email: string;
}

export interface PlayerOrganizedRecord {
  id: string; // Changed from playerId
  firstName: string;
  photoUrl: string;
  jerseyNumber: number;
  goals: number;
  points: number;
  redCards: number;
  yellowCards: number;
  team: {
    // Changed from teamId to match nested structure
    id: string;
    logoUrl: string;
    name: string;
  };
  category: {
    // Changed from categoryId to match nested structure
    id: string;
    name: string;
  };
}

export interface PlayerStatsUpdateRequest {
  goalsRecord: Goals;
  pointsRecord: Points;
  card: Cards;
}

// Supporting types remain the same
export interface Goals {
  value: number;
}

export interface Points {
  value: number;
}

export interface Cards {
  yellowCards: number;
  redCards: number;
}

export enum PlayerStatus {
  ACTIVO = "ACTIVO",
  LESIONADO = "LESIONADO",
  INACTIVO = "INACTIVO",
}
