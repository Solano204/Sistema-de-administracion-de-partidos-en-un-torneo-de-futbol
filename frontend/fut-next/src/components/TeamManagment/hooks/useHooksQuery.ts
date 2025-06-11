// File: src/app/features/credential/hooks/credential-hooks.ts
"use client";
import {  useCallback } from "react";
import { useQuery,  useQueryClient } from "@tanstack/react-query";

import { TeamScore } from "@/components/PositionManagment";
import { fetchTeamsByCategory, fetchTeamWithPlayers, TeamWithPlayersRecord} from "@/components/TeamManagment/";
export function useTeamsByCategory(categoryId: string) {
  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TeamScore[], Error>({
    queryKey: ["teamsByCategory", categoryId],
    queryFn: () => fetchTeamsByCategory(categoryId),
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    // Don't run the query if we don't have a categoryId
    enabled: !!categoryId,
  });

  // Add a manual refetch function
  const refreshTeams = useCallback(() => {
    return refetch();
  }, [refetch]);

  // Add a function to invalidate the teams cache
  const invalidateTeams = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["teamsByCategory", categoryId] });
  }, [queryClient, categoryId]);

  return {
    teams,
    isLoading,
    isError,
    error,
    refreshTeams,
    invalidateTeams,
  };
}

export function useTeamWithPlayers(categoryId: string, teamId: string, newTeam: boolean ) {

console.log("fdrom compo ve", newTeam)
  
  if(newTeam && teamId === "create-new-team") {
    return {
      teamWithPlayers: null,
      invalidateTeamWithPlayers: () => {},
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => {},
    }
  }

console.log("fdrom compo", newTeam)
  const queryClient = useQueryClient();

  const {
    data: teamWithPlayers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TeamWithPlayersRecord>({
    queryKey: ["teamWithPlayers", categoryId, teamId],
    queryFn: () => fetchTeamWithPlayers(categoryId, teamId),
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    // Don't run the query if it's a new team or if we don't have the required IDs
    // enabled: !newTeam && !!teamId && !!categoryId,
  });

  // Add a manual refetch function
  const refreshTeamWithPlayers = useCallback(() => {
    return refetch();
  }, [refetch]);

  // Add a function to invalidate the team with players cache
  const invalidateTeamWithPlayers = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["teamWithPlayers", categoryId, teamId] });
  }, [queryClient, categoryId, teamId]);

  return {
    teamWithPlayers,
    isLoading,
    isError,
    error,
    refreshTeamWithPlayers,
    invalidateTeamWithPlayers,
  };
}
/**
 * Custom hook for credential mutations (create, update, delete)
 */