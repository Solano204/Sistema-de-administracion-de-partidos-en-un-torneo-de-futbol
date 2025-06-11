"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { removeMatchId } from "@/app/Redux/feature/Matches/matchSlice";
import {
  initWeeks,
  addMatchToDeleteList,
} from "@/app/Redux/feature/Matches/WeekSlice";
import { RootState } from "@/app/Redux/store";
import clsx from "clsx";
import { statusMatch } from "@/app/(HeroSection)/agenda/types/TypesAgend";

// Lazy load heavy components
const MatchCell = dynamic(() =>
  import("./components/Cell").then((mod) => ({ default: mod.MatchCell }))
);
const MatchSelectorToggle = dynamic(() =>
  import("./components/Selector").then((mod) => ({
    default: mod.MatchSelectorToggle,
  }))
);
const ChangeTracker = dynamic(() =>
  import("./components/Tracker").then((mod) => ({ default: mod.ChangeTracker }))
);
const GeneralContainer = dynamic(() =>
  import("./components/GeneralContainer").then((mod) => ({
    default: mod.GeneralContainer,
  }))
);

// Import only essential date-fns functions
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  getDay,
  parseISO,
  isWithinInterval,
  formatISO,
} from "date-fns";
import { es } from "date-fns/locale";

import {
  getAuthUser,
  getAuthUserAdmin,
} from "@/app/utils/Domain/AuthenticationActions/AuthUser";
import { useMatchesInDateRange } from "./hooks/tournament-keys-hooks";

// Move constants outside component to prevent recreation
const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const HOURS_RANGE = Array.from({ length: 18 }, (_, i) => i + 5); // 5:00 to 22:00

// Helper functions moved outside component to prevent recreation
const formatDateForApi = (date: Date): string => {
  return formatISO(date, { representation: "date" });
};

const formatDateDisplay = (date: Date): string => {
  return format(date, "dd/MM/yyyy", { locale: es });
};

const formatTimeDisplay = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return format(date, "HH:00");
};

