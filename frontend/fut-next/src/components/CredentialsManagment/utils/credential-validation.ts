// File: src/app/features/credential/utils/credential-validation.ts
import { z } from 'zod';
import { CredentialInfoRecord, CredentialValidationErrors } from '../types/credential-types';
import { CredentialCreateSchema, CredentialEditSchema } from '../schemas/credential-schema';

/**
 * Validates a credential record based on whether it's being created or edited
 * @param data The credential record data to validate
 * @param isEdit Whether this is an edit operation (requires ID)
 * @returns Validated credential record
 */
export const validateCredentialRecord = (data: Partial<CredentialInfoRecord>, isEdit: boolean = false): CredentialInfoRecord => {
  const inputData = typeof data === 'object' && data !== null ? data : {};
  
  try {
    if (isEdit) {
      if (!inputData.id) {
        throw new Error("ID is required for edit operations");
      }
      console.log(inputData);
      return CredentialEditSchema.parse(inputData) as CredentialInfoRecord;
    }
    return CredentialCreateSchema.parse(inputData) as CredentialInfoRecord;
  } catch (error) {
    console.error("Validation failed:", error);
    throw error;
  }
};

/**
 * Extracts validation errors from a ZodError
 * @param error The ZodError to extract errors from
 * @returns Object mapping field names to arrays of error messages
 */
export const extractValidationErrors = (error: z.ZodError): CredentialValidationErrors => {
  const errors: CredentialValidationErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as keyof CredentialInfoRecord;
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path]!.push(issue.message);
  });
  
  return errors;
};

/**
 * Formats a date string to ISO format
 * @param date The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export const formatDateTimeString = (date: Date | string | null): string | null => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error("Invalid date format:", error);
    return null;
  }
};

/**
 * Format date for input fields (YYYY-MM-DDTHH:MM)
 */
export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Invalid date format:", error);
    return '';
  }
};

/**
 * Format amount as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};