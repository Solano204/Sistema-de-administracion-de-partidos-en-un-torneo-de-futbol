
"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  FaTimes, FaPlus, FaCalendarCheck } from "react-icons/fa";
import clsx from "clsx";
import {
  addMatch,
  removeMatchId,
  updateChoseMatch,
} from "@/app/Redux/feature/Matches/matchSlice";
import {
  addMatchToDeleteList,
} from "@/app/Redux/feature/Matches/WeekSlice";
import { RootState } from "@/app/Redux/store";
import { Match, statusMatch } from "@/app/(HeroSection)/agenda/types/TypesAgend";
// Import date-fns functions
import { 
  parseISO, 
  isSameDay, 
  isSameMonth, 
  isSameYear, 
  format, 
  parse
} from "date-fns";
import { es } from "date-fns/locale";
import { useCheckMatchExists} from "../hooks/tournament-keys-hooks";

type Props = {
  className?: string;
  hour: string;
  day: string;
  date: Date;
  isAuthenticated: boolean
};

export const MatchCell = ({ className, hour, day, date, isAuthenticated }: Props) => {
  const dispatch = useDispatch();
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [showMatchSelect, setShowMatchSelect] = useState<boolean>(false);
  const [showMatchDetails, setShowMatchDetails] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Get the delete match mutation
  const checkMatchExistsMutation = useCheckMatchExists();
  // Get matches from Redux store
  const allMatches = useSelector(
    (state: RootState) => state.matches.choseMatches
  );
  const selectedMatches = useSelector(
    (state: RootState) => state.matches.matches
  );
  const scheduledWeeks = useSelector(
    (state: RootState) => state.weekMatches.weeks
  );
  const deleteListWeeks = useSelector(
    (state: RootState) => state.weekMatches.matchesToDelete || []
  );


  // Normalize hour format using date-fns
  const normalizeHour = (timeString: string): string => {
    try {
      // Parse the time string into a Date object
      const time = parse(timeString, 'HH:mm', new Date());
      // Format it consistently as HH:00
      return format(time, 'HH:00');
    } catch (error) {
      // Fallback to simple string manipulation
      return hour.padStart(2, '0') + ":00";
    }
  };

  // Get day name in Spanish from date using date-fns
  // Update your getDayName function to maintain capitalization
const getDayName = (date: Date): string => {
  // This will return capitalized day names in Spanish
  return format(date, 'EEEE', { locale: es });
};

// Alternatively, you can use this method for case-insensitive comparison
const existingWeekMatch = scheduledWeeks.find((week) => {
  if (!week.date) return false;

  // Parse the date string into a Date object
  const weekDate = parseISO(week.date);
  
  // Compare full dates (year, month, day)
  const sameDate = isSameDay(weekDate, date) && 
                   isSameMonth(weekDate, date) && 
                   isSameYear(weekDate, date);
  
  // Get the Spanish day name from the date and normalize case for comparison
  const selectedDayName = getDayName(date);
  
  // Compare the day names case-insensitively
  const dayNameMatch = selectedDayName.toLowerCase() === week.day.toLowerCase();
  
  // Compare hours after normalizing to HH:00 format
  const hourMatch = normalizeHour(week.hour) === normalizeHour(hour);
  
  // Check if the match is in the delete list
  const inDeleteList = deleteListWeeks.includes(week.match.id);
  
  // Match exists if all conditions are true and not in delete list
  const matchExists = sameDate && dayNameMatch && hourMatch && !inDeleteList;
  
  if(week.day === day && week.hour === hour){ 
    console.log("---------------------");
    console.log(week);
    console.log(date);
    console.log("dayAPI", selectedDayName);
    console.log("week.day", week.day);
    console.log("dayNameMatch", dayNameMatch);
    console.log("Same date:", sameDate);
    console.log("Hour match:", hourMatch);
    console.log("Match exists:", matchExists);
  };
  
  return matchExists;
});

// For the existingMatch similarly update the comparison
const existingMatch = selectedMatches.find((match) => {
  if (!match.date) return false;

  // Parse the date string into a Date object
  const matchDate = parseISO(match.date);
  
  // Compare full dates using date-fns
  const sameDate = isSameDay(matchDate, date) && 
                   isSameMonth(matchDate, date) && 
                   isSameYear(matchDate, date);
  
  // Get the day name from the date
  const selectedDayName = getDayName(date);
  
  // Case-insensitive day name comparison
  const dayNameMatch = selectedDayName.toLowerCase() === match.day.toLowerCase();
  
  // Compare the hours
  const hourMatch = normalizeHour(match.hour) === normalizeHour(hour);
  
  return sameDate && dayNameMatch && hourMatch;
});

  // Get the current match - prioritize selectedMatches over scheduledWeeks
  const currentMatch = existingWeekMatch?.match || existingMatch?.match;

  // If there's a match, set the selected ID
  useEffect(() => {
    if (currentMatch) {
      setSelectedMatchId(currentMatch.id.toString());
    } else {
      setSelectedMatchId("");
    }
  }, [currentMatch]);

  // Save match function with all the restrictions possible to avoid duplicates

  // Updated saveMatch function with timezone handling fix
  const saveMatch = async () => {
  

    if (!selectedMatchId) return;
  
    const matchId = selectedMatchId;
  
    // Find the match in allMatches
    const matchInfo = allMatches.find((match) => match.id === matchId);
    if (!matchInfo) {
      alert("Partido no encontrado");
      return;
    }
  
    // Skip if already selected
    if (matchInfo.status.includes("SELECIONADO")) {
      return;
    }
  

    // Check if match is in delete list
    const isInDeleteList = deleteListWeeks.includes(matchId);
    if (isInDeleteList) {
      // If in delete list, skip the duplicate check for this specific slot
      const isAlreadySelectedInMatches = selectedMatches.some(
        (match) => 
          match.match.id === matchId && 
          (match.day !== day || 
           match.hour !== hour || 
           !isSameDate(parseISO(match.date), date))
      );
  
      if (isAlreadySelectedInMatches) {
        alert("Este partido ya está programado en otro horario");
        return;
      }
    } else {
      // Only check for duplicates if NOT in delete list
      const isAlreadyScheduledInWeeks = scheduledWeeks.some(
        (week) => 
          // week.match.id === matchId && 
          // (week.day !== day || 
          //  week.hour !== hour || 
          //  !isSameDate(parseISO(week.date), date))
          week.match.id === matchId
      );
  
      const isAlreadySelectedInMatches = selectedMatches.some(
        (match) => 
          match.match.id === matchId && 
          (match.day !== day || 
           match.hour !== hour || 
           !isSameDate(parseISO(match.date), date))
      );


      const matchStatus = allMatches.find((match) => match.id === matchId)?.status;

      if(!isAlreadyScheduledInWeeks){
      
      const matchExists = await (await checkMatchExistsMutation).mutateAsync(matchId);
      console.log("matchExists", matchExists);
        if (matchExists) {
          alert("Partido ya  existe en el servidFor");
          return;
        }
      }
  
      if ( isAlreadySelectedInMatches) {
        alert("Este partido ya está programado en otro horario");
        return;
      }


      if( matchStatus === "JUGADO")
      {
        alert("Este partido ya fue jugado");
        return;
      }
    }
  

    
    console.log("matchInfo", matchInfo); // Set status to "SELECIONADO" when adding to schedule
    const updatedMatch = { ...matchInfo, status: "SELECIONADO" as statusMatch };
  
    // Fix for timezone issues - Create a new date with year, month, and day explicitly
    // To avoid any timezone conversion issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayOfMonth = date.getDate(); // Renamed to avoid conflict with the day parameter
    
    // Create a new date at noon to avoid any timezone shift issues
    const fixedDate = new Date(year, month, dayOfMonth, 12, 0, 0);
    
    // Format the fixed date as ISO string and keep just the date part
    const dateString = format(fixedDate, "yyyy-MM-dd");
    
    // Get the correct day name from the fixed date
    const expectedDayName = format(fixedDate, 'EEEE', { locale: es });
    const formattedDayName = expectedDayName.charAt(0).toUpperCase() + expectedDayName.slice(1);
    
    console.log("Original date:", date.toISOString());
    console.log("Fixed date:", fixedDate.toISOString());
    console.log("Date string for API:", dateString);
    console.log("Day from date object:", formattedDayName);
    
    // Add to matches state with the correct day and date
    dispatch(
      addMatch({
        date: fixedDate.toISOString(),
        day: formattedDayName,
        hour,
        match: updatedMatch,
      })
    );
    dispatch(updateChoseMatch(updatedMatch));
  
    setShowMatchSelect(false);
  };


// Helper function to parse ISO date strings safely without timezone issues
  // Delete match function
  const deleteMatch = async () => {
    if (!currentMatch) {
      return;
    }
    try {
      setIsDeleting(true);

      const existingWeek = scheduledWeeks.find(week => week.match.id === currentMatch.id);
      if (existingWeek) {
        dispatch(addMatchToDeleteList(existingWeek.match.id));
      }

      // This will update the UI state
      dispatch(removeMatchId({ id: currentMatch.id }));
      
      setSelectedMatchId("");
      setShowMatchDetails(false);
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("Error al eliminar el partido");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle the selection if the match exists then will show the information about the match, 
  // if it doesn't exist will show the selection of the match
  const handleCellClick = () => {
    if (currentMatch) {
      setShowMatchDetails(!showMatchDetails);
    } else {
      setShowMatchSelect(!showMatchSelect); // activate the selection
    }
  };

  // Filter available matches
  const getAvailableMatches = () => {
    // Get all matches that are already scheduled
    const scheduledMatchIds = new Set();
    
    // Add matches from scheduledWeeks
    scheduledWeeks.forEach(week => {
      // Skip the match that's already in this cell
      if (existingWeekMatch && 
          week.match.id === existingWeekMatch.match.id &&
          week.day === day &&
          week.hour === hour &&
          isSameDate(parseISO(week.date), date)) {
        return;
      }
      scheduledMatchIds.add(week.match.id);
    });
    
    // Add matches from selectedMatches
    selectedMatches.forEach(match => {
      // Skip the match that's already in this cell
      if (existingMatch && 
          match.match.id === existingMatch.match.id &&
          match.day === day &&
          match.hour === hour &&
          isSameDate(parseISO(match.date), date)) {
        return;
      }
      scheduledMatchIds.add(match.match.id);
    });

    // Return matches that aren't already scheduled
    return allMatches.filter(match => !scheduledMatchIds.has(match.id));
  };

  // Check if a match is already scheduled somewhere else
  const isMatchScheduledElsewhere = (matchId: string) => {
    const isInWeeks = scheduledWeeks.some(
      (week) =>
        week.match.id === matchId &&
        (week.day !== day ||
          week.hour !== hour ||
          !isSameDate(parseISO(week.date), date))
    );
    
    const isInMatches = selectedMatches.some(
      (match) =>
        match.match.id === matchId &&
        (match.day !== day ||
          match.hour !== hour ||
          !isSameDate(parseISO(match.date), date))
    );
    
    return isInWeeks || isInMatches;
  };

  // Helper function to check if two dates are the same day
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return isSameDay(date1, date2) && 
           isSameMonth(date1, date2) && 
           isSameYear(date1, date2);
  };
  

  // Get status class for styling
  const getStatusClass = (status: statusMatch) => {
    switch (status) {
      // case "PENDIENTE":
      //   return "bg-yellow-100";
      case "SELECIONADO":
        return "bg-blue-100";
      case "JUGADO":
        return "bg-green-100";
      case "CANCELADO":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  // Format match information for dropdown options
  const formatMatchOption = (match: Match) => {
    let classification = [];

    if (match.phase) {
      classification.push(`Fase ${match.phase}`);
    }

    const classificationText =
      classification.length > 0 ? ` | ${classification.join(" | ")}` : "";


      const isInDeleteList = deleteListWeeks.includes(match.id);
    const statusIndicator =
      match.status === "SELECIONADO" && !isInDeleteList
        ? "🔵 "
        : match.status === "JUGADO"
        ? "✅ "
        // : match.status === "CANCELADO"
        // ? " "
        : match.status === "PENDIENTE"
        ? "⏳ "
        : "";

    // Add a red flag if the match is already scheduled elsewhere
    const alreadyScheduled = isMatchScheduledElsewhere(match.id);

    return {
      formattedText: `${statusIndicator}ID: ${match.id} - ${match.team1} vs ${match.team2}${classificationText}`,
      isScheduledElsewhere: alreadyScheduled,
    };
  };
 return (
  <div
    className={clsx(
      "relative min-h-16 p-2 cursor-pointer transition-all duration-300",
      "border-2 ",
      currentMatch 
        ? getStatusClass(currentMatch.status)
        : "border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
      className
    )}
    onClick={handleCellClick}
  >
    {currentMatch ? (
      <div className="h-full w-full">
        {showMatchDetails ? (
          <div
            className={clsx(
              "absolute top-0 left-0 z-20 shadow-xl p-3 w-80 rounded-lg",
              "bg-white/95 dark:bg-gray-900/95 ",
              "border border-gray-200 dark:border-gray-700",
              "transform transition-all duration-300 ease-in-out"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-company-green bg-clip-text text-transparent dark:from-blue-400 dark:to-company-green">
                Detalles del Partido
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMatchDetails(false);
                }}
                className={clsx(
                  "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                )}
              >
                <FaTimes size={12} /> 
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="text-xs opacity-70">
                <span className="font-semibold">ID:</span> {currentMatch.id}
              </div>
              
              <div className="font-semibold text-base text-gray-800 dark:text-white">
                {currentMatch.team1} <span className="text-gray-500 dark:text-gray-400 text-sm mx-1">vs</span> {currentMatch.team2}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <div className={clsx(
                  "px-2 py-1 rounded-full text-xs inline-flex items-center",
                  "bg-gray-100/80 dark:bg-gray-800/80"
                )}>
                  <span className="font-medium">{currentMatch.category}</span>
                </div>
                
                {currentMatch.phase && (
                  <div className={clsx(
                    "px-2 py-1 rounded-full text-xs inline-flex items-center",
                    "bg-gray-100/80 dark:bg-gray-800/80"
                  )}>
                    <span className="font-medium">Fase: {currentMatch.phase}</span>
                  </div>
                )}
              </div>
              
              <div className={clsx(
                "p-2 rounded-lg",
                "bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              )}>
                <span className="font-semibold">Programado:</span> {day} - {hour}
              </div>
              
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs inline-flex items-center",
                currentMatch.status === "PENDIENTE" && "bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
                currentMatch.status === "SELECIONADO" && "bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
                currentMatch.status === "JUGADO" && "bg-green-100/70 dark:bg-green-900/30 text-green-800 dark:text-green-400",
                currentMatch.status === "CANCELADO" && "bg-red-100/70 dark:bg-red-900/30 text-red-800 dark:text-red-400"
              )}>
                <span className="font-medium">{currentMatch.status}</span>
              </div>
            </div>

            {/* Delete match button - only shown to authenticated users */}
            {isAuthenticated && currentMatch.status !== "JUGADO" && (
              <div className="flex mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMatch();
                  }}
                  disabled={isDeleting}
                  className={clsx(
                    "w-full text-center text-xs py-2 rounded-lg flex items-center justify-center transition-colors",
                    "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                    "text-white shadow-sm hover:shadow-md disabled:opacity-50"
                  )}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Eliminando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FaTimes className="mr-1" /> 
                      <span>Eliminar Partido</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          // Basic information when not expanded
          <div className="flex flex-col justify-between h-full text-xs text-gray-800 dark:text-gray-200">
            <div className="font-bold truncate">
              {currentMatch.team1} vs {currentMatch.team2}
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {currentMatch.category}
              </span>
              
              {/* Small delete button - only shown to authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMatch();
                  }}
                  disabled={isDeleting}
                  className={clsx(
                    "p-1 rounded-full text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                    "hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors"
                  )}
                >
                  {isDeleting ? (
                    <div className="h-3 w-3 border-2 border-t-transparent border-red-500 dark:border-red-400 rounded-full animate-spin"></div>
                  ) : (
                    <FaTimes size={12} />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    ) : isAuthenticated && showMatchSelect ? (
      <div
        className={clsx(
          "absolute top-0 left-0 z-[200] shadow-lg p-3 w-80 rounded-lg",
          "bg-white/95 dark:bg-gray-900/95 ",
          "border border-gray-200 dark:border-gray-700",
          "transform transition-all duration-300 ease-in-out"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={clsx(
          "text-sm font-semibold mb-3 pb-2 border-b",
          "border-gray-200 dark:border-gray-700"
        )}>
          {day} - {hour}
        </div>

        <select
          className={clsx(
            "w-full p-2 rounded-lg mb-3 text-sm",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-600/40"
          )}
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
        >
          <option value="">Seleccionar partido</option>
          {getAvailableMatches().map((match) => {
            const { formattedText, isScheduledElsewhere } =
              formatMatchOption(match);
            return (
              <option
                key={match.id}
                value={match.id}
                className={isScheduledElsewhere ? "text-red-500 dark:text-red-400" : ""}
              >
                {formattedText}{" "}
                {isScheduledElsewhere ? "⚠️ (Ya programado)" : ""}
              </option>
            );
          })}
        </select>

        {/* Show extra information about selected match */}
        {selectedMatchId && (
          <div className={clsx(
            "p-3 z-100 mb-3 rounded-lg",
            "bg-gray-50/80 dark:bg-gray-800/80 ",
            "border border-gray-200/60 dark:border-gray-700/60"
          )}>
            {(() => {
              const match = allMatches.find((m) => m.id === selectedMatchId);
              if (!match) return null;

              const isAlreadyScheduled = isMatchScheduledElsewhere(match.id);

              return (
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-semibold">Equipos:</span>{" "}
                    {match.team1} vs {match.team2}
                  </div>
                  <div>
                    <span className="font-semibold">Categoría:</span>{" "}
                    {match.category}
                  </div>
                  {match.phase && (
                    <div><span className="font-semibold">Fase:</span> {match.phase}</div>
                  )}

                  {isAlreadyScheduled && (
                    <div className={clsx(
                      "mt-2 p-2 rounded-lg text-red-600 dark:text-red-400 font-medium text-sm",
                      "bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    )}>
                      ⚠️ Este partido ya está programado en otro horario
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <div className="flex gap-2 z-[100]">
          <button
            onClick={saveMatch}
            disabled={
              !selectedMatchId ||
              isMatchScheduledElsewhere(String(selectedMatchId))
            }
            className={clsx(
              "flex-1 py-2 rounded-lg flex items-center justify-center text-sm transition-colors",
              !selectedMatchId || isMatchScheduledElsewhere(String(selectedMatchId))
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md"
            )}
          >
            <FaCalendarCheck className="mr-1" /> Programar 
          </button>

          <button
            onClick={() => setShowMatchSelect(false)}
            className={clsx(
              "flex-1 py-2 rounded-lg flex items-center justify-center text-sm transition-colors",
              "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white",
              "shadow-sm hover:shadow-md"
            )}
          >
            <FaTimes className="mr-1" /> Cancelar
          </button>
        </div>
      </div>
    ) : (
      // Show "add new" icon only for authenticated users, otherwise show empty cell
      isAuthenticated ? (
        <div className={clsx(
          "w-full h-full flex items-center justify-center transition-colors",
          "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
        )}>
          <FaPlus />
        </div>
      ) : (
        <div className="w-full h-full"></div>
      )
    )}
  </div>
);
};