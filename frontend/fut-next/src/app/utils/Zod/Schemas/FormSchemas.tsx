import { z } from "zod";

// Schema for player stats (first form)

export const statsSchema = z.object({
  team: z.string().min(1, "El equipo es requerido"),
  jerseyNumber: z
    .number({
      required_error: "El número de camiseta es requerido",
      invalid_type_error: "Debe ser un número",
    })
    .min(0, "Debe ser mayor o igual a 0"),
  goals: z
    .number({
      required_error: "La cantidad de goles es requerida",
      invalid_type_error: "Debe ser un número",
    })
    .min(0, "Debe ser mayor o igual a 0"),
  points: z
    .number({
      required_error: "Los puntos son requeridos",
      invalid_type_error: "Debe ser un número",
    })
    .min(0, "Debe ser mayor o igual a 0"),
  playerStatus: z.string().min(1, "El estado es requerido"),
  yellowCards: z
    .number({
      required_error: "Tarjetas amarillas requeridas",
      invalid_type_error: "Debe ser un número",
    })
    .min(0, "Debe ser mayor o igual a 0"),
  redCards: z
    .number({
      required_error: "Tarjetas rojas requeridas",
      invalid_type_error: "Debe ser un número",
    })
    .min(0, "Debe ser mayor o igual a 0"),
});

  // Define schema for the first form
export const perfilSchema = z.object({
    firstName: z.string().min(2, "Name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    role: z.string().min(1, "Please select a role"),
    age: z
      .number()
      .min(1, "Age must be at least 1")
      .max(120, "Age must be less than 120"),
    birthDate: z.string().min(1, "Birth date is required"),
    photoUrl: z.string().min(1, "check the image"),
  });
  export type PerfilFormData = z.infer<typeof perfilSchema>;
  