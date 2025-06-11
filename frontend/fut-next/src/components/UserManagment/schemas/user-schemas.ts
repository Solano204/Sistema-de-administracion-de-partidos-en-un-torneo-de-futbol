import { z } from 'zod';
import {
  UserRole,
  UserStatus,
  UserValidationErrors
} from "../";

/**
 * Schema for user status validation
 */
export const UserStatusSchema = z.nativeEnum(UserStatus);

/**
 * Schema for user role validation
 */
export const UserRoleSchema = z.nativeEnum(UserRole);

/**
 * Common fields for all user schemas
 */
const UserCommonSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  age: z.number().int().positive("Age must be positive"),
  role: UserRoleSchema
});

/**
 * Base user schema
 */
export const UserBaseSchema = UserCommonSchema;

/**
 * Schema for registering new users
 */
export const UserRegisterSchema = UserCommonSchema.extend({
  user: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profilePhoto: z.string(),
  status: UserStatusSchema.optional().default(UserStatus.ACTIVO)
});

/**
 * Schema for updating basic information
 */
export const UserUpdateSchema = UserCommonSchema;

/**
 * Schema for updating profile photo
 */
export const UserPhotoSchema = z.object({
  id: z.string(),
  profilePhoto: z.string()
});

/**
 * Schema for updating user status
 */
export const UserStatusUpdateSchema = z.object({
  id: z.string(),
  status: UserStatusSchema
});

/**
 * Schema for updating user password
 */
export const UserPasswordUpdateSchema = z.object({
  id: z.string(),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

/**
 * Schema for changing username
 */
export const UserChangeUsernameSchema = z.object({
  id: z.string(),
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  currentUsername: z.string().min(3, "Username must be at least 3 characters"),
  newUsername: z.string().min(3, "Username must be at least 3 characters")
});

/**
 * Helper function to extract validation errors from a ZodError
 */
export const extractValidationErrors = (error: z.ZodError): UserValidationErrors => {
  const errors: UserValidationErrors = {};
  
  error.errors.forEach((issue) => {
    const path = issue.path[0] as string;
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path]!.push(issue.message);
  });
  
  return errors;
};