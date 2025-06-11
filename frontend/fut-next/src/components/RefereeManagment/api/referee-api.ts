// File: src/app/features/referee/api/referee-api.ts
"use server";

import axios from "axios";
import {
  UserRegisterRecord,
  UserUpdateBasicInformation,
  UserUpdateProfilePhoto,
  UserStatus,
  UserDetailsRecordFull
} from "../types/referee-types";
import { cookies } from "next/headers";

/**
 * Query key factory with improved types
 */


/**
 * API Client configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
    // Add auth headers if needed
  },
  timeout: 10000,
});

/**
 * Request interceptor for auth tokens
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
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access detected");
      // You could redirect to login or refresh token here
    }
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
 * Fetch all referees
 */
export const fetchAllReferees = async (): Promise<UserDetailsRecordFull[]> => {
  try {
    const response = await apiClient.get("/referees");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch a single referee by ID
 */
export const fetchRefereeById = async (id: string): Promise<UserDetailsRecordFull> => {
  try {
    const response = await apiClient.get(`/referees/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new referee
 */
export const createReferee = async (
  refereeData: UserRegisterRecord
): Promise<UserDetailsRecordFull> => {
  try {
    const response = await apiClient.post("/referees", refereeData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update referee status
 */
export const updateRefereeStatus = async (
  refereeId: string,
  status: UserStatus
): Promise<boolean> => {
  try {
    const response = await apiClient.put(`/referees/${refereeId}/status`, null, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update referee details
 */
export const updateRefereeDetails = async (
  refereeId: string,
  details: UserUpdateBasicInformation
): Promise<void> => {
  try {
    await apiClient.put(`/referees/${refereeId}`, details);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a referee
 */
export const deleteReferee = async (refereeId: string): Promise<void> => {
  try {
    await apiClient.delete(`/referees/${refereeId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update referee profile photo
 */
export const updateRefereePhoto = async (
  photoUpdate: UserUpdateProfilePhoto
): Promise<void> => {
  try {
    await apiClient.put("/referees/photo", photoUpdate);
  } catch (error) {
    return handleApiError(error);
  }
};