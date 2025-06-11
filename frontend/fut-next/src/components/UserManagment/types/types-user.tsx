/**
 * Enum for user statuses
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
   * Interface for full user details record
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
    user: string;
  }
  
  /**
   * Interface for full user details record with password
   */
  export interface UserDetailsRecordFullWithPassword extends UserDetailsRecordFull {
    password: string;
  }
  
  /**
   * Interface for user login record
   */
  export interface UserLoginRecord {
    user: string;
    password: string;
  }
  
  /**
   * Interface for user registration record
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
    status: UserStatus;
    profilePhoto: string;
  }
  
  /**
   * Interface for updating basic user information
   */
  export interface UserUpdateBasicInformation {
    id: string;
    firstName: string;
    role: UserRole;
    lastName: string;
    email: string;
    birthDate: string;
    age: number;
  }
  
  /**
   * Interface for updating user profile photo
   */
  export interface UserUpdateProfilePhoto {
    id: string;
    profilePhoto: string ;
  }
  
  /**
   * Interface for updating user password
   */
  export interface UserUpdatePassword {
    id: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  /**
   * Interface for changing username
   */
  export interface UserChangeUserName {
    id: string;
    currentPassword: string;
    currentUsername: string;
    newUsername: string;
  }
  
  /**
   * Type for user validation errors
   */
  export type UserValidationErrors = {
    [key in keyof UserRegisterRecord | keyof UserUpdateBasicInformation | keyof UserUpdateProfilePhoto | keyof UserUpdatePassword | keyof UserChangeUserName]?: string[];
  } & {
    [key: string]: string[];
  };