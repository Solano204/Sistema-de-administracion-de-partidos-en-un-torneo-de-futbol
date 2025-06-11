// File: src/app/features/referee/types/referee-types.ts

/**
 * Enum for referee statuses
 */
export enum UserStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  SUSPENDIDO = "SUSPENDIDO",
  PENDIENTE = "PENDIENTE",
}

/**
 * Enum for user roles
 */
export enum UserRole {
  ADMINISTRADOR = "ADMINISTRADOR",
  ARBITRO = "ARBITRO",
  JUGADOR = "JUGADOR",
}

/**
 * Interface for full referee details record
 */
export interface UserDetailsRecordFull {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  age: number;
  role: UserRole;
  urlPhoto: string | null;
  status: UserStatus;
  user?: string;
}

/**
 * Interface for referee registration record
 */
export interface UserRegisterRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  age: number;
  user: string;
  password: string;
  role: UserRole;
  urlPhoto?: string; // Changed to optional to match schema
  status?: UserStatus;
}

/**
 * Interface for updating basic referee information
 */
export interface UserUpdateBasicInformation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  age: number;
  role?: UserRole;
}

/**
 * Interface for updating referee profile photo
 */
export interface UserUpdateProfilePhoto {
  id: string;
  profilePhoto: string;
}

/**
 * Type for referee validation errors
 */
export type RefereeValidationErrors = {
  [key in keyof UserRegisterRecord | keyof UserUpdateBasicInformation | keyof UserUpdateProfilePhoto]?: string[];
} & {
  [key: string]: string[];
};