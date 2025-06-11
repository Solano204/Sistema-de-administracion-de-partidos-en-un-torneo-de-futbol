// File: src/app/features/tournament/api/tournament-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CategoryInfoRecord,
  TournamentInfoRecord,
  TournamentStageInfo,
  DivisionEntity,
  DivisionAdvancementStatus
} from "../types/tournament-types";

/**
 * API Client configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
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
 * Error handling wrapper for API calls
 */
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/Soccer");
    throw new Error(errorMessage);
  }
  throw error;
};

/**
 * Fetch all categories
 */
export async function fetchAllCategories(): Promise<CategoryInfoRecord[]> {
  try {
    const response = await apiClient.get("/categories");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch tournaments by category
 */
export async function fetchTournamentsByCategory(categoryId: string): Promise<TournamentInfoRecord[]> {
  try {
    if (!categoryId) return [];
    const response = await apiClient.get(`/tournaments/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch team count by category
 */
export async function fetchTeamCountByCategory(categoryId: string): Promise<number> {
  try {
    if (!categoryId) return 0;
    const response = await apiClient.get(`/tournaments/amountTeams/${categoryId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch tournament stage info
 */
export async function fetchTournamentStageInfo(
  tournamentId: string,
  categoryId: string
): Promise<TournamentStageInfo | null> {
  try {
    if (!tournamentId || !categoryId) return null;
    const response = await apiClient.get(`/tournaments/${tournamentId}/divisions/${categoryId}/check-out`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch divisions by tournament
 */
export async function fetchDivisionsByTournament(tournamentId: string): Promise<DivisionEntity[]> {
  try {
    if (!tournamentId) return [];
    const response = await apiClient.get(`/tournaments/${tournamentId}/divisions`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch division advancement status
 */
export async function fetchDivisionStatus(
  tournamentId: string,
  divisionId: string,
  categoryId: string
): Promise<DivisionAdvancementStatus | null> {
  try {
    if (!tournamentId || !divisionId || !categoryId) return null;
    const response = await apiClient.get(`/tournaments/${tournamentId}/divisions/${divisionId}/${categoryId}/advancement-status`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new tournament
 */
export async function createTournament(tournamentInfo: TournamentInfoRecord): Promise<TournamentInfoRecord> {
  try {
    const response = await apiClient.post(`/tournaments/initialize`, tournamentInfo);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create divisions for a tournament
 */
export async function createDivisions(tournamentId: string): Promise<void> {
  try {
    await apiClient.post(`/tournaments/${tournamentId}/create-divisions`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Advance tournament phase
 */
export async function advancePhase(tournamentId: string, divisionName: string): Promise<void> {
  try {
    await apiClient.post(`/tournaments/${tournamentId}/advance-phase?divisionName=${encodeURIComponent(divisionName)}`);
  } catch (error) {
    return handleApiError(error);
  }
}