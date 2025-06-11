// Types based on the Java backend
export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string;
  }
  
  export interface TokenResponse {
    userId: string;
    accessToken: string;
    refreshToken: string;
    photoUrl: string;
    tokenType: string;
    expiresIn: number;
  }
  
  export interface UserRegisterRecord {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    user: string;

    birthDate: string; // ISO format
    age: number;
    password: string;
    role: string;
    urlPhoto?: string;
  }
  


  
export enum FormType {
    LOGIN = "LOGIN",
    SIGNUP = "SIGNUP",
    FORGOT_PASSWORD = "FORGOT_PASSWORD",
    CHANGE_PASSWORD = "CHANGE_PASSWORD",
    CHANGE_USERNAME = "CHANGE_USERNAME",
    CHANGE_INFORMATION = "CHANGE_INFORMATION",}

  export interface LoginSignupFormProps {
    type?: FormType;
    className?: string;
    existAD: boolean;
    infoUser?: UserDetailsRecordFull;
  }



  export interface UserInfoRecord {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string; // ISO format
    age: number;
    role: string;
    urlPhoto?: string;
  }
  

  // Add these to your existing TypesAuth.ts
export interface UserRole {
    role: 'ADMINISTRADOR' | 'ARBITRO' | 'JUGADOR';
  }
  
  export interface UserUpdateBasicInformation {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    age: number;
    role: string;
  }
  
  export interface UserDetailsRecordFull {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    role: UserRole;
    urlPhoto?: string;
    status: string;
    age: number;
  }