import { describe, it, expect } from "vitest";
import { MoneySchema, PaymentDateSchema, PaymentBaseSchema, PaymentCreateSchema, PaymentUpdateSchema, extractValidationErrors } from "./payment-schema";
import { z } from "zod";

describe("MoneySchema", () => {
  it("zero amount is allowed (nonnegative, not strictly positive)", () => {
    expect(MoneySchema.safeParse({ amount: 0 }).success).toBe(true);
  });

  it("negative amount fails", () => {
    expect(MoneySchema.safeParse({ amount: -1 }).success).toBe(false);
  });

  it("currency is optional", () => {
    expect(MoneySchema.safeParse({ amount: 100 }).success).toBe(true);
  });
});

describe("PaymentDateSchema / PaymentBaseSchema date format", () => {
  it("valid YYYY-MM-DD passes", () => {
    expect(PaymentDateSchema.safeParse({ value: "2026-06-01" }).success).toBe(true);
  });

  it("MM/DD/YYYY format fails - only ISO date format is accepted", () => {
    expect(PaymentDateSchema.safeParse({ value: "06/01/2026" }).success).toBe(false);
  });
});

describe("PaymentBaseSchema", () => {
  const validPayment = {
    referee: { id: "referee-1" },
    paymentDate: "2026-06-01",
    hoursWorked: 3,
    hourlyRate: 100,
    totalAmount: 300,
  };

  it("valid payment passes", () => {
    expect(PaymentBaseSchema.safeParse(validPayment).success).toBe(true);
  });

  it("hoursWorked must be strictly positive - zero fails", () => {
    expect(PaymentBaseSchema.safeParse({ ...validPayment, hoursWorked: 0 }).success).toBe(false);
  });

  it("hourlyRate of zero is allowed (nonnegative, not strictly positive)", () => {
    expect(PaymentBaseSchema.safeParse({ ...validPayment, hourlyRate: 0 }).success).toBe(true);
  });

  it("totalAmount has NO positivity/nonnegativity check at all - a negative total is accepted", () => {
    // Documents a real gap: unlike hoursWorked/hourlyRate, totalAmount is
    // just z.number() with no .positive()/.nonnegative() constraint, so
    // this schema doesn't catch a negative or wildly-mismatched total
    // (e.g. one that doesn't equal hoursWorked * hourlyRate - unlike the
    // backend's RefereePayment.validateRefereePayment, which DOES check
    // that exact product, though that backend check is itself dead code
    // per this session's earlier DebtValidationMethodsTest finding).
    expect(PaymentBaseSchema.safeParse({ ...validPayment, totalAmount: -999 }).success).toBe(true);
  });

  it("referee.id empty string fails", () => {
    expect(PaymentBaseSchema.safeParse({ ...validPayment, referee: { id: "" } }).success).toBe(false);
  });
});

describe("PaymentCreateSchema vs PaymentUpdateSchema", () => {
  const validPayment = {
    referee: { id: "referee-1" },
    paymentDate: "2026-06-01",
    hoursWorked: 3,
    hourlyRate: 100,
    totalAmount: 300,
  };

  it("create: id is optional", () => {
    expect(PaymentCreateSchema.safeParse(validPayment).success).toBe(true);
  });

  it("update: id is required", () => {
    expect(PaymentUpdateSchema.safeParse(validPayment).success).toBe(false);
    expect(PaymentUpdateSchema.safeParse({ ...validPayment, id: "payment-1" }).success).toBe(true);
  });
});

describe("extractValidationErrors", () => {
  it("groups issues by their dotted path", () => {
    const result = PaymentUpdateSchema.safeParse({
      referee: { id: "" },
      paymentDate: "not-a-date",
      hoursWorked: -1,
      hourlyRate: 100,
      totalAmount: 100,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = extractValidationErrors(result.error);

      expect(errors).toHaveProperty("id"); // missing id
      expect(errors).toHaveProperty("referee.id");
      expect(errors).toHaveProperty("paymentDate");
      expect(errors).toHaveProperty("hoursWorked");
    }
  });
});
