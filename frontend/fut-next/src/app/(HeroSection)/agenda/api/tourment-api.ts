// "use server";
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from "axios";
// import { format, parseISO } from 'date-fns';
// import {
//   TournamentInfoRecord,
//   MatchScheduleInfoRecord,
//   DivisionAdvancementStatus,
//   TournamentStageInfo,
//   DivisionEntity,
//   WeeklyScheduleRecordRequest,
// } from "../types/tournament-types";
// import { Match, week, statusMatch } from "@/app/(HeroSection)/agenda/types/TypesAgend";
// import { cookies } from 'next/headers';
// import { tournamentKeys } from '../hooks/tournament-keys-api';

// // API client configuration
// const apiClient = axios.create({
//   baseURL: "http://localhost:8080",
//   headers: {
//     "Content-Type": "application/json",
//     // Add auth headers if needed
//   },
// });

// // Query key factory

// // Convert API match data to the format expected by the UI
// // const convertToUiMatch = (match: MatchScheduleInfoRecord): Match => {
// //   return {
// //     id: String(match.matchId),
// //     team1: match.homeTeamName,
// //     team2: match.awayTeamName,
// //     status: match.status as statusMatch || "PENDIENTE",
// //     phase: match.phase as any || undefined,
// //     category: match.categoryName as any,
// //     tourmentId: match.tournamentId ,
// //     tournamentName: match.tournamentName
// //   };
// // };


// apiClient.interceptors.request.use(
//   async (config) => {
//     const token = (await cookies()).get("session")?.value;
//     // If token exists, add it to the headers
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


// // Convert UI match data to the format expected by the API

// // Get matches in date range hook


// export const useMatchesInDateRange = async (startDate: string, endDate: string) => {
//   return useQuery({
//     queryKey: tournamentKeys.matchesInRange(startDate, endDate),
//     queryFn: async () => {
//       // Add validation
//       if (!startDate || !endDate) {
//         throw new Error('Invalid date range');
//       }

//       console.log(startDate, endDate);
      
//       const response = await apiClient.get<MatchScheduleInfoRecord[]>("/tournaments/matches", {
//         params: { startDate, endDate },
//       });
      
//         return response.data.map(convertApiMatchToWeek);
//     },
//     staleTime: 5 * 60 * 1000,
//     enabled: !!startDate && !!endDate, // Only run query when dates are valid
//   });
// };
// const convertApiMatchToWeek =async  (apiMatch: MatchScheduleInfoRecord): Promise<week> => ({
//   date: apiMatch.matchDate,
//   day: apiMatch.matchDay,
//   hour: apiMatch.matchTime.substring(0, 5),
//   match: {
//       id: apiMatch.matchId, // or apiMatch.id depending on your needs
//       team1: apiMatch.homeTeamName,
//       team2: apiMatch.awayTeamName,
//       status: apiMatch.status as statusMatch,
//       tourmentId: apiMatch.tournamentId,
//       tournamentName: apiMatch.tournamentName,
//       phase: apiMatch.phase,
//       category: apiMatch.categoryName
//   }
// });
// // Schedule matches hook
// // Helper function to safely parse date strings
// const safelyParseDate = async (dateString: string): Promise<Date> => {
//   try {
//     // First try to parse as ISO date
//     const date = parseISO(dateString);
//     if (!isNaN(date.getTime())) {
//       return date;
//     }
    
//     // If that fails, try other formats or return current date
//     console.error('Invalid date string:', dateString);
//     return new Date();
//   } catch (error) {
//     console.error('Error parsing date:', error);
//     return new Date();
//   }
// };

// // Updated conversion function using date-fns
// const convertToApiMatch =async  (match: Match, dateString: string, day: string, hour: string): Promise<WeeklyScheduleRecordRequest>  => {
//   // Safely parse the date string
//   const date =  await safelyParseDate(dateString);
  
//   // Use date-fns to format the date consistently
//   const formattedDate =  format(date, 'yyyy-MM-dd');
  