const getInitialWeekDates = () => {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

const getStatusClass = (status: statusMatch) => {
  switch (status) {
    case "PENDIENTE":
      return "bg-yellow-100 border-yellow-300";
    case "SELECIONADO":
      return "bg-blue-100 border-blue-300";
    case "JUGADO":
      return "bg-green-100 border-green-300";
    case "CANCELADO":
      return "bg-red-100 border-red-300";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const WeeklyMatchesSchedule: React.FC = () => {
  const dispatch = useDispatch();
  const [currentWeekDates, setCurrentWeekDates] = useState<Date[]>(
    getInitialWeekDates()
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Fixed auth check with proper dependency array
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const [session, sessionAdmin] = await Promise.all([
          getAuthUser(),
          getAuthUserAdmin(),
        ]);

        if (isMounted) {
          setIsAuthenticated(!!(session && sessionAdmin));
          setAuthLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - runs only once

  // Redux state
  const currentWeekMatches = useSelector(
    (state: RootState) => state.weekMatches.weeks
  );
  const scheduledWeeks = useSelector(
    (state: RootState) => state.weekMatches.weeks
  );

  // Memoized API query dates
  const apiDates = useMemo(() => {
    if (currentWeekDates.length === 0) return { startDate: "", endDate: "" };
    return {
      startDate: formatDateForApi(currentWeekDates[0]),
      endDate: formatDateForApi(currentWeekDates[6]),
    };
  }, [currentWeekDates]);

  // Fetch matches for the current week
  const {
    data: matchesData,
    isLoading: isLoadingMatches,
    isError: isMatchesError,
    error: matchesError,
  } = useMatchesInDateRange(apiDates.startDate, apiDates.endDate);

  // Update Redux with current week matches when data changes
  useEffect(() => {
    if (matchesData) {
      dispatch(initWeeks(matchesData));
    }
  }, [matchesData, dispatch]);

  // Memoized navigation functions
  const navigateWeek = useCallback((direction: "previous" | "next") => {
    setCurrentWeekDates((prevDates) => {
      const firstDay = prevDates[0];
      const newFirstDay =
        direction === "previous" ? addDays(firstDay, -7) : addDays(firstDay, 7);

      return Array.from({ length: 7 }, (_, i) => addDays(newFirstDay, i));
    });
  }, []);

  const goToPreviousWeek = useCallback(
    () => navigateWeek("previous"),
    [navigateWeek]
  );
  const goToNextWeek = useCallback(() => navigateWeek("next"), [navigateWeek]);

  // Optimized filtered matches with better memoization
  const filteredCurrentWeekMatches = useMemo(() => {
    if (!currentWeekDates.length || !scheduledWeeks.length) return [];

    const startOfWeekDate = new Date(currentWeekDates[0]);
    startOfWeekDate.setHours(0, 0, 0, 0);

    const endOfWeekDate = new Date(currentWeekDates[6]);
    endOfWeekDate.setHours(23, 59, 59, 999);

    return scheduledWeeks.filter((week) => {
      if (!week.date) return false;
      const matchDate = parseISO(week.date);
      return isWithinInterval(matchDate, {
        start: startOfWeekDate,
        end: endOfWeekDate,
      });
    });
  }, [currentWeekDates, scheduledWeeks]);

  // Memoized current day index
  const currentDayIndex = useMemo(() => {
    const dayIndex = getDay(new Date());
    return dayIndex === 0 ? 6 : dayIndex - 1;
  }, []);

  // Memoized handle remove match
  const handleRemoveMatch = useCallback(
    (matchId: string) => {
      if (!matchId) return;

      try {
        const existingWeek = scheduledWeeks.find(
          (week) => week.match.id === matchId
        );
        if (existingWeek) {
          dispatch(addMatchToDeleteList(matchId));
        }
        dispatch(removeMatchId({ id: matchId }));
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("Error al eliminar el partido");
      }
    },
    [scheduledWeeks, dispatch]
  );

  // Memoized filtered matches for display
  const displayMatches = useMemo(() => {
    return (
      currentWeekMatches?.filter(
        (match) => filterStatus === "all" || match.match.status === filterStatus
      ) || []
    );
  }, [currentWeekMatches, filterStatus]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl overflow-auto z-[10] mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md text-black dark:text-white">
        <h1 className="text-3xl font-bold text-center mb-6 dark:text-gray-100">
          Agenda Semanal de Partidos
        </h1>

        {/* Week navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousWeek}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Semana Anterior
          </button>

          <div className="text-lg font-semibold dark:text-gray-200">
            {currentWeekDates.length > 0 && (
              <span>
                {formatDateDisplay(currentWeekDates[0])} -{" "}
                {formatDateDisplay(currentWeekDates[6])}
              </span>
            )}
          </div>

          {isAuthenticated && (
            <div className="rounded p-2 w-[29%] h-full">
              <MatchSelectorToggle />
            </div>
          )}

          <button
            onClick={goToNextWeek}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Siguiente Semana
          </button>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="text-sm font-semibold dark:text-gray-300">
            Estado:
          </div>
          <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-xs dark:text-yellow-200">
            Pendiente
          </div>
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-xs dark:text-blue-200">
            Seleccionado
          </div>
          <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-xs dark:text-green-200">
            Jugado
          </div>
          <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-xs dark:text-red-200">
            Cancelado
          </div>
        </div>

        {/* Loading state */}
        {isLoadingMatches && (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 dark:border-blue-400 border-r-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Cargando partidos...
            </p>
          </div>
        )}

        {/* Error state */}
        {isMatchesError && (
          <div className="text-center py-4 text-red-500 dark:text-red-400">
            <p>Error al cargar los partidos</p>
            <p className="text-sm">
              {matchesError?.message || "Error desconocido"}
            </p>
          </div>
        )}

        {/* Weekly agenda table */}
        {!isLoadingMatches && !isMatchesError && (
          <div className="overflow-x-auto mb-6 z-0">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    Hora
                  </th>
                  {DAYS_OF_WEEK.map((day, index) => {
                    const currentDate = currentWeekDates[index];
                    const isToday =
                      currentDate && isSameDay(currentDate, new Date());

                    return (
                      <th
                        key={day}
                        className={clsx(
                          "border p-2 dark:border-gray-700 dark:text-gray-300",
                          index === currentDayIndex && isToday
                            ? "bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700"
                            : "bg-gray-100 dark:bg-gray-800"
                        )}
                      >
                        {day}
                        {currentDate && (
                          <div className="text-xs dark:text-gray-400">
                            {formatDateDisplay(currentDate)}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS_RANGE.map((hour) => (
                  <tr key={hour}>
                    <td className="border p-2 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 font-medium text-center dark:text-gray-300">
                      {formatTimeDisplay(hour)}
                    </td>
                    {DAYS_OF_WEEK.map((day, dayIndex) => {
                      const currentDate = currentWeekDates[dayIndex];
                      const hourStr = formatTimeDisplay(hour);
                      const isToday =
                        currentDate && isSameDay(currentDate, new Date());

                      return (
                        <td
                          key={`${day}-${hour}`}
                          className="p-0 dark:border-gray-700"
                        >
                          {currentDate && (
                            <MatchCell
                              isAuthenticated={isAuthenticated}
                              hour={hourStr}
                              day={day}
                              date={currentDate}
                              className={
                                dayIndex === currentDayIndex && isToday
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "dark:bg-gray-900"
                              }
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAuthenticated && (
          <React.Fragment>
            <GeneralContainer />
            <ChangeTracker isAuthenticated={isAuthenticated} />
          </React.Fragment>
        )}

        {isAuthenticated && (
          <div className="mt-6 border-t dark:border-gray-700 pt-4 dark:text-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Partidos programados ({currentWeekMatches?.length || 0})
              </h2>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-black focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="SELECIONADO">Seleccionado</option>
                <option value="JUGADO">Finalizado</option>
              </select>
            </div>

            <div className="space-y-2">
              {displayMatches.length > 0 ? (
                displayMatches.map((match) => (
                  <div
                    key={match.match.id}
                    className={clsx(
                      "p-3 border rounded-lg flex flex-wrap md:flex-nowrap gap-2 justify-between items-center",
                      "shadow-sm hover:shadow transition-all duration-200",
                      "border-gray-200 dark:border-gray-700",
                      "bg-white dark:bg-gray-800/50",
                      getStatusClass(match.match.status)
                    )}
                  >
                    <div className="flex-shrink-0 w-36">
                      <strong className="text-gray-800 dark:text-gray-200">
                        {match.day}, {match.hour}
                      </strong>
                      {match.date && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDateDisplay(parseISO(match.date))}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow font-medium text-gray-800 dark:text-gray-200">
                      {match.match.team1} vs {match.match.team2}
                    </div>

                    <div className="flex-shrink-0 text-sm text-gray-700 dark:text-gray-300">
                      <div>{match.match.category}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {match.match.phase && `Fase: ${match.match.phase}`}
                      </div>
                    </div>

                    {match.match.status === "JUGADO" && (
                      <button
                        onClick={() => handleRemoveMatch(match.match.id)}
                        className={clsx(
                          "flex-shrink-0 ml-2 rounded-full p-1 transition-colors",
                          "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                          "hover:bg-red-100 dark:hover:bg-red-900/30",
                          "flex items-center"
                        )}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Eliminar
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div
                  className={clsx(
                    "text-center py-8 rounded-lg p-6 border",
                    "bg-gray-50 dark:bg-gray-800/50",
                    "border-gray-200 dark:border-gray-700",
                    "text-gray-600 dark:text-gray-300"
                  )}
                >
                  No hay partidos programados para esta semana con los filtros
                  seleccionados
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyMatchesSchedule;
