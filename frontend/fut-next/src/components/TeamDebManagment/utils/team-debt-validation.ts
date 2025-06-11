// File: src/app/features/teamDebt/utils/team-debt-validation.ts
import { z } from 'zod';
import { TeamDebtRecordDto, DebtStatus, TeamDebtValidationErrors } from '../types/team-debt-types';
import { TeamDebtRecordCreateSchema, TeamDebtRecordEditSchema, TeamDebtStatusSchema } from '../schemas/team-debt-schema';

/**
 * Validates a team debt record based on whether it's being created or edited
 * @param data The team debt record data to validate
 * @param isEdit Whether this is an edit operation (requires ID)
 * @returns Validated team debt record
 */
export const validateTeamDebtRecord = (data: Partial<TeamDebtRecordDto>, isEdit: boolean = false): TeamDebtRecordDto => {
  const inputData = typeof data === 'object' && data !== null ? data : {};
  
  try {
    if (isEdit) {
      if (!inputData.Id) {
        throw new Error("ID is required for edit operations");
      }
      return TeamDebtRecordEditSchema.parse(inputData);
    }
    return TeamDebtRecordCreateSchema.parse(inputData);
  } catch (error) {
    console.error("Validation failed:", error);
    throw error;
  }
};

/**
 * Validates a team debt status update
 * @param status The status to validate
 * @returns Validated debt status
 */
export const validateTeamDebtStatus = (status: unknown): DebtStatus => {
  return TeamDebtStatusSchema.parse(status);
};

/**
 * Extracts validation errors from a ZodError
 * @param error The ZodError to extract errors from
 * @returns Object mapping field names to arrays of error messages
 */
export const extractValidationErrors = (error: z.ZodError): TeamDebtValidationErrors => {
  const errors: TeamDebtValidationErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as keyof TeamDebtRecordDto;
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