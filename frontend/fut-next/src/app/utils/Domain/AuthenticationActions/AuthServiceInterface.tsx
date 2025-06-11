"use server";
// domain/auth/AuthService.ts
// domain/auth/AuthService.ts
export interface AuthServiceInterface {
  signUp(prevState: any, formData: FormData): Promise<{ message: string }>;
  logIn(prevState: any, formData: FormData): Promise<{ message: string }>;
}
