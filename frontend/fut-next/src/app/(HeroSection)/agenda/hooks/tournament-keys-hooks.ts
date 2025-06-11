
"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {  week } from "@/app/(HeroSection)/agenda/types/TypesAgend";
import { tournamentKeys } from './tournament-keys-api';
import {
  TournamentInfoRecord,
  DivisionAdvancementStatus,
  TournamentStageInfo,
  DivisionEntity,
} from "../types/tournament-types";
import {
  fetchMatchesInDateRange,
  convertApiMatchToWeek,
  scheduleMatches,
  deleteMatchSchedule,
  checkMatchExists,
  fetchTournamentsForCategory,
  initializeTournament,
  simulateRoundRobinMatches,
  createTournamentDivisions,
  advanceToNextPhase,
  simulateEliminationMatches,
  fetchDivisionAdvancementStatus,
  fetchTournamentStage,
  fetchDivisionsForTournament,
  getEarliestDate,
  getLatestDate,
  formatDateForApi
} from '../api/tournament-keys-api';

/**
 * Hook for fetching matches in a date range
 */
export const useMatchesInDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: tournamentKeys.matchesInRange(startDate, endDate),
    queryFn: async () => {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Invalid date range');
      }
      
      const matchData = await fetchMatchesInDateRange(startDate, endDate);
      // Map each match to the week format
      const weekData = await Promise.all(matchData.map(convertApiMatchToWeek));
      return weekData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!startDate && !!endDate, // Only run query when dates are valid
  });
};

/**
 * Hook for scheduling matches
 */
export const useScheduleMatches = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (weeklySchedule: week[]) => {
      return scheduleMatches(weeklySchedule);
    },
    onSuccess: async (data, variables) => {
      const startDate = await getEarliestDate(variables);
      const endDate = await getLatestDate(variables);
      
      if (startDate && endDate) {
        // Invalidate and immediately refetch
        queryClient.invalidateQueries({
          queryKey: tournamentKeys.matchesInRange(
            await formatDateForApi(startDate),
            await formatDateForApi(endDate)
          ),
          refetchType: 'all' // Force refetch instead of using cache
        });
      }
    },

    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
      }
    }
  });
};

/**
 * Hook for deleting match schedule
 */
export const useDeleteMatchSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      return deleteMatchSchedule(matchId);
    },
    onSuccess: () => {
      // Invalidate and refetch queries that could be affected
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.all,
      });
    },
  });
};

/**
 * Hook for checking if match exists
 */
export const useCheckMatchExists = () => {
  return useMutation({
    mutationFn: async (matchId: string): Promise<boolean> => {
      return checkMatchExists(matchId);
    }
  });
};

/**
 * Hook for getting tournaments for a category
 */
export const useTournamentsForCategory = (categoryId: string) => {
  return useQuery<TournamentInfoRecord[]>({
    queryKey: tournamentKeys.byCategory(categoryId),
    queryFn: async () => {
      return fetchTournamentsForCategory(categoryId);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for tournament initialization
 */
export const useInitializeTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentInfo: TournamentInfoRecord) => {
      return initializeTournament(tournamentInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
    },
    onError: (error) => {
      console.error('Error initializing tournament:', error);
      throw new Error('Failed to initialize tournament');
    }
  });
};

/**
 * Hook for simulating round robin matches
 */
export const useSimulateRoundRobinMatches = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await simulateRoundRobinMatches(tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.byId(tournamentId) 
      });
    },
    onError: (error) => {
      console.error('Error simulating round robin matches:', error);
      throw new Error('Failed to simulate round robin matches');
    }
  });
};

/**
 * Hook for creating tournament divisions
 */
export const useCreateTournamentDivisions = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await createTournamentDivisions(tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.divisions(tournamentId) 
      });
    },
    onError: (error) => {
      console.error('Error creating divisions:', error);
      throw new Error('Failed to create divisions');
    }
  });
};

/**
 * Hook for advancing to the next phase
 */
export const useAdvanceToNextPhase = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (divisionName: string) => {
      await advanceToNextPhase(tournamentId, divisionName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.byId(tournamentId) 
      });
    },
    onError: (error) => {
      console.error('Error advancing phase:', error);
      throw new Error('Failed to advance phase');
    }
  });
};

/**
 * Hook for simulating elimination matches
 */
export const useSimulateEliminationMatches = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (divisionName: string) => {
      await simulateEliminationMatches(tournamentId, divisionName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: tournamentKeys.byId(tournamentId) 
      });
    },
    onError: (error) => {
      console.error('Error simulating elimination matches:', error);
      throw new Error('Failed to simulate elimination matches');
    }
  });
};

/**
 * Hook for checking division advancement status
 */
export const useDivisionAdvancementStatus = (
  tournamentId: string,
  divisionId: string,
  categoryId: string
) => {
  return useQuery<DivisionAdvancementStatus>({
    queryKey: tournamentKeys.divisionStatus(tournamentId, divisionId, categoryId),
    queryFn: async () => {
      return fetchDivisionAdvancementStatus(tournamentId, divisionId, categoryId);
    },
    staleTime: 0, // Always fresh data
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    refetchIntervalInBackground: true
  });
};

/**
 * Hook for checking tournament stage
 */
export const useTournamentStage = (tournamentId: string, categoryId: string) => {
  return useQuery<TournamentStageInfo>({
    queryKey: tournamentKeys.tournamentStage(tournamentId, categoryId),
    queryFn: async () => {
      return fetchTournamentStage(tournamentId, categoryId);
    },
    staleTime: 0, // Always fresh data
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    refetchIntervalInBackground: true
  });
};

/**
 * Hook for getting divisions for a tournament
 */
export const useDivisionsForTournament = (tournamentId: string) => {
  return useQuery<DivisionEntity[]>({
    queryKey: tournamentKeys.divisions(tournamentId),
    queryFn: async () => {
      return fetchDivisionsForTournament(tournamentId);
    },
    staleTime: 0, // Always fresh data
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    refetchIntervalInBackground: true
  });
};