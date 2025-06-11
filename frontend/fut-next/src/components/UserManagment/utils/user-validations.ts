import { z } from 'zod';
import {
  UserStatus,
  UserRegisterRecord,
  UserUpdateBasicInformation,
  UserUpdateProfilePhoto,
  UserUpdatePassword,
  UserChangeUserName,
} from '../';

import {
  UserRegisterSchema,
  UserUpdateSchema,
  UserPhotoSchema,
  UserStatusSchema,
  UserPasswordUpdateSchema,
  UserChangeUsernameSchema,
  extractValidationErrors
} from '../';

/**
 * Type definitions for validation errors by form type
 */
export type UserRegisterErrors = Record<keyof UserRegisterRecord, string[] | undefined>;
export type UserUpdateBasicInfoErrors = Record<keyof UserUpdateBasicInformation, string[] | undefined>;
export type UserChangePasswordErrors = Record<keyof UserUpdatePassword, string[] | undefined>;
export type UserChangeUserNameErrors = Record<keyof UserChangeUserName, string[] | undefined>;
export type UserUpdatePasswordErrors = Record<string, string[] | undefined>;
export type UserUpdateUserNameErrors = Record<string, string[] | undefined>;

/**
 * Validate user registration data
 */
export const validateUserRegistration = (data: unknown): UserRegisterRecord => {
  try {
    return UserRegisterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = extractValidationErrors(error);
      throw new Error(JSON.stringify(errors));
    }
    throw error;
  }
};

/**
 * Validate user update data
 */
export const validateUserUpdate = (data: unknown): UserUpdateBasicInformation => {
  try {
    return UserUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = extractValidationErrors(error);
      throw new Error(JSON.stringify(errors));
    }
    throw error;
  }
};

/**
 * Wrapper for validateUserUpdate to maintain compatibility
 */
export const validateUserUpdateBasicInfo = (data: unknown): UserUpdateBasicInformation => {
  return validateUserUpdate(data);
};

/**
 * Validate user photo update data
 */
export const validateUserPhotoUpdate = (data: unknown): UserUpdateProfilePhoto => {
  try {
    return UserPhotoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = extractValidationErrors(error);
      throw new Error(JSON.stringify(errors));
    }
    throw error;
  }
};

/**
 * Wrapper for validateUserPhotoUpdate to maintain compatibility
 */
export const validateUserProfilePhotoUpdate = (data: unknown): UserUpdateProfilePhoto => {
  return validateUserPhotoUpdate(data);
};

/**
 * Validate user status
 */
export const validateUserStatus = (status: unknown): UserStatus => {
  try {
    return UserStatusSchema.parse(status);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = extractValidationErrors(error);
      throw new Error(JSON.stringify(errors));
    }
    throw error;
  }
};

/**
 * Validate user status update
 */
export const validateUserStatusUpdate = (userId: string, status: unknown): { userId: string; status: UserStatus } => {
  const validStatus = validateUserStatus(status);
  return { userId, status: validStatus };
};

/**
 * Validate password change
 */
export const validatePasswordChange = (data: unknown): UserUpdatePassword => {
  try {
    return UserPasswordUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = extractValidationErrors(error);
      throw new Error(JSON.stringify(errors));
    }
    throw error;
  }
};

/**
 * Wrapper for validatePasswordChange to maintain compatibility
 */
export const validateUserChangePassword = (
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): UserUpdatePassword => {
  return validatePasswordChange({
    id: userId,
    currentPassword,
    newPassword,
    confirmPassword
  });
};

/**
 * Validate username change
 */
export const validateUsernameChange = (data: unknown): UserChangeUserName => {
  try {
    return UserChangeUsernameSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = extractValidationErrors(error);
      throw new Error(JSON.stringify(errors));
    }
    throw error;
  }
};

/**
 * Wrapper for validateUsernameChange to maintain compatibility
 */
export const validateUserNameChange = (
  userId: string,
  currentPassword: string,
  currentUserName: string,
  newUserName: string
): UserChangeUserName => {
  return validateUsernameChange({
    id: userId,
    currentPassword,
    currentUsername: currentUserName,
    newUsername: newUserName
  });
};

/**
 * Calculate age from birthdate
 */
export const calculateAge = (birthDateStr: string): number => {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 0 || age > 120) {
    throw new Error("Invalid birth date");
  }
  
  return age;
};

/**
 * Field-level validation for user registration
 */
export const validateUserRegisterField = (
  fieldName: keyof UserRegisterRecord,
  value: any,
  existingData?: Partial<UserRegisterRecord>
): string | undefined => {
  try {
    // Create a temporary object with just this field to validate
    const testData = {
      ...(existingData || {}),
      [fieldName]: value
    };
    
    // Use a partial schema with only the needed fields
    const partialSchema = z.object({
      [fieldName]: UserRegisterSchema.shape[fieldName]
    });
    
    partialSchema.parse(testData);
    return undefined; // No error
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === fieldName);
      return fieldError?.message;
    }
    return "Validation error";
  }
};

/**
 * Field-level validation for user update basic info
 */
export const validateUserUpdateBasicInfoField = (
  fieldName: keyof UserUpdateBasicInformation,
  value: any,
  existingData?: Partial<UserUpdateBasicInformation>
): string | undefined => {
  try {
    const testData = {
      ...(existingData || {}),
      [fieldName]: value
    };
    
    const partialSchema = z.object({
      [fieldName]: UserUpdateSchema.shape[fieldName]
    });
    
    partialSchema.parse(testData);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === fieldName);
      return fieldError?.message;
    }
    return "Validation error";
  }
};function getSchemaShape(schema: z.ZodTypeAny): z.ZodRawShape {
  if (schema instanceof z.ZodObject) {
    return schema.shape;
  }
  if (schema._def.schema instanceof z.ZodObject) {
    return schema._def.schema.shape;
  }
  throw new Error('Cannot get shape from schema');
}

/**
 * Field-level validation for password change
 */
export const validateUserChangePasswordField = (
  fieldName: keyof UserUpdatePassword,
  value: any,
  existingData?: Partial<UserUpdatePassword>
): string | undefined => {
  try {
    const testData = {
      ...(existingData || {}),
      [fieldName]: value
    };
    
    // Special handling for password confirmation
    if (fieldName === 'confirmPassword' && testData.newPassword && testData.confirmPassword) {
      if (testData.newPassword !== testData.confirmPassword) {
        return "Passwords do not match";
      }
    }
    
    // Get the underlying schema shape
    const schemaShape = getSchemaShape(UserPasswordUpdateSchema);
    
    // For other fields, use the schema
    const partialSchema = z.object({
      [fieldName]: schemaShape[fieldName]
    });
    
    partialSchema.parse(testData);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === fieldName);
      return fieldError?.message;
    }
    return "Validation error";
  }
};

/**
 * Field-level validation for username change
 */
export const validateUserChangeUsernameField = (
  fieldName: keyof UserChangeUserName,
  value: any,
  existingData?: Partial<UserChangeUserName>
): string | undefined => {
  try {
    const testData = {
      ...(existingData || {}),
      [fieldName]: value
    };
    
    const partialSchema = z.object({
      [fieldName]: UserChangeUsernameSchema.shape[fieldName as keyof typeof UserChangeUsernameSchema.shape]
    });
    
    partialSchema.parse(testData);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path[0] === fieldName);
      return fieldError?.message;
    }
    return "Validation error";
  }
};

// Export helper for extracting validation errors
export { extractValidationErrors };