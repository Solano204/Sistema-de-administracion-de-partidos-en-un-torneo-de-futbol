// File: src/app/features/teamDebt/types/team-debt-types.ts

/**
 * Enum for debt statuses
 */
export enum DebtStatus {
    PENDIENTE = "PENDIENTE",
    PAGADO = "PAGADO",
  }
  
  /**
   * Interface for team name and ID record
   */
  export interface TeamNameIdRecord {
    teamId: string;
    name: string;
  }
  
  /**
   * Interface for team debt record data
   */
  export interface TeamDebtRecordDto {
    Id: string;
    IdProperty: string;
    nameProperty: string;
    amount: number;
    description: string;
    dueDate: string;
    paidDate: string | null;
    state: DebtStatus;
  }
  
  /**
   * Type for team debt validation errors
   */
  export type TeamDebtValidationErrors = {
    [key in keyof TeamDebtRecordDto]?: string[];
  };