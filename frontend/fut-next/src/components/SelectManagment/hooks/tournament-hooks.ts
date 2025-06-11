// File: src/app/features/tournament/hooks/tournament-hooks.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentKeys } from "../api/tournament-keys";
import {
  fetchAllCategories,
  fetchTournamentsByCategory,
  fetchTeamCountByCategory,
  fetchTournamentStageInfo,
  fetchDivisionsByTournament,
  fetchDivisionStatus,
  createTournament,
  createDivisions,
  advancePhase
} from "../api/tournament-api";
import {
  CategoryInfoRecord,
  TournamentInfoRecord,
  TournamentStageInfo,
  DivisionEntity,
  DivisionAdvancementStatus,
  TournamentNavigationState
} from "../types/tournament-types";
import { getAccumulatedPhases, createTournamentInfo } from "../utils/tournament-utils";

/**
 * Custom hook for managing tournament navigation state
 */
export function useTournamentNavigation() {
  const [state, setState] = useState<TournamentNavigationState>({
    selectedCategoryId: "",
    selectedTournamentId: null,
    selectedDivisionId: null,
    error: null,
    accumulatedPhases: []
  });

  const updateState = useCallback((updates: Partial<TournamentNavigationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetTournamentSelection = useCallback(() => {
    updateState({
      selectedTournamentId: null,
      selectedDivisionId: null,
      error: null
    });
  }, [updateState]);

  const resetDivisionSelection = useCallback(() => {
    updateState({
      selectedDivisionId: null,
      error: null
    });
  }, [updateState]);

  return {
    state,
    updateState,
    resetTournamentSelection,
    resetDivisionSelection
  };
}

/**
 * Custom hook for fetching categories
 */
export function useCategories() {
  return useQuery<CategoryInfoRecord[]>({
    queryKey: tournamentKeys.categories(),
    queryFn: fetchAllCategories,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching tournaments by category
 */
export function useTournamentsByCategory(categoryId: string) {
  return useQuery<TournamentInfoRecord[]>({
    queryKey: tournamentKeys.tournamentsByCategory(categoryId),
    queryFn: () => fetchTournamentsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching team count by category
 */
export function useTeamCountByCategory(categoryId: string, shouldFetch: boolean) {
  return useQuery<number>({
    queryKey: tournamentKeys.teamCountByCategory(categoryId),
    queryFn: () => fetchTeamCountByCategory(categoryId),
    enabled: !!categoryId && shouldFetch,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching tournament stage info
 */
export function useTournamentStageInfo(tournamentId: string | null, categoryId: string) {
  return useQuery<TournamentStageInfo | null>({
    queryKey: tournamentKeys.tournamentStage(tournamentId || "", categoryId),
    queryFn: () => fetchTournamentStageInfo(tournamentId!, categoryId),
    enabled: !!tournamentId && !!categoryId,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0, // Always fresh
  });
}

/**
 * Custom hook for fetching divisions by tournament
 */
export function useDivisionsByTournament(tournamentId: string | null) {
  return useQuery<DivisionEntity[]>({
    queryKey: tournamentKeys.divisionsByTournament(tournamentId || ""),
    queryFn: () => fetchDivisionsByTournament(tournamentId!),
    enabled: !!tournamentId,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0, // Always fresh
  });
}

/**
 * Custom hook for fetching division status
 */
export function useDivisionStatus(
  tournamentId: string | null,
  divisionId: string | null,
  categoryId: string
) {
  return useQuery<DivisionAdvancementStatus | null>({
    queryKey: tournamentKeys.divisionStatus(
      tournamentId || "",
      divisionId || "",
      categoryId
    ),
    queryFn: () => fetchDivisionStatus(tournamentId!, divisionId!, categoryId),
    enabled: !!tournamentId && !!divisionId && !!categoryId,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0, // Always fresh
  });
}

/**
 * Custom hook for tournament mutations
 */
export function useTournamentMutations() {
  const queryClient = useQueryClient();

  const createTournamentMutation = useMutation({
    mutationFn: createTournament,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.tournamentsByCategory(variables.categoryId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating tournament:", error.message);
    }
  });

  const createDivisionsMutation = useMutation({
    mutationFn: createDivisions,
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.tournamentStage(tournamentId, "") 
      });
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.divisionsByTournament(tournamentId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating divisions:", error.message);
    }
  });

  const advancePhaseMutation = useMutation({
    mutationFn: ({ tournamentId, divisionName }: { tournamentId: string, divisionName: string }) =>
      advancePhase(tournamentId, divisionName),
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.divisionStatuses() 
      });
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.tournamentStage(tournamentId, "") 
      });
    },
    onError: (error: Error) => {
      console.error("Error advancing phase:", error.message);
    }
  });

  return {
    createTournament: createTournamentMutation,
    createDivisions: createDivisionsMutation,
    advancePhase: advancePhaseMutation
  };
}

/**
 * Custom hook for managing accumulated phases
 */
export function useAccumulatedPhases(divisionStatus: DivisionAdvancementStatus | null) {
  const [accumulatedPhases, setAccumulatedPhases] = useState<string[]>([]);

  useEffect(() => {
    if (divisionStatus) {
      const phases = getAccumulatedPhases(
        divisionStatus.currentPhase,
        divisionStatus.divisionName
      );
      setAccumulatedPhases(phases);
    } else {
      setAccumulatedPhases([]);
    }
  }, [divisionStatus]);

  return accumulatedPhases;
}

/**
 * Custom hook for checking if tournament can be created
 */
export function useTournamentCreationInfo(
  categoryId: string,
  tournaments: TournamentInfoRecord[],
  teamCount: number | undefined,
  categories: CategoryInfoRecord[]
) {
  const canCreateTournament = Boolean(
    categoryId && 
    tournaments.length === 0 && 
    teamCount !== undefined && 
    teamCount >= 2
  );

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  const createTournamentData = useCallback(() => {
    if (!selectedCategory) return null;
    
    return {
      ...createTournamentInfo(categoryId, selectedCategory.name),
      id: "" // Backend will generate this
    };
  }, [categoryId, selectedCategory]);

  return {
    canCreateTournament,
    selectedCategory,
    teamCount,
    createTournamentData
  };
}