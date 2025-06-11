// File: src/app/features/referee/schemas/referee-schema.ts
import { z } from 'zod';
import { 
  UserRole, 
  UserStatus, 
  RefereeValidationErrors 
} from '../types/referee-types';

/**
 * Schema for user status validation
 */
export const UserStatusSchema = z.nativeEnum(UserStatus);

/**
 * Schema for user role validation
 */
export const UserRoleSchema = z.nativeEnum(UserRole);

/**
 * Common fields for all referee schemas
 */
const RefereeCommonSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  age: z.number().int().positive("Age must be positive"),
  role: UserRoleSchema
});

/**
 * Base referee schema
 */
export const RefereeBaseSchema = RefereeCommonSchema;

/**
 * Schema for registering new referees
 */
export const RefereeRegisterSchema = RefereeCommonSchema.extend({
  user: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  urlPhoto: z.string(),
  status: UserStatusSchema.optional().default(UserStatus.ACTIVO)
});

/**
 * Schema for updating basic information
 */
export const RefereeUpdateSchema = RefereeCommonSchema;

/**
 * Schema for updating profile photo
 */
export const RefereePhotoSchema = z.object({
  id: z.string().uuid(),
  profilePhoto: z.string()
});

/**
 * Schema for updating referee status
 */
export const RefereeStatusSchema = z.object({
  id: z.string().uuid(),
  status: UserStatusSchema
});

/**
 * Helper function to extract validation errors from a ZodError
 */
export const extractValidationErrors = (error: z.ZodError): RefereeValidationErrors => {
  const errors: RefereeValidationErrors = {};
  
  error.errors.forEach((issue) => {
    const path = issue.path[0] as string;
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path]!.push(issue.message);
  });
  
  return errors;
};