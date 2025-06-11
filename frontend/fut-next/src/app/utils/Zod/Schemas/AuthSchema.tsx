// app/utils/Zod/Schemas/AuthSchema.ts
import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
// Login schema
export const signinSchema = z.object({
  user: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Signup schema
export const signupSchema = z.object({
  user: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

// Personal info schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  birthDate: z.string()
    .refine(date => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid date format"),
  urlPhoto: z.string().url("Invalid URL format").optional(),
});

// Calculate age from birthdate
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
};

// Combined registration schema
export const registrationSchema = z.object({
  personalInfo: personalInfoSchema,
  credentials: signupSchema,
});



// Change Password Schema
export const changePasswordSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    // .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    
});

// Change Username Schema
export const changeUsernameSchema = z.object({
  currentUsername: z.string().min(3, "Current username must be at least 3 characters"),
  newUsername: z.string()
    .min(3, "New username must be at least 3 characters"),
  currentPassword: z.string().min(8, "Password must be at least 8 characters")
});
