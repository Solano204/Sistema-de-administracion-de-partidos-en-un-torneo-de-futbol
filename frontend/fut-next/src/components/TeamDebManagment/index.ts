// File: src/app/features/teamDebt/index.ts

// Export types
export * from './types/team-debt-types';
export * from './hooks/team-search-hooks';

// Export schemas and validation
export {
  TeamDebtRecordCreateSchema,
  TeamDebtRecordEditSchema,
  TeamDebtStatusSchema
} from './schemas/team-debt-schema';

// Export utilities
export {
  validateTeamDebtRecord,
  validateTeamDebtStatus,
  extractValidationErrors,
  formatDateString
} from './utils/team-debt-validation';

// Export API functions
export {
  fetchTeamDebts,
  createTeamDebt,
  updateTeamDebt,
  updateTeamDebtStatus,
  deleteTeamDebtById,
  deleteAllTeamDebts,
  deleteTeamDebtByDate
} from './api/team-debt-api';

// Export hooks
export {
  useTeamDebts,
  useTeamDebtMutations,
  useTeamDebtForm
} from './hooks/team-debt-hooks';

// Export components
export { TeamDebtForm } from './components/TeamDebtForm';
export { TeamDebtList } from './components/TeamDebtList';
export { TeamSearch} from './components/TeamSearch';
export {  TeamDebtManagementPage } from './components/TeamDebtManagementPage';