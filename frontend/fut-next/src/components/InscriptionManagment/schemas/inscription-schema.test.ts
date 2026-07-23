import { describe, it, expect } from "vitest";
import { InscriptionCreateSchema, InscriptionEditSchema } from "./inscription-schema";

describe("InscriptionCreateSchema - numPlayer/amount accept number OR numeric string", () => {
  const base = { nameTeam: "Los Tigres", date: "2026-06-01" };

  it("numeric number input for numPlayer/amount passes", () => {
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: 12, amount: 500 }).success).toBe(true);
  });

  it("numeric STRING input for numPlayer/amount is coerced and passes", () => {
    const result = InscriptionCreateSchema.safeParse({ ...base, numPlayer: "12", amount: "500" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.numPlayer).toBe(12); // coerced from string to number
      expect(typeof result.data.numPlayer).toBe("number");
    }
  });

  it("non-numeric string for numPlayer fails the refine (Number('abc') is NaN)", () => {
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: "abc", amount: 500 }).success).toBe(false);
  });

  it("zero or negative numPlayer fails - must be a positive integer", () => {
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: 0, amount: 500 }).success).toBe(false);
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: -3, amount: 500 }).success).toBe(false);
  });

  it("fractional numPlayer fails - must be an integer", () => {
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: 5.5, amount: 500 }).success).toBe(false);
  });

  it("negative amount fails, but zero amount is allowed (>= 0, not > 0)", () => {
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: 10, amount: -1 }).success).toBe(false);
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: 10, amount: 0 }).success).toBe(true);
  });

  it("id is optional on create", () => {
    expect(InscriptionCreateSchema.safeParse({ ...base, numPlayer: 10, amount: 500 }).success).toBe(true);
  });
});

describe("InscriptionEditSchema", () => {
  it("id is required, unlike the create schema", () => {
    const result = InscriptionEditSchema.safeParse({
      nameTeam: "Los Tigres",
      date: "2026-06-01",
      numPlayer: 10,
      amount: 500,
      // id intentionally omitted
    });

    expect(result.success).toBe(false);
  });
});
