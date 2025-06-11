// File: src/app/features/debt/schemas/debt-schema.ts
import { z } from 'zod';
import { DebtStatus } from '../types/debt-types';

/**
 * Schema for debt status validation
 */
export const DebtStatusSchema = z.nativeEnum(DebtStatus);

/**
 * Base fields that are common to both create and update
 */
const DebtBaseFields = {
  IdProperty: z.string().min(1, "Player ID is required"),
  nameProperty: z.string().default("carlos josue lopez"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(255, "Description too long"),
  state: DebtStatusSchema,
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .transform(val => val || new Date().toISOString().split('T')[0])
};

/**
 * Schema for creating new debts
 */
export const DebtRecordCreateSchema = z.object({
  ...DebtBaseFields,
  Id: z.string().default('36dfd3fc-80ef-4fae-a816-d2ae1a5612c0'),
  paidDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .nullable()
    .optional()
    .transform(val => val === undefined ? null : val)
});

/**
 * Schema for editing existing debts
 */
export const DebtRecordEditSchema = z.object({
  ...DebtBaseFields,
  Id: z.string().min(1, "Debt ID is required"),
  paidDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .nullable()
});

/**
 * Schema for updating debt status
 */
export const DebtStatusUpdateSchema = z.object({
  Id: z.string().min(1, "Debt ID is required"),
  state: DebtStatusSchema,
  paidDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .nullable()
});