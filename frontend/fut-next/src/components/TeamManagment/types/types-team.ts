// src/types/team-types.ts
export interface TeamCreateRecord {
    id: string;
    name: string;
    categoryId: string;
    players: PlayerCreateRecord[];
    logo: string;
  }
  
  export interface PlayerCreateRecord {
    playerId: string;
    firstName: string;
    lastName: string;
    birthDate: string; // LocalDate becomes string in TS (YYYY-MM-DD)
    jerseyNumber: number;
    Age: number;
    photo: string;
    teamId: string;
    captain: boolean;
    email: string;
  }
  
  export interface TeamDetailsRecord {
    id: string;
    name: string;
    category: CategoryInfoRecord;
    logo: string;
    numberOfPlayers: number;
    goalsWin: GoalsRecord;
    goalsAgainst: GoalsRecord;
    points: PointsRecord;
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    qualified: boolean;
  }
  
  export interface TeamWithPlayersRecord {
    info: TeamDetailsRecord;
    players: PlayerDetailsRecord[];
  }
  
  export interface PlayerDetailsRecord {
    playerId: string;
    firstName: string;
    lastName: string;
    birthDate: string; // LocalDate becomes string in TS (YYYY-MM-DD)
    jerseyNumber: number;
    age: number;
    photoUrl: string;
    playerStatus: string;
    captain: boolean;
    email: string;
    goals: number;
    points: number;
    yellowCards: number;
    redCards: number;
    teamId: string;
    teamName: string;
  }
  
  export interface CategoryInfoRecord {
    id: string;
    name: string;
    imageUrl: string;
    ageRange: {
      minAge: number;
      maxAge: number;
    };
  }
  
  export interface GoalsRecord {
    value: number;
  }
  
  export interface PointsRecord {
    value: number;
  }
  
  export interface TeamScore {
    teamId: string;
    teamName: string;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    logo: string;
  }
  


  