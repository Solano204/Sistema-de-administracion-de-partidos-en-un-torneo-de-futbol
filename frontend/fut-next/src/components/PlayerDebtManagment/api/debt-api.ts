// File: src/app/features/debt/api/debt-api.ts
"use server";

import axios from "axios";
import { DebtRecordDto, DebtStatus, PlayerSummaryRecord } from "../types/debt-types";
import { DebtRecordCreateSchema, DebtRecordEditSchema } from "../schemas/debt-schema";
import { cookies } from "next/headers";

/**
 * Query key factory with improved types
 */

/**
 * API Client configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/debts/players`,
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
 * Create a new player debt
 */
export const createPlayerDebt = async (debt: unknown): Promise<DebtRecordDto> => {
  try {
    const validatedData = DebtRecordCreateSchema.parse(debt);
    
    // Convert to backend-compatible format
    const payload = {
      ...validatedData,
      // Ensure required fields for backend
      nameProperty: validatedData.nameProperty || "carlos josue lopez",
      dueDate: validatedData.dueDate
    };

    const response = await apiClient.post("", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing player debt
 */
export const updatePlayerDebt = async (debtId: string, debt: unknown): Promise<DebtRecordDto> => {
  try {
    const validatedData = DebtRecordEditSchema.parse(debt);
    
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
 * Update debt status
 */
export const updateDebtStatus = async (
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
 * Fetch all debts for a player
 */
export const fetchPlayerDebts = async (playerId: string): Promise<DebtRecordDto[]> => {
  try {
    const response = await apiClient.get(`/${playerId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a debt by ID
 */
export const deleteDebtById = async (debtId: string): Promise<void> => {
  try {
    await apiClient.delete(`/${debtId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete all player debts
 */
export const deleteAllPlayerDebts = async (playerId: string): Promise<void> => {
  try {
    await apiClient.delete(`/${playerId}/all`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete player debt by date
 */
export const deletePlayerDebtByDate = async (
  playerId: string,
  dueDate: string
): Promise<void> => {
  try {
    await apiClient.delete(`/${playerId}/date`, { params: { dueDate } });
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Search players by name
 */
export const searchPlayersByName = async (playerName: string): Promise<PlayerSummaryRecord[]> => {
    try {
      console.log(`Searching for players with name: ${playerName}`);
      const response = await apiClient.get("/get-players-by-name", {
        params: { playerName }
      });
      console.log("Search results:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error searching players:", error);
      return handleApiError(error);
    }
  };