// File: src/app/features/tournament/api/tournament-keys.ts

/**
 * Query key factory for tournament-related queries
 */
export const tournamentKeys = {
  all: ["tournaments"] as const,
  
  // Categories
  categories: () => [...tournamentKeys.all, "categories"] as const,
  
  // Tournaments
  tournaments: () => [...tournamentKeys.all, "tournaments"] as const,
  tournamentsByCategory: (categoryId: string) => [...tournamentKeys.tournaments(), "category", categoryId] as const,
  
  // Tournament stages
  tournamentStages: () => [...tournamentKeys.all, "stages"] as const,
  tournamentStage: (tournamentId: string, categoryId: string) => [...tournamentKeys.tournamentStages(), tournamentId, categoryId] as const,
  
  // Divisions
  divisions: () => [...tournamentKeys.all, "divisions"] as const,
  divisionsByTournament: (tournamentId: string) => [...tournamentKeys.divisions(), "tournament", tournamentId] as const,
  
  // Division status
  divisionStatuses: () => [...tournamentKeys.all, "divisionStatuses"] as const,
  divisionStatus: (tournamentId: string, divisionId: string, categoryId: string) => [...tournamentKeys.divisionStatuses(), tournamentId, divisionId, categoryId] as const,
  
  // Team counts
  teamCounts: () => [...tournamentKeys.all, "teamCounts"] as const,
  teamCountByCategory: (categoryId: string) => [...tournamentKeys.teamCounts(), "category", categoryId] as const,
} as const;