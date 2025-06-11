import { MatchPhase } from "../types/match-types";

export const matchKeys = {
    all: ["matches"] as const,
    byCategory: (categoryId: string) =>
      [...matchKeys.all, "category", categoryId] as const,
    byTournament: (tournamentId: string) =>
      [...matchKeys.all, "tournament", tournamentId] as const,
    byJourney: (tournamentId: string, journeyNumber: number) =>
      [
        ...matchKeys.byTournament(tournamentId),
        "journey",
        journeyNumber,
      ] as const,
    byPhase: (tournamentId: string, phase: MatchPhase) =>
      [...matchKeys.byTournament(tournamentId), "phase", phase] as const,
    detail: (matchId: string, tournamentId: string) =>
      [...matchKeys.all, "detail", matchId, tournamentId] as const,
  };