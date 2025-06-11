export const tournamentKeys = {
  all: ["tournaments"] as const,
  byId: (tournamentId: string) => [...tournamentKeys.all, tournamentId] as const,
  byCategory: (categoryId: string) =>
    [...tournamentKeys.all, "category", categoryId] as const,
  divisions: (tournamentId: string) =>
    [...tournamentKeys.byId(tournamentId), "divisions"] as const,
  divisionStatus: (tournamentId: string, divisionId: string, categoryId: string) =>
    [...tournamentKeys.byId(tournamentId), "divisions", divisionId, "status", categoryId] as const,
  tournamentStage: (tournamentId: string, categoryId: string) =>
    [...tournamentKeys.byId(tournamentId), "stage", categoryId] as const,
  matchesInRange: (startDate: string, endDate: string) =>
    [...tournamentKeys.all, "matches", startDate, endDate] as const,
};
