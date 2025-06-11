"use server";
import axios from "axios";
import { format, parseISO } from 'date-fns';
import { cookies } from 'next/headers';
import {
  TournamentInfoRecord,
  MatchScheduleInfoRecord,
  DivisionAdvancementStatus,
  TournamentStageInfo,
  DivisionEntity,
  WeeklyScheduleRecordRequest,
} from "../types/tournament-types";
import { Match, week, statusMatch } from "@/app/(HeroSection)/agenda/types/TypesAgend";

/**
 * API Client configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor for adding auth token
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    // If token exists, add it to the headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/**
 * Helper function to safely parse date strings
 */
const safelyParseDate = async (dateString: string): Promise<Date> => {
  try {
    const date = parseISO(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    console.error('Invalid date string:', dateString);
    return new Date();
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export async function formatDateForApi(date: Date): Promise<string> {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get matches in date range
 */
export async function fetchMatchesInDateRange(startDate: string, endDate: string): Promise<MatchScheduleInfoRecord[]> {
  if (!startDate || !endDate) {
    throw new Error('Invalid date range');
  }

  const response = await apiClient.get<MatchScheduleInfoRecord[]>("/tournaments/matches", {
    params: { startDate, endDate },
  });
  
  return response.data;
}

/**
 * Convert API match to UI match format
 */
export const convertToUiMatch = async (match: MatchScheduleInfoRecord):Promise<Match> => {
  return {
    id: String(match.matchId),
    team1: match.homeTeamName,
    team2: match.awayTeamName,
    status: match.status as statusMatch || "PENDIENTE",
    phase: match.phase as string  || undefined,
    category: match.categoryName as string ,
    tourmentId: match.tournamentId,
    tournamentName: match.tournamentName
  };
};

/**
 * Convert API match to week format
 */
export const convertApiMatchToWeek = async (apiMatch: MatchScheduleInfoRecord): Promise<week> => ({
  date: apiMatch.matchDate,
  day: apiMatch.matchDay,
  hour: apiMatch.matchTime.substring(0, 5),
  match: {
    id: apiMatch.matchId,
    team1: apiMatch.homeTeamName,
    team2: apiMatch.awayTeamName,
    status: apiMatch.status as statusMatch,
    tourmentId: apiMatch.tournamentId,
    tournamentName: apiMatch.tournamentName,
    phase: apiMatch.phase,
    category: apiMatch.categoryName
  }
});

/**
 * Convert UI match to API format
 */
export const convertToApiMatch = async (match: Match, dateString: string, day: string, hour: string): Promise<WeeklyScheduleRecordRequest> => {
  const date = await safelyParseDate(dateString);
  const formattedDate = format(date, 'yyyy-MM-dd');
  const formattedHour = hour.includes(':') ? hour : `${hour}:00`;
    
  return {
    id: match.id.toString(),
    matchId: match.id.toString(),
    tournamentId: match.tourmentId,
    matchDay: day,
    matchDate: formattedDate,
    matchTime: formattedHour,
    homeTeamName: match.team1,
    awayTeamName: match.team2,
    tournamentName: match.tournamentName,
    categoryName: match.category,
    phase: match.phase || "",
    status: match.status,
  };
};

/**
 * Schedule matches
 */
export async function scheduleMatches(weeklySchedule: week[]): Promise<WeeklyScheduleRecordRequest[]> {
  const apiSchedule = await Promise.all(
    weeklySchedule.map(week => 
      convertToApiMatch(week.match, week.date, week.day, week.hour)
    )
  );
  
  const response = await apiClient.post<WeeklyScheduleRecordRequest[]>(
    "/tournaments/schedule",
    apiSchedule
  );
  
  return response.data;
}

/**
 * Delete match schedule
 */
export async function deleteMatchSchedule(matchId: string): Promise<boolean> {
  const response = await apiClient.delete(`/tournaments/delete-match/${matchId}`);
  return response.data;
}

/**
 * Check if match exists
 */
export async function checkMatchExists(matchId: string): Promise<boolean> {
  const response = await apiClient.get<boolean>(`/tournaments/existing-match/${matchId}`);
  return response.data;
}

/**
 * Get tournaments for category
 */
export async function fetchTournamentsForCategory(categoryId: string): Promise<TournamentInfoRecord[]> {
  const response = await apiClient.get<TournamentInfoRecord[]>(`/tournaments/categories/${categoryId}`);
  return response.data;
}

/**
 * Initialize tournament
 */
export async function initializeTournament(tournamentInfo: TournamentInfoRecord): Promise<TournamentInfoRecord> {
  const response = await apiClient.post<TournamentInfoRecord>('/tournaments/initialize', tournamentInfo);
  return response.data;
}

/**
 * Simulate round robin matches
 */
export async function simulateRoundRobinMatches(tournamentId: string): Promise<void> {
  await apiClient.post(`/tournaments/${tournamentId}/simulate-round-robin`);
}

/**
 * Create divisions
 */
export async function createTournamentDivisions(tournamentId: string): Promise<void> {
  await apiClient.post(`/tournaments/${tournamentId}/create-divisions`);
}

/**
 * Advance to next phase
 */
export async function advanceToNextPhase(tournamentId: string, divisionName: string): Promise<void> {
  await apiClient.post(
    `/tournaments/${tournamentId}/advance-phase`,
    null,
    { params: { divisionName } }
  );
}

/**
 * Simulate elimination matches
 */
export async function simulateEliminationMatches(tournamentId: string, divisionName: string): Promise<void> {
  await apiClient.post(
    `/tournaments/${tournamentId}/simulate-elimination`,
    null,
    { params: { divisionName } }
  );
}

/**
 * Check division advancement status
 */
export async function fetchDivisionAdvancementStatus(
  tournamentId: string, 
  divisionId: string, 
  categoryId: string
): Promise<DivisionAdvancementStatus> {
  const response = await apiClient.get<DivisionAdvancementStatus>(
    `/tournaments/${tournamentId}/divisions/${divisionId}/${categoryId}/advancement-status`
  );
  return response.data;
}

/**
 * Check tournament stage
 */
export async function fetchTournamentStage(tournamentId: string, categoryId: string): Promise<TournamentStageInfo> {
  const response = await apiClient.get<TournamentStageInfo>(
    `/tournaments/${tournamentId}/divisions/${categoryId}/check-out`
  );
  return response.data;
}

/**
 * Get divisions for tournament
 */
export async function fetchDivisionsForTournament(tournamentId: string): Promise<DivisionEntity[]> {
  const response = await apiClient.get<DivisionEntity[]>(`/tournaments/${tournamentId}/divisions`);
  return response.data;
}

/**
 * Helper function to get the earliest date from an array of week objects
 */
export async function getEarliestDate(weeks: week[]): Promise<Date | null> {
  if (weeks.length === 0) return null;
  
  return weeks.reduce((earliest, week) => {
    const weekDate = new Date(week.date);
    return weekDate < earliest ? weekDate : earliest;
  }, new Date(weeks[0].date));
}

/**
 * Helper function to get the latest date from an array of week objects
 */
export async function getLatestDate(weeks: week[]): Promise<Date | null> {
  if (weeks.length === 0) return null;
  
  return weeks.reduce((latest, week) => {
    const weekDate = new Date(week.date);
    return weekDate > latest ? weekDate : latest;
  }, new Date(weeks[0].date));
}