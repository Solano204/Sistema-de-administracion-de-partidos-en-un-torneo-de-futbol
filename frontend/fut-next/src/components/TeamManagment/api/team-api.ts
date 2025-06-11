// src/services/team-api.ts
"use server";

import axios from "axios";
import {
  TeamCreateRecord,
  TeamDetailsRecord,
  TeamWithPlayersRecord,
  TeamScore,
  PlayerCreateRecord,
} from "../index";
import { cookies } from "next/headers";

// Configure axios instance

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  
  baseURL: API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth tokens
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

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

// API functions
export const createTeam = async (
  team: TeamCreateRecord
): Promise<TeamDetailsRecord> => {

  const response = await apiClient.post("/teams", team);
  return response.data;
};



export const fetchTeamWithoutPlayers = async (
  teamId: string,
  categoryId: string
): Promise<TeamDetailsRecord> => {
  const response = await apiClient.get(
    `/teams/${teamId}/category/${categoryId}`
  );
  return response.data;
};

export const fetchTeamWithPlayers = async (
  categoryId: string,
  teamId: string
): Promise<TeamWithPlayersRecord> => {
  const response = await apiClient.get(
    `/teams/category/${categoryId}/team/${teamId}/players`
  );
  return response.data;
};

export const deleteTeamByCategory = async (
  categoryId: string,
  teamId: string
): Promise<void> => {
  await apiClient.delete(`/teams/category/${categoryId}/team/${teamId}`);
};

export const deleteAllTeamsByCategory = async (
  categoryId: string
): Promise<void> => {
  await apiClient.delete(`/teams/category/${categoryId}`);
};

export const updateTeam = async (
  categoryId: string,
  teamId: string,
  updatedTeam: TeamDetailsRecord
): Promise<TeamDetailsRecord> => {
  const response = await apiClient.put(
    `/teams/category/${categoryId}/team/${teamId}`,
    updatedTeam
  );
  return response.data;
};

export const fetchTeamsByPosition = async (
  categoryId: string
): Promise<TeamScore[]> => {
  const response = await apiClient.get(
    `/teams/category/${categoryId}/position`
  );
  return response.data;
};

export const fetchTeamsByCategory = async (
  categoryId: string
): Promise<TeamScore[]> => {
  const response = await apiClient.get(`/teams/category/${categoryId}`);
  return response.data;
};

export const updateTeamLogoOrName = async (
  categoryId: string,
  teamId: string,
  logo: string,
  name: string
): Promise<TeamDetailsRecord> => {
  const response = await apiClient.put(
    `/teams/category/${categoryId}/team/${teamId}/logo-name`,
    null,
    { params: { logo, name } }
  );
  return response.data;
};









export const removePlayersFromTeam = async (
  teamId: string, 
  playerIds: string[]
): Promise<void> => {
  const response = await apiClient.delete(
    `/players/deleteplayers/team/${teamId}`,
    {
      data: playerIds,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const createBasicInformationBatchDetails = async (
  players: PlayerCreateRecord[],
  teamId: string
): Promise<boolean> => {
  // Convert array to Set as expected by backend
  const playerSet = new Set(players);
  const response = await apiClient.put(
    `/players/playerUpdateBatch/team/${teamId}`,
    Array.from(playerSet) // Convert Set back to array for JSON serialization
  );
  return response.data;
};


export const updateBasicInformationBatchDetails = async (
  players: PlayerCreateRecord[]
): Promise<boolean> => {
  // Convert to Set if backend expects Set, or keep as array
  const playerSet = new Set(players);
  const response = await apiClient.put(
    "/players/playerUpdateBatch", // Added missing /players prefix
    Array.from(playerSet) // Convert to array for JSON serialization
  );
  return response.data;
};