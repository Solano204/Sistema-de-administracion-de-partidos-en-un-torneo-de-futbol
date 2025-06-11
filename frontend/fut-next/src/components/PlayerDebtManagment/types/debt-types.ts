// File: src/app/features/debt/types/debt-types.ts

/**
 * Enum for debt statuses
 */
export enum DebtStatus {
    PENDIENTE = "PENDIENTE",
    PAGADO = "PAGADO",
  }
  
  /**
   * Interface for debt record data
   */
  export interface DebtRecordDto {
    Id: string;
    IdProperty: string;
    nameProperty: string;
    amount: number;
    description: string;
    dueDate: string;
    paidDate: string | null;
    state: DebtStatus;
  }
  export interface PlayerSummaryRecord {
    id: string;
    fullName: string;
    jerseyNumber: string;
  }
  /**
   * Type for debt validation errors
   */
  export type DebtValidationErrors = {
    [key in keyof DebtRecordDto]?: string[];
  }