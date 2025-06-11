// File: src/app/features/inscription/utils/inscription-validation.ts
import { z } from 'zod';
import { InscriptionInfoRecord, InscriptionValidationErrors } from '../types/inscription-types';
import { InscriptionCreateSchema, InscriptionEditSchema } from '../schemas/inscription-schema';

/**
 * Validates an inscription record based on whether it's being created or edited
 * @param data The inscription record data to validate
 * @param isEdit Whether this is an edit operation (requires ID)
 * @returns Validated inscription record
 */
export const validateInscriptionRecord = (data: Partial<InscriptionInfoRecord>, isEdit: boolean = false): InscriptionInfoRecord => {
  const inputData = typeof data === 'object' && data !== null ? data : {};
  
  try {
    if (isEdit) {
      if (!inputData.id) {
        throw new Error("ID is required for edit operations");
      }
      console.log(inputData);
      return InscriptionEditSchema.parse(inputData) as InscriptionInfoRecord;
    }
    return InscriptionCreateSchema.parse(inputData) as InscriptionInfoRecord;
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
export const extractValidationErrors = (error: z.ZodError): InscriptionValidationErrors => {
  const errors: InscriptionValidationErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as keyof InscriptionInfoRecord;
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
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
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