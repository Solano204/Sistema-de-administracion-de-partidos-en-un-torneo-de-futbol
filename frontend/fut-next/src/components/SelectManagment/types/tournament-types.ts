// File: src/app/features/tournament/types/tournament-types.ts

export interface TournamentInfoRecord {
  id: string;
  tournamentName: string;
  categoryId: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  phase?: string;
}

export interface CategoryInfoRecord {
  id: string;
  name: string;
  // Add other category fields if needed
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

export interface TournamentNavigationState {
  selectedCategoryId: string;
  selectedTournamentId: string | null;
  selectedDivisionId: string | null;
  error: string | null;
  accumulatedPhases: string[];
}