//   // Clean the hour format if needed
//   const formattedHour = hour.includes(':') ? hour : `${hour}:00`;
    
//   return {
//     id: match.id.toString(),
//     matchId: match.id.toString(),
//     tournamentId: match.tourmentId,
//     matchDay: day,
//     matchDate: formattedDate,
//     matchTime: formattedHour,
//     homeTeamName: match.team1,
//     awayTeamName: match.team2,
//     tournamentName: match.tournamentName,
//     categoryName: match.category,
//     phase: match.phase || "",
//     status: match.status,
//   };
// };

// // Updated useScheduleMatches hook
// // Updated useScheduleMatches hook
// export const useScheduleMatches = async  () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (weeklySchedule: week[]) => {
//       const apiSchedule = weeklySchedule.map(week => 
//         convertToApiMatch(week.match, week.date, week.day, week.hour)
//       );
      
//       const response = await apiClient.post<WeeklyScheduleRecordRequest[]>(
//         "/tournaments/schedule",
//         apiSchedule
//       );
//       return response.data;
//     },
//     onSuccess: async (data, variables) => {
//       const startDate = await getEarliestDate(variables);
//       const endDate = await getLatestDate(variables);
      
//       if (startDate && endDate) {
//         // Invalidate and immediately refetch
//         queryClient.invalidateQueries({
//           queryKey: tournamentKeys.matchesInRange(
//             await formatDateForApi(startDate),
//             await formatDateForApi(endDate)
//           ),
//           refetchType: 'all' // Force refetch instead of using cache
//         });
//       }
//     },
//     onSettled: (data) => {
//       if (data) {
//         queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
//       }

//     }
//   });
// };
// // Delete match schedule hook
// export const useDeleteMatchSchedule =  async  () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (matchId: string) => {
//       // Endpoint would need to be created on the API side
//       const response = await apiClient.delete(`/tournaments/delete-match/${matchId}`);
//       return response.data;
//     },
//     onSuccess: (data, variables, context) => {
//       // Invalidate and refetch queries that could be affected
//       queryClient.invalidateQueries({ 
//         queryKey: tournamentKeys.all,
//       });
//     },
//   });
// };


// // Add this to your existing API calls
// export const useCheckMatchExists =async  () => {
//   return useMutation({
//     mutationFn: async (matchId: string): Promise<boolean> => {
//       const response = await apiClient.get<boolean>(
//         `/tournaments/existing-match/${matchId}`
//       );
//       return response.data;
//     }
//   });
// };

// // Get tournaments for category hook
// export const useTournamentsForCategory = async (categoryId: string) => {
//   return useQuery({
//     queryKey: tournamentKeys.byCategory(categoryId),
//     queryFn: async () => {
//       const response = await apiClient.get<TournamentInfoRecord[]>(
//         `/tournaments/categories/${categoryId}`
//       );
//       return response.data;
//     },
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// };

// // Helper function to get the earliest date from an array of week objects
// async  function getEarliestDate(weeks: week[]): Promise<Date | null> {
//   if (weeks.length === 0) return null;
  
//   return weeks.reduce((earliest, week) => {
//     const weekDate = new Date(week.date);
//     return weekDate < earliest ? weekDate : earliest;
//   }, new Date(weeks[0].date));
// }

// // Helper function to get the latest date from an array of week objects
// async function getLatestDate(weeks: week[]): Promise<Date | null> {
//   if (weeks.length === 0) return null;
  
//   return weeks.reduce((latest, week) => {
//     const weekDate = new Date(week.date);
//     return weekDate > latest ? weekDate : latest;
//   }, new Date(weeks[0].date));
// }

// // Format date for API (YYYY-MM-DD)
// async function formatDateForApi(date: Date): Promise<string> {
//   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
// }

// // Tournament initialization
// export  const useInitializeTournament = async () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (tournamentInfo: TournamentInfoRecord) => {
//       const response = await apiClient.post<TournamentInfoRecord>(
//         '/tournaments/initialize',
//         tournamentInfo
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
//     },
//     onError: (error) => {
//       console.error('Error initializing tournament:', error);
//       throw new Error('Failed to initialize tournament');
//     }
//   });
// };

