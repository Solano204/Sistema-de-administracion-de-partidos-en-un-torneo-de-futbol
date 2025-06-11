"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { updateAllChoseMatches } from "@/app/Redux/feature/Matches/matchSlice";
import { useQuery } from "@tanstack/react-query";
import { fetchMatchesByCategory } from "@/components/MatchManagment/api/match-api";
import { MatchTinyDetails } from "@/components/MatchManagment/types/match-types";
import { divisions } from "@/app/(HeroSection)/agenda/types/TypesAgend";
import { categoryKeys } from "@/components/CategoryManagment/api/category-api-keys";
import { fetchAllCategories } from "@/components/CategoryManagment/components";
import { matchKeys } from "../../../../components/MatchManagment/api/match-api-keys";

// Enhanced helper function to extract journey number from phase
const getJourneyNumberFromPhase = (phase: string): number | null => {
  if (!phase) return null;
  
  // Handle different phase formats: "JORNADA 1", "JORNADA-1", "JORNADA_1", etc.
  const match = phase.match(/JORNADA[\s\-_]*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

// Helper to get the most frequent journey number
const getMostFrequentJourney = (matches: MatchTinyDetails[]): number | null => {
  const journeyCounts: Record<number, number> = {};
  
  matches.forEach(match => {
    const journeyNum = getJourneyNumberFromPhase(match.phase || '');
    if (journeyNum !== null) {
      journeyCounts[journeyNum] = (journeyCounts[journeyNum] || 0) + 1;
    }
  });
  
  if (Object.keys(journeyCounts).length === 0) return null;
  
  return parseInt(
    Object.entries(journeyCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0],
    10
  );
};

const MatchSelector = () => {
  // State initialization with localStorage
  const [selectedCategory, setSelectedCategory] = useState<string>(() => 
    typeof window !== "undefined" ? localStorage.getItem("selectedCategory") || "" : ""
  );

  const [selectedOption, setSelectedOption] = useState<"journeys" | "divisions" | "">(() => 
    typeof window !== "undefined" ? (localStorage.getItem("selectedOption") as "journeys" | "divisions" | "") || "" : ""
  );

  const [selectedDivision, setSelectedDivision] = useState<divisions | "">(() => 
    typeof window !== "undefined" ? (localStorage.getItem("selectedDivision") as divisions | "") || "" : ""
  );

  const [selectedJourney, setSelectedJourney] = useState<number | "">(() => 
    typeof window !== "undefined" ? parseInt(localStorage.getItem("selectedJourney") || "") || "" : ""
  );

  const dispatch = useDispatch();

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchAllCategories,
    staleTime: 300000,
  });

  const { data: apiMatches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: matchKeys.byCategory(selectedCategory),
    queryFn: () => fetchMatchesByCategory(selectedCategory),
    enabled: !!selectedCategory,
    staleTime: 300000,
  });

  // Calculate available journeys and most frequent journey
  const { availableJourneys, mostFrequentJourney } = useMemo(() => {
    const journeys = new Set<number>();
    apiMatches.forEach(match => {
      const journeyNum = getJourneyNumberFromPhase(match.phase || '');
      if (journeyNum !== null) journeys.add(journeyNum);
    });
    
    return {
      availableJourneys: Array.from(journeys).sort((a, b) => a - b),
      mostFrequentJourney: getMostFrequentJourney(apiMatches)
    };
  }, [apiMatches]);

  // Auto-select most frequent journey if none selected
  useEffect(() => {
    if (selectedOption === "journeys" && selectedJourney === "" && mostFrequentJourney !== null) {
      setSelectedJourney(mostFrequentJourney);
    }
  }, [selectedOption, selectedJourney, mostFrequentJourney]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedCategory) localStorage.setItem("selectedCategory", selectedCategory);
    if (selectedOption) localStorage.setItem("selectedOption", selectedOption);
    if (selectedDivision) localStorage.setItem("selectedDivision", selectedDivision);
    if (selectedJourney !== "") localStorage.setItem("selectedJourney", selectedJourney.toString());
  }, [selectedCategory, selectedOption, selectedDivision, selectedJourney]);

  // Process matches
  const matches = useMemo(() => {
    if (!selectedCategory || !selectedOption) return [];
    
    return apiMatches
      .filter(match => {
        if (selectedOption === "journeys") {
          const journeyNum = getJourneyNumberFromPhase(match.phase || '');
          return selectedJourney === "" ? journeyNum !== null : journeyNum === selectedJourney;
        } else if (selectedOption === "divisions") {
          if (!match.phase) return false;
          if (selectedDivision === "PRIMERA") return match.phase.includes("PRIMERA");
          if (selectedDivision === "SEGUNDA") return match.phase.includes("SEGUNDA");
          return match.phase.includes("PRIMERA") || match.phase.includes("SEGUNDA");
        }
        return false;
      })
      .map(match => ({
        id: match.idMatch || "",
        team1: match.team1?.name || "",
        team2: match.team2?.name || "",
        status: match.status || "PENDIENTE",
        phase: match.phase,
        tourmentId: match.tourmentId,
        tournamentName: match.tournamentName,
        category: match.category,
        numJourney: getJourneyNumberFromPhase(match.phase || ''),
      }));
  }, [apiMatches, selectedCategory, selectedOption, selectedDivision, selectedJourney]);

  // Dispatch matches to Redux
  useEffect(() => {
    if (matches.length > 0) {
      dispatch(updateAllChoseMatches(matches));
    }
  }, [matches, dispatch]);

  // Event handlers
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedOption("");
    setSelectedDivision("");
    setSelectedJourney("");
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value as "journeys" | "divisions" | "";
    setSelectedOption(option);
    setSelectedDivision("");
    setSelectedJourney("");
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDivision(e.target.value as divisions | "");
  };

  const handleJourneyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJourney(e.target.value === "" ? "" : parseInt(e.target.value, 10));
  };

  const showLoading = isLoadingCategories || isLoadingMatches;

  return (
    <div className="w-full p-4 text-black dark:text-white">
      <div className="flex flex-col space-y-4 mb-6">
        {/* Category Selector */}
        <div>
          <label className="block mb-2 font-medium">Select Category:</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
            disabled={showLoading}
          >
            <option value="">-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Option Selector */}
        {selectedCategory && (
          <div>
            <label className="block mb-2 font-medium">Filter by:</label>
            <select
              value={selectedOption}
              onChange={handleOptionChange}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800"
              disabled={showLoading}
            >
              <option value="">-- Select an option --</option>
              <option value="journeys">Journeys</option>
              <option value="divisions">Division</option>
            </select>
          </div>
        )}

        {/* Journey Selector - Enhanced */}
        {selectedOption === "journeys" && availableJourneys.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">
              {selectedJourney === mostFrequentJourney ? "Most Frequent Journey" : "Select Journey"}:
            </label>
            <select
              value={selectedJourney}
              onChange={handleJourneyChange}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800"
              disabled={showLoading}
            >
              <option value="">-- All Journeys --</option>
              {availableJourneys.map(journeyNum => (
                <option key={journeyNum} value={journeyNum}>
                  {journeyNum === mostFrequentJourney ? `Journey ${journeyNum} (Most Frequent)` : `Journey ${journeyNum}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Division Selector */}
        {selectedOption === "divisions" && (
          <div>
            <label className="block mb-2 font-medium">Select Division:</label>
            <select
              value={selectedDivision}
              onChange={handleDivisionChange}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800"
              disabled={showLoading}
            >
              <option value="">-- Select division --</option>
              <option value="PRIMERA">Primera</option>
              <option value="SEGUNDA">Segunda</option>
            </select>
          </div>
        )}
      </div>

      {/* Status messages */}
      {showLoading && <div className="text-center py-8">Loading...</div>}
      
      {!showLoading && matches.length === 0 && selectedOption && (
        <div className="text-center py-8">
          No matches found for selected criteria
        </div>
      )}

      {!showLoading && matches.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          Found {matches.length} matches
          {selectedOption === "journeys" && selectedJourney && ` for Journey ${selectedJourney}`}
          {selectedOption === "divisions" && selectedDivision && ` for ${selectedDivision} Division`}
        </div>
      )}
    </div>
  );
};

export default MatchSelector;