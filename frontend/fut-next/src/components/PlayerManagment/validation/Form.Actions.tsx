
import { z } from "zod";
import { perfilSchema, statsSchema } from "../schemas/FormSchemas";

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
  


  












