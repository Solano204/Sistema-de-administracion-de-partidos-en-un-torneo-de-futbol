// src/hooks/useMatches.ts
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  fetchMatchesByCategory,
  fetchMatchWithStats,
  updateMatchStats,
} from "../api/match-api";
import {
  type MatchTinyDetails,
  type Match,
  type MatchResults,
  MatchStatus,
} from "../types/match-types";
import { matchKeys } from "../api/match-api-keys";

export const useMatchesByCategory = (categoryId: string) => {
  return useQuery<MatchTinyDetails[], Error>({
    queryKey: matchKeys.byCategory(categoryId),
    queryFn: () => fetchMatchesByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const useMatchWithStats = (
  matchId: string,
  tournamentId: string,
  options?: Omit<UseQueryOptions<Match, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<Match, Error> => {
  return useQuery<Match, Error>({
    queryKey: matchKeys.detail(matchId, tournamentId),
    queryFn: () => fetchMatchWithStats(matchId, tournamentId),
    enabled: !!matchId && !!tournamentId,
    ...options // Spread any additional options
  });
};
export const useUpdateMatchStats = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Match,
    Error,
    { matchId: string; tournamentId: string; results: MatchResults }
  >({
    mutationFn: ({ matchId, tournamentId, results }) =>
      updateMatchStats(matchId, tournamentId, results),
    onMutate: async ({ matchId, tournamentId, results }) => {
      await queryClient.cancelQueries({
        queryKey: matchKeys.detail(matchId, tournamentId),
      });

      const previousMatch = queryClient.getQueryData<Match>(
        matchKeys.detail(matchId, tournamentId)
      );

      // Optimistically update the match
      queryClient.setQueryData(
        matchKeys.detail(matchId, tournamentId),
        (old: Match | undefined) =>
          ({
            ...old,
            results,
            status: MatchStatus.JUGADO,
          } as Match)
      );

      return { previousMatch };
    },
    onError: (err, variables, context) => {
      // if (context?.previousMatch ) {
      //   queryClient.setQueryData(
      //     matchKeys.detail(variables.matchId, variables.tournamentId),
      //     context.previousMatch
      //   );
      // }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchKeys.detail(variables.matchId, variables.tournamentId),
      });
      // Also invalidate any list queries that might include this match
      queryClient.invalidateQueries({
        queryKey: matchKeys.byTournament(variables.tournamentId),
      });
    },
  });
};
