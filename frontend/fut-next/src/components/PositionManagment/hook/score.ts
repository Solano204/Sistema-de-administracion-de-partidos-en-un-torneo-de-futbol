"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlayersOrganizedByPoints, TeamScore } from "../";
import { PlayerOrganizedRecord } from "../";
import { fetchTeamsByPosition } from "../";
import { toastCustom } from "@/components/Toast/SonnerToast";

// Query keys for caching
export const teamStatsKeys = {
  all: ['teamStats'] as const,
  teams: () => [...teamStatsKeys.all, 'teams'] as const,
  teamsByCategory: (categoryId: string) => [...teamStatsKeys.teams(), categoryId] as const,
  players: () => [...teamStatsKeys.all, 'players'] as const,
  playersByCategory: (categoryId: string) => [...teamStatsKeys.players(), categoryId] as const,
};

// Mock function for player data - replace with your actual API call

/**
 * Custom hook for fetching team standings by category
 */
export function useTeamStandings(categoryId: string = "") {
  const [categoryIdState, setCategoryIdState] = useState<string>(categoryId);
  
  const {
    data: teams = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TeamScore[], Error>({
    queryKey: teamStatsKeys.teamsByCategory(categoryIdState),
    queryFn: () => fetchTeamsByPosition(categoryIdState),
    enabled: !!categoryIdState, // Only run query if categoryId is provided
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleCategoryIdChange = useCallback((id: string) => {
    setCategoryIdState(id);
  }, []);

  return {
    teams,
    isLoading,
    error,
    categoryId: categoryIdState,
    setCategoryId: handleCategoryIdChange,
    refreshTeams: refetch,
  };
}

/**
 * Custom hook for fetching player statistics by category
 */
export function usePlayerStats(categoryId: string = "") {
  const [categoryIdState, setCategoryIdState] = useState<string>(categoryId);
  
  const {
    data: players = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PlayerOrganizedRecord[], Error>({
    queryKey: teamStatsKeys.playersByCategory(categoryIdState),
    queryFn: () => fetchPlayersOrganizedByPoints(categoryIdState),
    enabled: !!categoryIdState, // Only run query if categoryId is provided
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleCategoryIdChange = useCallback((id: string) => {
    setCategoryIdState(id);
  }, []);

  return {
    players,
    isLoading,
    error,
    categoryId: categoryIdState,
    setCategoryId: handleCategoryIdChange,
    refreshPlayers: refetch,
  };
}

/**
 * Toast utility functions
 */
export const useToastNotifications = () => {
  // Toast helpers
  const showSuccessToast = useCallback((message: string) => {
    toastCustom(
      {
        title: "Success",
        description: message,
        button: { label: "Dismiss", onClick: () => {} },
      },
      "success"
    );
  }, []);

  const showErrorToast = useCallback((message: string, duration = 7000) => {
    toastCustom(
      {
        title: "Error",
        description: message,
        button: { label: "Dismiss", onClick: () => {} },
      },
      "error",
      duration
    );
  }, []);

  // Helper to extract user-friendly error message
  const extractErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as any).response;
      
      if (response?.data) {
        const data = response.data;
        
        if (data.errors && typeof data.errors === 'object') {
          return Object.entries(data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
        }
        
        if (data.message) {
          return data.message;
        }
        
        if (data.details) {
          return data.details;
        }
      }
      
      if (response?.statusText) {
        return `${response.status}: ${response.statusText}`;
      }
    }
    
    if (err instanceof Error) {
      return err.message;
    }
    
    return typeof err === 'string' ? err : "An unexpected error occurred";
  };

  return {
    showSuccessToast,
    showErrorToast,
    extractErrorMessage,
  };
};