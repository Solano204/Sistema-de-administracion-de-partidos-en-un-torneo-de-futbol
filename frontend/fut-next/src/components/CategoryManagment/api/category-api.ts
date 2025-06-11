"use server"
import axios from "axios";
import { CategoryInfoRecord } from "../types/category-types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Move this object outside the "use server" file or to a separate client-side file
// For example, create a new file called category-keys.ts without "use server"

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
    redirect("/Soccer");
    throw new Error(errorMessage);
  }
  // Handle other errors
  throw error;
};

/**
 * Fetch all categories
 */
export async function fetchAllCategories(): Promise<CategoryInfoRecord[]> {
  try {
    const response = await apiClient.get("/categories");

    console.log("Fetched categories:", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch a single category by ID
 */
export async function fetchCategoryById(id: string): Promise<CategoryInfoRecord> {
  try {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  category: Omit<CategoryInfoRecord, "id">
): Promise<CategoryInfoRecord> {
  try {
    const response = await apiClient.post("/categories", category);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  updatedCategory: Partial<CategoryInfoRecord>
): Promise<CategoryInfoRecord> {
  try {
    const response = await apiClient.put(`/categories/${id}`, updatedCategory);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete all teams in a tournament
 */
export async function deleteAllInTournament(tournamentId: string): Promise<void> {
  try {
    await apiClient.delete(`/tournaments/delete-teams-from-category/${tournamentId}`);
  } catch (error) {
    return handleApiError(error);
  }
}