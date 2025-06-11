// File: src/app/features/payment/types/payment-types.ts

/**
 * Interface for payment date
 */
export interface PaymentDate {
    value: string; // LocalDate from Java becomes string in TS (YYYY-MM-DD)
  }
  
  /**
   * Interface for money amount
   */
  export interface Money {
    amount: number;
    currency?: string;
  }
  
  /**
   * Interface for referee reference
   */
  export interface RefereeReference {
    id: string;
    fullName: string;
  }
  
  /**
   * Interface for complete referee payment record
   */
  export interface RefereePayment {
    id: string;
    referee: RefereeReference;
    paymentDate: string;
    hoursWorked: number;
    hourlyRate: number;
    totalAmount: number;
  }
  
  export interface RefereePaymentWithMatchId {
    id: string;
    referee: RefereeReference;
    paymentDate: string;
    hoursWorked: number;
    hourlyRate: number;
    totalAmount: number;
    matchId: string;
  }
  
  /**
   * Interface for creating/updating payment records
   */
  export interface RefereePaymentInput {
    id?: string; // Make id optional for creation, required for updates
    referee: {
      id: string;
      fullName?: string;
    };
    paymentDate: string;
    hoursWorked: number;
    hourlyRate: number;
    totalAmount: number;
  }
  export interface RefereePaymentInputWithMatch{
    id?: string; // Make id optional for creation, required for updates
    referee: {
      id: string;
      fullName?: string;
    };
    paymentDate: string;
    hoursWorked: number;
    hourlyRate: number;
    matchId:string;
    totalAmount: number;
  }
  
  /**
   * Type for payment validation errors
   */
  export type PaymentValidationErrors = {
    [key in keyof RefereePaymentInput]?: string[];
  } & {
    [key: string]: string[];
  };