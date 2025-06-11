// File: src/app/features/credential/api/credential-api.ts
"use server";

import axios from "axios";
import { CredentialInfoRecord, PlayerSummaryRecord } from "../types/credential-types";
import { CredentialCreateSchema, CredentialEditSchema } from "../schemas/credential-schema";
import { cookies } from "next/headers";


/**
 * API Client configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/credentials`,
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
 * Create a new credential
 */
export const createCredential = async (credential: unknown): Promise<CredentialInfoRecord> => {
  try {
    const validatedData = CredentialCreateSchema.parse(credential);
    
    // Convert to backend-compatible format
    const payload = {
      ...validatedData,
      // Ensure date is in correct format
      // transactionDate: new Date(validatedData.transactionDate).toISOString(),
    };

    const response = await apiClient.post("", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing credential
 */
export const updateCredential = async (id: string, credential: unknown): Promise<CredentialInfoRecord> => {
  try {
    const validatedData = CredentialEditSchema.parse(credential);
    
    // Convert to backend-compatible format
    const payload = {
      ...validatedData,
      // Ensure date is in correct format
      // transactionDate: new Date(validatedData.transactionDate).toISOString(),
    };

    const response = await apiClient.put(`/${id}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch all credentials
 */
export const fetchAllCredentials = async (): Promise<CredentialInfoRecord[]> => {
  try {
    const response = await apiClient.get("");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch a credential by ID
 */
export const fetchCredentialById = async (id: string): Promise<CredentialInfoRecord> => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a credential by ID
 */
export const deleteCredentialById = async (id: string): Promise<CredentialInfoRecord> => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Search credentials by name
 */
export const searchCredentialsByName = async (
  name: string, 
  containing: boolean = false
): Promise<CredentialInfoRecord[]> => {
  try {
    console.log(`Searching for credentials with name: ${name}, containing: ${containing}`);
    const response = await apiClient.get("/search", {
      params: { 
        name,
        containing
      }
    });
    console.log("Search results:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching credentials:", error);
    return handleApiError(error);
  }
};

/**
 * Search players by name (reused from debt module)
 */
export const searchPlayersByName = async (playerName: string): Promise<PlayerSummaryRecord[]> => {
  try {
    console.log(`Searching for players with name: ${playerName}`);
    // Assuming the player search endpoint is the same as in the debt module
    const response = await axios.get("http://localhost:8080/debts/players/get-players-by-name", {
      params: { playerName }
    });
    console.log("Search results:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching players:", error);
    return handleApiError(error);
  }
};