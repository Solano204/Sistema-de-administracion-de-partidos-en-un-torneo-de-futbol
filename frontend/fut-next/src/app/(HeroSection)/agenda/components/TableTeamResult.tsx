"use client";
import clsx from "clsx";
import * as React from "react";
import { useState, useEffect } from "react";
import { GiSwipeCard } from "react-icons/gi";
import { Checkbox } from "./CheckBox";
import { useTheme } from "next-themes";
import {
  InfoTeamMatchWithoutPlayers,
  PlayerMatchStats,
} from "@/components/MatchManagment/types/match-types";

// Updated Props type with new callback functions
type Props = {
  className?: string;
  players: PlayerMatchStats[];
  teamInfo: InfoTeamMatchWithoutPlayers;
  onTeamUpdate: (updatedTeam: InfoTeamMatchWithoutPlayers) => void;
  onPlayersUpdate: (updatedPlayers: PlayerMatchStats[]) => void;
  isHomeTeam: boolean;
};

export function TableteamResult({
  className = "",
  players: initialPlayers,
  teamInfo: initialTeamInfo,
  onTeamUpdate,
  onPlayersUpdate,
  isHomeTeam,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Maintain internal state for team info and players
  // This allows the component to manage its own state and only notify parent when needed
  const [players, setPlayers] = useState<PlayerMatchStats[]>(initialPlayers);
  const [teamInfo, setTeamInfo] = useState<InfoTeamMatchWithoutPlayers>(initialTeamInfo);

  // Update internal state when props change
  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  useEffect(() => {
    setTeamInfo(initialTeamInfo);
  }, [initialTeamInfo]);

  // Handle input changes for all form fields
  const handleInputChange = (
    id: string,
    field: keyof PlayerMatchStats | "cards.yellowCards" | "cards.redCards",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Make a copy of the current players array to work with
    const updatedPlayers = [...players];
    
    // Find the player to update
    const playerIndex = updatedPlayers.findIndex(p => p.idPlayer === id);
    if (playerIndex === -1) return;

    // Create a copy of the player to modify
    const player = { ...updatedPlayers[playerIndex] };

    // For checkboxes, use the checked property
    if (field === "attended") {
      player.attended = event.target.checked;
      updatedPlayers[playerIndex] = player;
      setPlayers(updatedPlayers);
      onPlayersUpdate(updatedPlayers);
      return;
    }

    // For numeric inputs, handle empty strings and non-numeric values properly
    let numericValue: number;
    if (event.target.value === "") {
      // Empty input should be treated as zero
      numericValue = 0;
    } else {
      // Parse the input and default to 0 if not a valid number
      numericValue = parseInt(event.target.value, 10);
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
    }

    // Ensure the value is non-negative
    numericValue = Math.max(0, numericValue);

    // Process value based on field type
    switch (field) {
      case "cards.yellowCards":
        player.cards = {
          ...(player.cards || {}),
          yellowCards: numericValue
        };
        break;
      case "cards.redCards":
        player.cards = {
          ...(player.cards || {}),
          redCards: numericValue
        };
        break;
      case "goals":
        player.goals = { value: numericValue };
        break;
      case "points":
        player.points = { value: numericValue };
        break;
      case "jerseyNumber":
        player.jerseyNumber = { value: numericValue };
        break;
      default:
        // Handle other fields if needed
        break;
    }

    // Update the player in the array
    updatedPlayers[playerIndex] = player;
    setPlayers(updatedPlayers);

    // Notify parent component of the change
    onPlayersUpdate(updatedPlayers);
    
    // If goals were updated, recalculate total goals and update team info
    if (field === "goals") {
      const totalGoals = updatedPlayers.reduce(
        (total, p) => total + (p.goals?.value || 0),
        0
      );
      
      const updatedTeamInfo = {
        ...teamInfo,
        goalsWin: { value: totalGoals }
      };
      
      setTeamInfo(updatedTeamInfo);
      onTeamUpdate(updatedTeamInfo);
    }
  };
return (
  <div
    className={clsx(
      "flex flex-col rounded-xl font-sans overflow-hidden h-full w-full transition-all duration-300",
      className,
      isDark
        ? "bg-gray-900/95 text-white border border-gray-700"
        : "bg-white/95 text-gray-800 border border-gray-200",
      "shadow-lg backdrop-blur-md"
    )}
  >
    {/* Header */}
    <div
      className={clsx(
        "flex items-center justify-between p-4 border-b",
        isDark
          ? isHomeTeam
            ? "bg-gradient-to-r from-company-green/90 via-company-green/80 to-company-green/90 border-gray-700"
            : "bg-gradient-to-r from-company-yellow/90 via-company-yellow/80 to-company-yellow/90 border-gray-700"
          : isHomeTeam
          ? "bg-gradient-to-r from-company-green to-company-green/80 border-gray-200"
          : "bg-gradient-to-r from-company-yellow to-company-yellow/80 border-gray-200"
      )}
    >
      <h3 className={`font-bold text-xl ${isHomeTeam ? 'text-white' : 'text-gray-900'}`}>
        {teamInfo.name || (isHomeTeam ? "Home Team" : "Away Team")}
      </h3>
      <div className={`${isHomeTeam ? 'bg-white/20' : 'bg-gray-900/20'} rounded-md px-3 py-1`}>
        <span className={isHomeTeam ? 'text-white' : 'text-gray-900'}>
          Goals: {teamInfo.goalsWin?.value || 0}
        </span>
      </div>
    </div>

    {/* Table Content */}
    <div className="w-full flex-grow overflow-auto">
      <table className="w-full border-collapse">
        <thead
          className={clsx(
            "sticky top-0 z-10",
            isDark
              ? "bg-gray-800/90 text-gray-200 border-b border-gray-700"
              : "bg-gray-100/90 text-gray-700 border-b border-gray-300",
            "backdrop-blur-md"
          )}
        >
          <tr>
            <th className="p-3 text-left font-medium">Jersey</th>
            <th className="p-3 text-left font-medium">Name</th>
            <th className="p-3 text-left font-medium">Goals</th>
            <th className="p-3 text-left font-medium">Cards</th>
            <th className="p-3 text-left font-medium">Present</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.idPlayer || index}
              className={clsx(
                "transition-all",
                isDark 
                  ? index % 2 === 0
                    ? "bg-gray-800/40 hover:bg-company-green/10"
                    : "bg-gray-800/20 hover:bg-company-green/10"
                  : index % 2 === 0
                    ? "bg-gray-100/50 hover:bg-company-green/5"
                    : "bg-white hover:bg-company-green/5"
              )}
            >
              <td className={clsx(
                "p-3 border-b",
                isDark ? "border-gray-700/20" : "border-gray-200/50"
              )}>
                <input
                  type="number"
                  value={player.jerseyNumber?.value || 0}
                  onChange={(e) =>
                    handleInputChange(
                      player.idPlayer || "",
                      "jerseyNumber",
                      e
                    )
                  }
                  className={clsx(
                    "w-12 text-center focus:outline-none transition-colors",
                    isDark 
                      ? "bg-transparent border-b border-gray-600 focus:border-company-green text-white"
                      : "bg-transparent border-b border-gray-400 focus:border-company-green text-gray-800"
                  )}
                  min="0"
                />
              </td>
              <td className={clsx(
                "p-3 border-b font-medium",
                isDark 
                  ? "border-gray-700/20 text-white"
                  : "border-gray-200/50 text-gray-800"
              )}>
                {player.namePlayer || `Player ${index + 1}`}
              </td>
              <td className={clsx(
                "p-3 border-b",
                isDark ? "border-gray-700/20" : "border-gray-200/50"
              )}>
                <input
                  type="number"
                  min="0"
                  value={player.goals?.value || 0}
                  onChange={(e) =>
                    handleInputChange(player.idPlayer || "", "goals", e)
                  }
                  className={clsx(
                    "w-12 text-center focus:outline-none transition-colors",
                    isDark 
                      ? "bg-transparent border-b border-gray-600 focus:border-company-green text-white"
                      : "bg-transparent border-b border-gray-400 focus:border-company-green text-gray-800"
                  )}
                />
              </td>
              <td className={clsx(
                "p-3 border-b",
                isDark ? "border-gray-700/20" : "border-gray-200/50"
              )}>
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center">
                    <GiSwipeCard className="text-yellow-400 mb-1" size={18} />
                    <input
                      max={2}
                      type="number"
                      value={player.cards?.yellowCards || 0}
                      onChange={(e) =>
                        handleInputChange(
                          player.idPlayer || "",
                          "cards.yellowCards",
                          e
                        )
                      }
                      className={clsx(
                        "w-8 text-center focus:outline-none transition-colors",
                        isDark 
                          ? "bg-transparent border-b border-gray-600 focus:border-yellow-500 text-white"
                          : "bg-transparent border-b border-gray-400 focus:border-yellow-500 text-gray-800"
                      )}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <GiSwipeCard className="text-red-500 mb-1" size={18} />
                    <input
                      type="number"
                      max={1}
                      value={player.cards?.redCards || 0}
                      onChange={(e) =>
                        handleInputChange(
                          player.idPlayer || "",
                          "cards.redCards",
                          e
                        )
                      }
                      className={clsx(
                        "w-8 text-center focus:outline-none transition-colors",
                        isDark 
                          ? "bg-transparent border-b border-gray-600 focus:border-red-500 text-white"
                          : "bg-transparent border-b border-gray-400 focus:border-red-500 text-gray-800"
                      )}
                      min="0"
                    />
                  </div>
                </div>
              </td>
              <td className={clsx(
                "p-3 border-b",
                isDark ? "border-gray-700/20" : "border-gray-200/50"
              )}>
                <div className="flex justify-center">
                  <Checkbox
                    checked={player.attended || false}
                    onChange={(e) =>
                      handleInputChange(player.idPlayer || "", "attended", e)
                    }
                    className="h-5 w-5 rounded border-gray-300 text-company-green focus:ring-company-green"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Footer with team stats */}
    <div
      className={clsx(
        "p-4 border-t flex justify-between",
        isDark
          ? "bg-gray-800/90 border-gray-700"
          : "bg-gray-100/90 border-gray-200"
      )}
    >
      <div className="flex gap-4">
        <div>
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            Goals:
          </span>
          <span className="ml-2 font-semibold">
            {teamInfo.goalsWin?.value || 0}
          </span>
        </div>
        <div>
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            Goals Against:
          </span>
          <span className="ml-2 font-semibold">
            {teamInfo.goalsAgainst?.value || 0}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            Points:
          </span>
          <span className="ml-2 font-semibold">
            {teamInfo.points?.value || 0}
          </span>
        </div>
        <div className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          teamInfo.points?.value === 3
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : teamInfo.points?.value === 1
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" 
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {teamInfo.points?.value === 3
            ? "Win"
            : teamInfo.points?.value === 1
            ? "Draw"
            : "Loss"}
        </div>
      </div>
    </div>
  </div>
  );
};