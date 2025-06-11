// src/services/match-api.ts
"use server";

import axios from "axios";
import {
  MatchTinyDetails,
  Match,
  MatchResults,
} from "../types/match-types";
import { cookies } from "next/headers";

// Query key factory
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

// GET all matches by category
export const fetchMatchesByCategory = async (
  categoryId: string
): Promise<MatchTinyDetails[]> =>
  apiClient.get(`/matches/category/${categoryId}`).then((res) => res.data);

// GET match with stats
export const fetchMatchWithStats = async (
  matchId: string,
  tournamentId: string
): Promise<Match> =>
  apiClient
    .get(`/matches/${matchId}/${tournamentId}/stats`)
    .then((res) => res.data);

// PUT update match stats
export const updateMatchStats =  async (
  matchId: string,
  tournamentId: string,
  results: MatchResults
): Promise<Match> =>
  apiClient
    .put(`/matches/${matchId}/${tournamentId}/updateMatchStats`, results)
    .then((res) => res.data);
    
 


export const updateMatchStatusPlayed = async (matchId: string): Promise<boolean> =>
  apiClient
    .put(`/tournaments/update-status-played/${matchId}`)
    .then((res) => res.data);