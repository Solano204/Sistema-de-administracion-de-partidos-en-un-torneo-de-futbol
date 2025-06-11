// File: src/app/features/inscription/schemas/inscription-schema.ts
import { z } from 'zod';

/**
 * Base fields that are common to both create and update
 */
const InscriptionBaseFields = {
  nameTeam: z.string().min(1, "Team name is required"),
  numPlayer: z.number().or(z.string().transform(val => Number(val)))
    .refine(val => !isNaN(val) && val > 0 && Number.isInteger(val), "Number of players must be a positive integer"),
  date: z.string().min(1, "Date is required"),
  amount: z.number().or(z.string().transform(val => Number(val)))
    .refine(val => !isNaN(val) && val >= 0, "Amount must be a non-negative number"),
};

/**
 * Schema for creating new inscriptions
 */
export const InscriptionCreateSchema = z.object({
  ...InscriptionBaseFields,
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

/**
 * Schema for editing existing inscriptions
 */
export const InscriptionEditSchema = z.object({
  ...InscriptionBaseFields,
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});