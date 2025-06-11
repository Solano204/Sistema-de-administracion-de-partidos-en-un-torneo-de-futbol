// File: src/app/features/teamDebt/api/team-debt-api.ts
"use server";

import axios from "axios";
import { PlayerOrganizedRecord } from "../types/player-types";
import { cookies } from "next/headers";
/**
 * API Client configuration
 */


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/players`,
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
// In src/services/player-api.ts
export const fetchPlayersOrganizedByPoints = async (
    categoryId: string
  ): Promise<PlayerOrganizedRecord[]> => {
    const response = await apiClient.get(`/category/${categoryId}/organized`);
    return Array.from(response.data); // Convert Set to Array for easier handling in TS
  };