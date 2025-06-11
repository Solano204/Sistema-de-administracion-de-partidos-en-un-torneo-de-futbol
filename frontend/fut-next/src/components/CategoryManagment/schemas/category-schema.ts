// File: src/app/features/category/category-schema.ts
import { z } from 'zod';
import { CategoryInfoRecord } from '../types/category-types';

/**
 * Schema for age range validation
 */
export const AgeRangeSchema = z.object({
  minAge: z.number()
    .min(0, "Minimum age cannot be negative")
    .transform(val => isNaN(val) ? 0 : val),
  maxAge: z.number()
    .min(0, "Maximum age cannot be negative")
    .transform(val => isNaN(val) ? 18 : val)
}).refine(data => data.minAge <= data.maxAge, {
  message: "Minimum age must be less than or equal to maximum asage",
  path: ["minAge"]
});

/**
 * Base schema for category validation
 */
export const CategoryBaseSchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long (max 100 characters)"),
  imageUrl: z.string()
    .min(1, "Image URL is required"),
  ageRange: AgeRangeSchema
});

/**
 * Schema for creating a new category
 */
export const CategoryCreateSchema = CategoryBaseSchema;

/**
 * Schema for editing an existing category
 */
export const CategoryEditSchema = CategoryBaseSchema.extend({
  id: z.string().min(1, "Category ID is required")
});

/**
 * Type definitions for validation errors
 */
export type CategoryValidationErrors = {
  [key in keyof CategoryInfoRecord]?: string[];
};