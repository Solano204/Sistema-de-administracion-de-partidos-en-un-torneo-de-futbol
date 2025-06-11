// File: src/app/features/credential/index.ts

// Export types
export * from '.';

// Export schemas and validation
export {
  CredentialCreateSchema,
  CredentialEditSchema
} from './schemas/credential-schema';

// Export utilities
export {
  validateCredentialRecord,
  extractValidationErrors,
  formatDateTimeString,
  formatDateForInput,
  formatCurrency
} from './utils/credential-validation';

// Export API functions
export {
  // credentialKeys,
  fetchAllCredentials,
  fetchCredentialById,
  createCredential,
  updateCredential,
  deleteCredentialById,
  searchCredentialsByName
} from './api/credential-api';

// Export hooks
export {
  useCredentialMutations,
  useCredentialForm,
  useCredentials,
  usePlayerSearch
} from './hooks/credential-hooks';

// Export components
export { CredentialForm } from './components/CredentialForm';
export { CredentialList } from './components/CredentialList';
export { CredentialSearch } from './components/CredentialSearch';
export { PlayerSearch } from './components/PlayerSearch';
export { CredentialManagementPage } from './components/CredentialManagementPage';