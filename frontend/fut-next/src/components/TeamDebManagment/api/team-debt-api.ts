// File: src/app/features/teamDebt/api/team-debt-api.ts
"use server";

import axios from "axios";
import { TeamDebtRecordDto, DebtStatus, TeamNameIdRecord } from "../types/team-debt-types";
import { TeamDebtRecordCreateSchema, TeamDebtRecordEditSchema } from "../schemas/team-debt-schema";
import { cookies } from "next/headers";

/**
 * Query key factory with improved types
 */

/**
 * API Client configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/debts/teams`,
  headers: {
    "Content-Type": "application/json",
    // Add auth headers if needed
  },
});
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
 * Error handling wrapper for API calls
 */
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    // Handle Axios specific errors
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  // Handle other errors
  throw error;
};

/**
 * Create a new team debt
 */
export const createTeamDebt = async (debt: unknown): Promise<TeamDebtRecordDto> => {
  try {
    const validatedData = TeamDebtRecordCreateSchema.parse(debt);
    
    // Convert to backend-compatible format
    const payload = {
      ...validatedData,
      // Ensure required fields for backend
      nameProperty: validatedData.nameProperty || "team name",
      dueDate: validatedData.dueDate
    };

    const response = await apiClient.post("", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing team debt
 */
export const updateTeamDebt = async (debtId: string, debt: unknown): Promise<TeamDebtRecordDto> => {
  try {
    const validatedData = TeamDebtRecordEditSchema.parse(debt);
    
    // Convert to backend-compatible format
    const payload = {
      ...validatedData,
      Id: debtId // Ensure ID from URL is used
    };

    const response = await apiClient.put(`/${debtId}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update team debt status
 */
export const updateTeamDebtStatus = async (
  debtId: string,
  status: DebtStatus,
  paidDate: string
): Promise<boolean> => {
  try {
    const response = await apiClient.put(`/${debtId}/status`, null, {
      params: { status, paidDate },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch all debts for a team
 */
export const fetchTeamDebts = async (teamId: string): Promise<TeamDebtRecordDto[]> => {
  try {
    const response = await apiClient.get(`/${teamId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a team debt by ID
 */
export const deleteTeamDebtById = async (debtId: string): Promise<void> => {
  try {
    await apiClient.delete(`/${debtId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete all team debts
 */
export const deleteAllTeamDebts = async (teamId: string): Promise<void> => {
  try {
    await apiClient.delete(`/${teamId}/all`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete team debt by date
 */
export const deleteTeamDebtByDate = async (
  teamId: string,
  dueDate: string
): Promise<void> => {
  try {
    await apiClient.delete(`/${teamId}/date`, { params: { dueDate } });
  } catch (error) {
    return handleApiError(error);
  }
};
/**
 * Search teams by name
 */
export const searchTeamsByName = async (teamName: string): Promise<TeamNameIdRecord[]> => {
  try {
    const response = await apiClient.get("/get-teams-by-name", {
      params: { teamName }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};