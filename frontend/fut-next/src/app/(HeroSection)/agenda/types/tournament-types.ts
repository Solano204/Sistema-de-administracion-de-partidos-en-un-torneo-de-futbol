// src/services/tournament-types.ts

export interface TournamentInfoRecord {
    id: string;
    tournamentName: string;
    categoryName: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
  }
  
  export interface MatchScheduleInfoRecord {
    id: string;
    matchId: string;
    tournamentId: string;

    matchDay: string;
    matchDate: string; // ISO date string
    matchTime: string; // ISO time string
    homeTeamName: string;
    awayTeamName: string;
    tournamentName: string;
    // categoryId: string;
    categoryName: string;
    phase: string;
    status: string;
  }
  
  export interface DivisionAdvancementStatus {
    canAdvance: boolean;
    currentPhase: string;
    nextPhase: string;
    completedMatches: number;
    totalMatches: number;
    teamsReady: number;
    totalTeams: number;
    divisionName: string;
  }
  
  export interface TournamentStageInfo {
    currentStage: string;
    canCreateDivisions: boolean;
    recommendedDivisions: number;
    totalTeams: number;
    completedMatches: number;
    totalMatches: number;
  }
  
  export interface DivisionEntity {
    id: string;
    tournamentId: string;
    divisionName: string;
  }
  
  export interface WeeklyScheduleRecordRequest {
    id: string;
    matchId: string;
    tournamentId: string;
    matchDay: string;
    matchDate: string; // ISO date string
    matchTime: string; // ISO time string
    homeTeamName: string;
    awayTeamName: string;
    tournamentName: string;
    categoryName: string;
    phase: string;
    status: string;
  }