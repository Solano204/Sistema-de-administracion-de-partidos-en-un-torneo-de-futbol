// File: src/app/features/debt/utils/debt-validation.ts
import { z } from 'zod';
import { DebtRecordDto, DebtStatus, DebtValidationErrors } from '../types/debt-types';
import { DebtRecordCreateSchema, DebtRecordEditSchema, DebtStatusSchema } from '../schemas/debt-schema';

/**
 * Validates a debt record based on whether it's being created or edited
 * @param data The debt record data to validate
 * @param isEdit Whether this is an edit operation (requires ID)
 * @returns Validated debt record
 */
export const validateDebtRecord = (data: Partial<DebtRecordDto>, isEdit: boolean = false): DebtRecordDto => {
  const inputData = typeof data === 'object' && data !== null ? data : {};
  
  try {
    if (isEdit) {
      if (!inputData.Id) {
        throw new Error("ID is required for edit operations");
      }
      return DebtRecordEditSchema.parse(inputData);
    }
    return DebtRecordCreateSchema.parse(inputData);
  } catch (error) {
    console.error("Validation failed:", error);
    throw error;
  }
};

/**
 * Validates a debt status update
 * @param status The status to validate
 * @returns Validated debt status
 */
export const validateDebtStatus = (status: unknown): DebtStatus => {
  return DebtStatusSchema.parse(status);
};

/**
 * Extracts validation errors from a ZodError
 * @param error The ZodError to extract errors from
 * @returns Object mapping field names to arrays of error messages
 */
export const extractValidationErrors = (error: z.ZodError): DebtValidationErrors => {
  const errors: DebtValidationErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as keyof DebtRecordDto;
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path]!.push(issue.message);
  });
  
  return errors;
};

/**
 * Formats a date string to YYYY-MM-DD format
 * @param date The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export const formatDateString = (date: Date | string | null): string | null => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error("Invalid date format:", error);
    return null;
  }
};