// // Simulate round robin matches
// export const useSimulateRoundRobinMatches = async(tournamentId: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {
//       await apiClient.post(
//         `/tournaments/${tournamentId}/simulate-round-robin`
//       );
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ 
//         queryKey: tournamentKeys.byId(tournamentId) 
//       });
//     },
//     onError: (error) => {
//       console.error('Error simulating round robin matches:', error);
//       throw new Error('Failed to simulate round robin matches');
//     }
//   });
// };

// // Create divisions
// export const useCreateTournamentDivisions =async (tournamentId: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {
//       await apiClient.post(
//         `/tournaments/${tournamentId}/create-divisions`
//       );
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ 
//         queryKey: tournamentKeys.divisions(tournamentId) 
//       });
//     },
//     onError: (error) => {
//       console.error('Error creating divisions:', error);
//       throw new Error('Failed to create divisions');
//     }
//   });
// };

// // Advance to next phase
// export const useAdvanceToNextPhase = async (tournamentId: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (divisionName: string) => {
//       await apiClient.post(
//         `/tournaments/${tournamentId}/advance-phase`,
//         null,
//         { params: { divisionName } }
//       );
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ 
//         queryKey: tournamentKeys.byId(tournamentId) 
//       });
//     },
//     onError: (error) => {
//       console.error('Error advancing phase:', error);
//       throw new Error('Failed to advance phase');
//     }
//   });
// };

// // Simulate elimination matches
// export const useSimulateEliminationMatches = async (tournamentId: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (divisionName: string) => {
//       await apiClient.post(
//         `/tournaments/${tournamentId}/simulate-elimination`,
//         null,
//         { params: { divisionName } }
//       );
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ 
//         queryKey: tournamentKeys.byId(tournamentId) 
//       });
//     },
//     onError: (error) => {
//       console.error('Error simulating elimination matches:', error);
//       throw new Error('Failed to simulate elimination matches');
//     }
//   });
// };

// // Check division advancement status
// export const useDivisionAdvancementStatus = async (
//   tournamentId: string,
//   divisionId: string,
//   categoryId: string
// ) => {
//   return useQuery<DivisionAdvancementStatus>({
//     queryKey: tournamentKeys.divisionStatus(tournamentId, divisionId, categoryId),
//     queryFn: async () => {
//       const response = await apiClient.get<DivisionAdvancementStatus>(
//         `/tournaments/${tournamentId}/divisions/${divisionId}/${categoryId}/advancement-status`
//       );
//       return response.data;
//     },
//     staleTime: 0, // Always fresh data
//     refetchInterval: 5000, // Poll every 5 seconds for real-time updates
//     refetchIntervalInBackground: true
   
//   });
// };

// // Check tournament stage
// export const useTournamentStage = async (tournamentId: string, categoryId: string) => {
//   return useQuery<TournamentStageInfo>({
//     queryKey: tournamentKeys.tournamentStage(tournamentId, categoryId),
//     queryFn: async () => {
//       const response = await apiClient.get<TournamentStageInfo>(
//         `/tournaments/${tournamentId}/divisions/${categoryId}/check-out`
//       );
//       return response.data;
//     },
//     staleTime: 0, // Always fresh data
//     refetchInterval: 5000, // Poll every 5 seconds for real-time updates
//     refetchIntervalInBackground: true
//   });
// };

// // Get divisions for tournament
// export const useDivisionsForTournament =  async (tournamentId: string) => {
//   return useQuery<DivisionEntity[]>({
//     queryKey: tournamentKeys.divisions(tournamentId),
//     queryFn: async () => {
//       const response = await apiClient.get<DivisionEntity[]>(
//         `/tournaments/${tournamentId}/divisions`
//       );
//       return response.data;
//     },
//     staleTime: 0, // Always fresh data
//     refetchInterval: 5000, // Poll every 5 seconds for real-time updates
//     refetchIntervalInBackground: true
//   });
// };