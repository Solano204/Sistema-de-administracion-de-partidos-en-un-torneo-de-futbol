// File: src/app/features/teamDebt/hooks/team-search-hooks.ts
"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeamNameIdRecord } from "../types/team-debt-types";
import { searchTeamsByName } from "../api/team-debt-api";
import { teamDebtKeys } from "../api/team-debt-api-keys";

/**
 * Custom hook for searching teams by name
 */
export function useTeamSearch() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<TeamNameIdRecord | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Debounce search term to avoid too many API calls
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
 
    
      setDebouncedSearchTerm(value);
  }, []);

  // Only search if we have at least 2 characters
  const shouldSearch = debouncedSearchTerm.length >= 2;
  
  // Query for team search results
  const {
    data: searchResults = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TeamNameIdRecord[], Error>({
    queryKey: teamDebtKeys.searchResults(debouncedSearchTerm),
    queryFn: () => searchTeamsByName(debouncedSearchTerm),
    enabled: shouldSearch,
    staleTime: 300000, // 5 minutes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle manual search
  const handleSearch = useCallback(() => {

    console.log(searchResults);
    if (searchTerm.trim().length >= 2) {
      setIsSearching(true);
      setDebouncedSearchTerm(searchTerm);
      refetch().finally(() => setIsSearching(false));
    }
  }, [searchTerm, refetch]);

  // Handle team selection
  const handleSelectTeam = useCallback((team: TeamNameIdRecord) => {
    console.log(team);
    setSelectedTeam(team);
  }, []);


  
  // Clear search and selection
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedTeam(null);
  }, []);

  return {
    searchTerm,
    searchResults,
    selectedTeam,
    isLoading: isLoading || isSearching,
    error,
    handleSearchChange,
    handleSearch,
    handleSelectTeam,
    handleClearSearch,
  };
}

