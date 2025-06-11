// File: src/app/features/inscription/api/inscription-api.ts
"use server";

import axios from "axios";
import { InscriptionInfoRecord, TeamSummaryRecord } from "../types/inscription-types";
import { InscriptionCreateSchema, InscriptionEditSchema } from "../schemas/inscription-schema";
import { cookies } from "next/headers";


/**
 * API Client configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/inscriptions`,
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
 * Create a new inscription
 */
export const createInscription = async (inscription: unknown): Promise<InscriptionInfoRecord> => {
  try {
    const validatedData = InscriptionCreateSchema.parse(inscription);
    
    const response = await apiClient.post("", validatedData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing inscription
 */
export const updateInscription = async (id: string, inscription: unknown): Promise<InscriptionInfoRecord> => {
  try {
    const validatedData = InscriptionEditSchema.parse(inscription);
    
    const response = await apiClient.put(`/${id}`, validatedData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch all inscriptions
 */
export const fetchAllInscriptions = async (): Promise<InscriptionInfoRecord[]> => {
  try {
    const response = await apiClient.get("");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch recent inscriptions
 */
export const fetchRecentInscriptions = async (): Promise<InscriptionInfoRecord[]> => {
  try {
    const response = await apiClient.get("/recent");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// /**
//  * Fetch paginated inscriptions
//  */
// export const fetchPaginatedInscriptions = async (
//   page: number = 0,
//   size: number = 10,
//   sortBy: string = "date"
// ): Promise<{
//   content: InscriptionInfoRecord[],
//   totalElements: number,
//   totalPages: number,
//   size: number,
//   number: number
// }> => {
//   try {
//     const response = await apiClient.get("/paginated", {
//       params: { page, size, sortBy }
//     });
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// };

/**
 * Fetch an inscription by ID
 */
export const fetchInscriptionById = async (id: string): Promise<InscriptionInfoRecord> => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete an inscription by ID
 */
export const deleteInscriptionById = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Search inscriptions by team name
 */
export const searchInscriptionsByTeam = async (
  teamName: string, 
  containing: boolean = false
): Promise<InscriptionInfoRecord[]> => {
  try {
    console.log(`Searching for inscriptions with team name: ${teamName}, containing: ${containing}`);
    const response = await apiClient.get("/by-team", {
      params: { 
        teamName,
        containing
      }
    });
    console.log("Search results:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching inscriptions:", error);
    return handleApiError(error);
  }
};

/**
 * Search teams by name
 */
export const searchTeamsByName = async (teamName: string): Promise<TeamSummaryRecord[]> => {
  try {
    console.log(`Searching for teams with name: ${teamName}`);
    const response = await axios.get("http://localhost:8080/api/teams/search", {
      params: { teamName }
    });
    console.log("Search results:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching teams:", error);
    return handleApiError(error);
  }
};