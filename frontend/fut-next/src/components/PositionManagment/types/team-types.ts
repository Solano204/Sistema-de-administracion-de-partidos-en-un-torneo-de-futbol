// In src/types/team-types.ts
export interface TeamScore {
    teamId: string; // Changed from UUID to string for TS compatibility
    teamName: string;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    logo: string;
  }