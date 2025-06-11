import { z } from "zod";

// Shared schema for all forms
export const userSchema = z.object({
  // Personal Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.string().min(1, "Please select a role"),
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  birthDate: z.string().min(1, "Birth date is required"),
  
  // Player Stats (if applicable)
  // Add your player stats fields here
}).partial(); // Makes all fields optional for partial validation

// Type for our form data
export type UserFormData = z.infer<typeof userSchema>;

// Validation functions for each step
export const validatePersonalInfo = (data: Partial<UserFormData>) => {
  const result = userSchema.pick({
    name: true,
    lastName: true,
    email: true,
    role: true,
    age: true,
    birthDate: true
  }).safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0]] = err.message;
      }
    });
    return errors;
  }
  return {};
};
