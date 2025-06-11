// File: src/app/features/credential/types/credential-types.ts

/**
 * Interface for credential record data
 */
export interface CredentialInfoRecord {
    id: string;
    playerName: string;
    transactionDate: string;
    amount: number;
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /**
   * Interface for player summary (reused from debt module)
   */
  export interface PlayerSummaryRecord {
    id: string;
    fullName: string;
    jerseyNumber: string;
  }
  
  /**
   * Type for credential validation errors
   */
  export type CredentialValidationErrors = {
    [key in keyof CredentialInfoRecord]?: string[];
  };