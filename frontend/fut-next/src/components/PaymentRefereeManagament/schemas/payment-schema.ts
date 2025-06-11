// File: src/app/features/payment/schemas/payment-schema.ts
import { z } from "zod";
import { PaymentValidationErrors } from "../types/payment-types";

/**
 * Schema for money validation
 */
export const MoneySchema = z.object({
  amount: z.number().nonnegative("Amount must be 0 or positive"),
  currency: z.string().optional()
});

/**
 * Schema for payment date validation
 */
export const PaymentDateSchema = z.object({
  value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

/**
 * Schema for referee reference
 */
export const RefereeSchema = z.object({
  id: z.string().min(1, "Referee ID is required"),
  fullName: z.string().optional()
});

/**
 * Base schema for payment validation
 */
export const PaymentBaseSchema = z.object({
  referee: RefereeSchema,
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  hoursWorked: z.number().positive("Hours worked must be positive"),
  hourlyRate: z.number().nonnegative("Hourly rate must be 0 or positive"),
  totalAmount: z.number()
});

/**
 * Schema for creating a new payment
 */
export const PaymentCreateSchema = PaymentBaseSchema.extend({
  id: z.string().optional()
});

/**
 * Schema for updating an existing payment
 */
export const PaymentUpdateSchema = PaymentBaseSchema.extend({
  id: z.string().min(1, "Payment ID is required")
});

/**
 * Helper function to extract validation errors from a ZodError
 */
export const extractValidationErrors = (error: z.ZodError): PaymentValidationErrors => {
  const errors: PaymentValidationErrors = {};
  
  error.errors.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path]!.push(issue.message);
  });
  
  return errors;
};