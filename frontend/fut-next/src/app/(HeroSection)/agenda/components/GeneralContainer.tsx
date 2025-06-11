"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useMatchWithStats } from "@/components/MatchManagment/hooks/useMatches";
import { RootState } from "@/app/Redux/store";
import { Match } from "@/app/(HeroSection)/agenda/types/TypesAgend";
import clsx from "clsx";

// Lazy load heavy components
const CardMatch = dynamic(() => import("./CardMatch").then(mod => ({ default: mod.CardMatch })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

const Result = dynamic(() => import("./Union").then(mod => ({ default: mod.Result })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

export const GeneralContainer = () => {
  // Get matches from Redux store with selector optimization
  const allMatches = useSelector(
    (state: RootState) => state.matches.choseMatches,
    // Shallow equality check to prevent unnecessary re-renders
    (left, right) => left.length === right.length && left.every((match, i) => match.id === right[i]?.id)
  );

  // State management
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized selected match to prevent unnecessary recalculations
  const selectedMatch = useMemo(() => {
    if (!selectedMatchId) return null;
    return allMatches.find(m => m.id === selectedMatchId) || null;
  }, [selectedMatchId, allMatches]);

  // Use the query hook with proper enabled control
  const {
    data: matchData,
    isError,
    error,
    refetch,
    isLoading,
    isFetching
  } = useMatchWithStats(
    selectedMatch?.id || "", 
    selectedMatch?.tourmentId || "", 
    {
      enabled: false, // Manual fetching only
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes in cache
    }
  );

  // Memoized match options to prevent dropdown re-renders
  const matchOptions = useMemo(() => {
    return allMatches.map(match => ({
      id: match.id,
      label: `${match.team1} vs ${match.team2} - ${match.category}`,
      value: match.id
    }));
  }, [allMatches]);

  // Optimized match selection handler
  const handleMatchSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const matchId = e.target.value;
    setSelectedMatchId(matchId);
    
    // Close modal when changing selection
    if (isModalOpen) {
      setIsModalOpen(false);
    }
  }, [isModalOpen]);

  // Optimized fetch handler
  const fetchMatchData = useCallback(async () => {
    if (!selectedMatch) {
      console.warn("No match selected for fetching");
      return;
    }

    try {
      console.log("Fetching match data for:", selectedMatch.id);
      const { data } = await refetch();
      
      if (data) {
        setIsModalOpen(true);
        console.log("Match data fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
      // You might want to show a toast notification here instead of console.error
    }
  }, [selectedMatch, refetch]);

  // Memoized modal close handler
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Memoized loading state
  const isDataLoading = isLoading || isFetching;

  // Memoized error message
  const errorMessage = useMemo(() => {
    if (!isError) return null;
    return error?.message || "Failed to fetch match data";
  }, [isError, error]);

  // Memoized content for the card
  const cardContent = useMemo(() => {
    if (matchData) {
      return (
        <Result
          match={matchData}
          className="w-full h-full"
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {isDataLoading
            ? "Loading match data..."
            : "Match data will appear here after selection"}
        </p>
      </div>
    );
  }, [matchData, isDataLoading]);

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto space-y-4">
      {/* Dropdown selector section */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4">
        <div className="w-full">
          <label 
            htmlFor="match-select" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select a Match ({allMatches.length} available)
          </label>
          <select
            id="match-select"
            value={selectedMatchId}
            onChange={handleMatchSelect}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 text-gray-900 dark:text-gray-100"
            disabled={isDataLoading}
          >
            <option value="">-- Select a match --</option>
            {matchOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {selectedMatch && (
          <button
            onClick={fetchMatchData}
            className={clsx(
              "w-full sm:w-auto px-4 py-2 mt-4 sm:mt-6 rounded transition-colors duration-200 ease-in-out font-medium",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              isDataLoading 
                ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed focus:ring-gray-500" 
                : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-500"
            )}
            disabled={isDataLoading}
            aria-label={isDataLoading ? "Loading match statistics" : "Fetch match statistics"}
          >
            {isDataLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              "Fetch Statistics"
            )}
          </button>
        )}
      </div>

      {/* Error display */}
      {isError && errorMessage && (
        <div 
          className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" 
          role="alert"
          aria-live="polite"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      
      {/* Match data display */}
      <div className="w-full h-full flex-grow overflow-hidden">
        <CardMatch
          className="w-full h-full"
          isModalOpen={isModalOpen}
          onModalClose={handleModalClose}
        >
          {cardContent}
        </CardMatch>
      </div>
    </div>
  );
};