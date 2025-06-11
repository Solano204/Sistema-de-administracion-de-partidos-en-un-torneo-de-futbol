// File: src/app/features/teamDebt/api/team-debt-api.ts
"use server";

import axios from "axios";
import { TeamScore } from "../types/team-types";
import { cookies } from "next/headers";



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}`,
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



// In src/services/team-api.ts
export const fetchTeamsByPosition = async (
    categoryId: string
  ): Promise<TeamScore[]> => {
    const response = await apiClient.get(`/teams/category/${categoryId}/position`);
    return response.data;
  };