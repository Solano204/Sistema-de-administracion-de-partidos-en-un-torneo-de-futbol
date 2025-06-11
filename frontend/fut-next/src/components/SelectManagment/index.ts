// File: src/app/features/tournament/index.ts

// Types
export type {
  TournamentInfoRecord,
  CategoryInfoRecord,
  TournamentStageInfo,
  DivisionEntity,
  DivisionAdvancementStatus,
  TournamentNavigationState
} from './types/tournament-types';

// API functions
export {
  fetchAllCategories,
  fetchTournamentsByCategory,
  fetchTeamCountByCategory,
  fetchTournamentStageInfo,
  fetchDivisionsByTournament,
  fetchDivisionStatus,
  createTournament,
  createDivisions,
  advancePhase
} from './api/tournament-api';

// Query keys
export { tournamentKeys } from './api/tournament-keys';

// Utilities
export {
  getPhaseDisplayName,
  getPhaseOrder,
  getAccumulatedPhases,
  createTournamentInfo
} from './utils/tournament-utils';

// Hooks
export {
  useTournamentNavigation,
  useCategories,
  useTournamentsByCategory,
  useTeamCountByCategory,
  useTournamentStageInfo,
  useDivisionsByTournament,
  useDivisionStatus,
  useTournamentMutations,
  useAccumulatedPhases,
  useTournamentCreationInfo
} from './hooks/tournament-hooks';

// Components
export { default as TournamentNavigationBar } from './components/TournamentNavigationBar';