"use server";

import axios from "axios";
import {
  UserDetailsRecordFullWithPassword,
  UserRole,
  UserLoginRecord,
  UserStatus,
  UserRegisterRecord,
  UserUpdateProfilePhoto,
  UserUpdateBasicInformation,
  UserDetailsRecordFull,
} from "../";
import { TokenResponse } from "@/app/utils/Domain/AuthenticationActions/TypesAuth";
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
 * Fetch all users by role
 */
export const fetchUsersByRole = async (role: UserRole): Promise<UserDetailsRecordFull[]> => {
  try {
    const response = await apiClient.get("/users", { params: { role } });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (id: string): Promise<UserDetailsRecordFull> => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Register a new user
 */
export const registerUser = async (
  userRecord: UserRegisterRecord
): Promise<UserDetailsRecordFull> => {
  try {
    const response = await apiClient.post("/users", userRecord);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (
  userId: string,
  status: UserStatus
): Promise<boolean> => {
  try {
    const response = await apiClient.put(`/users/${userId}/status`, null, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update user details
 */
export const updateUserDetails = async (
  userId: string,
  details: UserUpdateBasicInformation
): Promise<void> => {
  try {
    await apiClient.put(`/users/${userId}`, details);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update user profile photo
 */
export const updateUserProfilePhoto = async (
  photoUpdate: UserUpdateProfilePhoto
): Promise<TokenResponse> => {
  try {
    
    const response =  await apiClient.put("/users/photo", photoUpdate);
    // if (response.data.token) {
      // localStorage.setItem("authToken", response.data.token);
    // }
    const result = await response.data;
    // console.log("response", response.data);
    return result;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Login user
 */
export const loginUser = async (
  userRecord: UserLoginRecord
): Promise<UserDetailsRecordFullWithPassword> => {
  try {
    const response = await apiClient.post("/users/login", userRecord);
    // Store token if available
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Change user password
 */
export const adminChangeUserPassword = async (
  username: string,
  newPassword: string
): Promise<TokenResponse> => {
  try {
    const response = await apiClient.put("/auth/change-password/admin", null, {
      params: {
        username,
        newPassword
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}
/**
 * Change username
 */
/**
 * Change username
 */
export const changeUserName = async (
  currentUsername: string,
  newUsername: string,
  currentPassword: string
): Promise<TokenResponse> => {
  try {
    const response = await apiClient.put("/auth/change-username", null, {
      params: {
        currentUsername,
        newUsername,
        currentPassword
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};