// File: src/app/features/payment/utils/payment-validation.ts
import { 
  RefereePaymentInput,
} from "../types/payment-types";
import {
  PaymentCreateSchema,
  PaymentUpdateSchema,
  extractValidationErrors
} from "../schemas/payment-schema";

/**
 * Validate payment data for creation
 */
export const validatePaymentCreate = (data: unknown): RefereePaymentInput => {
  return PaymentCreateSchema.parse(data);
};

/**
 * Validate payment data for update
 */
export const validatePaymentUpdate = (data: unknown): RefereePaymentInput => {
  return PaymentUpdateSchema.parse(data);
};

/**
 * Calculate total payment amount from hourly rate and hours worked
 */
export const calculatePaymentAmount = (hourlyRate: number, hoursWorked: number): number => {
  return hourlyRate * hoursWorked;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if parsing fails
  }
};

// Export validation error helper
export { extractValidationErrors };