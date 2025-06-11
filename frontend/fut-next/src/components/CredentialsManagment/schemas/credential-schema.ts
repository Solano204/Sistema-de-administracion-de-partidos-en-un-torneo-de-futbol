// File: src/app/features/credential/schemas/credential-schema.ts
import { z } from 'zod';

/**
 * Base fields that are common to both create and update
 */
const CredentialBaseFields = {
  playerName: z.string().min(1, "Player name is required"),
  amount: z.number().or(z.string().transform(val => Number(val)))
    .refine(val => !isNaN(val) && val > 0, "Amount must be a positive number"),
  description: z.string().min(1, "Description is required").max(255, "Description too long"),
};

/**
 * Schema for creating new credentials
 */
export const CredentialCreateSchema = z.object({
  ...CredentialBaseFields,
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

/**
 * Schema for editing existing credentials
 */
export const CredentialEditSchema = z.object({
  ...CredentialBaseFields,
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});