// File: src/app/features/referee/utils/referee-validation.ts
import { 
  UserRegisterRecord,
  UserUpdateBasicInformation,
  UserUpdateProfilePhoto,
  UserStatus,
} from '../types/referee-types';

import {
  RefereeRegisterSchema,
  RefereeUpdateSchema,
  RefereePhotoSchema,
  UserStatusSchema,
  extractValidationErrors
} from '../schemas/referee-schema';

/**
 * Validate referee registration data
 */
export const validateRefereeRegistration = (data: unknown): UserRegisterRecord => {
  return RefereeRegisterSchema.parse(data);
};

/**
 * Validate referee update data
 */
export const validateRefereeUpdate = (data: unknown): UserUpdateBasicInformation => {
  return RefereeUpdateSchema.parse(data);
};

/**
 * Validate referee photo update data
 */
export const validateRefereePhotoUpdate = (data: unknown): UserUpdateProfilePhoto => {
  return RefereePhotoSchema.parse(data);
};

/**
 * Validate referee status
 */
export const validateRefereeStatus = (status: unknown): UserStatus => {
  return UserStatusSchema.parse(status);
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

// Export helper for extracting validation errors
export { extractValidationErrors };