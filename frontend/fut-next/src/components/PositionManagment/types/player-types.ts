// In src/types/player-types.ts
export interface PlayerOrganizedRecord {
    playerId: string; // Changed from UUID to string
    firstName: string;
    photoUrl: string;
    jerseyNumber: number;
    goals: number;
    points: number;
    redCards: number;
    yellowCards: number;
    teamId: string;
    teamLogoUrl: string;
    teamName: string;
    categoryId: string;
    categoryName: string;
  }