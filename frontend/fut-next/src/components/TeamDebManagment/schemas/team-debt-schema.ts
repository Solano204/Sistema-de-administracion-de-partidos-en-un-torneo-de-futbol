// File: src/app/features/teamDebt/schemas/team-debt-schema.ts
import { z } from 'zod';
import { DebtStatus } from '../types/team-debt-types';

/**
 * Schema for debt status validation
 */
export const TeamDebtStatusSchema = z.nativeEnum(DebtStatus);

/**
 * Base fields that are common to both create and update
 */
const TeamDebtBaseFields = {
  IdProperty: z.string().min(1, "Team ID is required"),
  nameProperty: z.string().default("team name"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(255, "Description too long"),
  state: TeamDebtStatusSchema,
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .transform(val => val || new Date().toISOString().split('T')[0])
};

/**
 * Schema for creating new team debts
 */
export const TeamDebtRecordCreateSchema = z.object({
  ...TeamDebtBaseFields,
  Id: z.string().default('36dfd3fc-80ef-4fae-a816-d2ae1a5612c0'),
  paidDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .nullable()
    .optional()
    .transform(val => val === undefined ? null : val)
});

/**
 * Schema for editing existing team debts
 */
export const TeamDebtRecordEditSchema = z.object({
  ...TeamDebtBaseFields,
  Id: z.string().min(1, "Debt ID is required"),
  paidDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .nullable()
});

/**
 * Schema for updating team debt status
 */
export const TeamDebtStatusUpdateSchema = z.object({
  Id: z.string().min(1, "Debt ID is required"),
  state: TeamDebtStatusSchema,
  paidDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .nullable()
});