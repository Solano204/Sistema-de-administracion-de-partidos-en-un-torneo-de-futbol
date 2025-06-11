import { perfilSchema, statsSchema } from "../Schemas/FormSchemas";
import { z } from "zod";

// Validation function for the multi-step form
export const validatePerfilForm = (formData: Record<string, any>) => {
    try {
      perfilSchema.parse(formData);
      return {}; // No errors
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        return errors;
      }
      return { form: "Invalid form data" };
    }
  };
  
  
  export const validateStatsForm = (formData: Record<string, any>) => {
    try {
      statsSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.reduce((acc, err) => {
          if (err.path[0]) acc[err.path[0]] = err.message;
          return acc;
        }, {} as Record<string, string>);
      }
      return { form: "Invalid form data" };
    }
  };
  


  

















  // Team data schema with validation rules
export const teamDataSchema = z.object({
  id: z.string().optional(), // ID can be optional for new teams
  name: z.string().min(2, "Team name must be at least 2 characters"),
  // logo: z.string().optional(),
  numMembers: z.number()
    .min(1, "Team must have at least 1 member")
    .max(50, "Team cannot have more than 50 members"),
  goals: z.number()
    .min(0, "Goals cannot be negative"),
  goalsReceived: z.number()
    .min(0, "Goals received cannot be negative"),
  points: z.number()
    .min(0, "Points cannot be negative"),
  matches: z.number()
    .min(0, "Matches cannot be negative"),
  matchesWon: z.number()
    .min(0, "Matches won cannot be negative"),
  matchesDrawn: z.number()
    .min(0, "Matches drawn cannot be negative"),
  matchesLost: z.number()
    .min(0, "Matches lost cannot be negative"),
  qualified: z.boolean(),
  categoryId: z.string().optional(),
});

// Create a type from the schema
export type TeamDataFormData = z.infer<typeof teamDataSchema>;

// Validation function
export const validateTeamData = (formData: Record<string, any>) => {
  try {
    teamDataSchema.parse(formData);
    return {}; // No errors
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return errors;
    }
    return { form: "Invalid form data" };
  }
};