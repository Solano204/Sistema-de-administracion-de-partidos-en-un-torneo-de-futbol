import { describe, it, expect } from "vitest";
import { CredentialCreateSchema, CredentialEditSchema } from "./credential-schema";

// Same number-or-numeric-string coercion pattern as InscriptionCreateSchema,
// but note the amount refine here is STRICTLY positive (val > 0), unlike
// InscriptionCreateSchema's amount which allows 0 - a real, if minor,
// inconsistency between two structurally similar schemas.
describe("CredentialCreateSchema", () => {
  const base = { playerName: "Carlos", description: "Match fee" };

  it("zero amount fails here (val > 0), unlike InscriptionCreateSchema's amount (val >= 0)", () => {
    expect(CredentialCreateSchema.safeParse({ ...base, id: "1", amount: 0 }).success).toBe(false);
  });

  it("positive numeric string amount is coerced and passes", () => {
    const result = CredentialCreateSchema.safeParse({ ...base, id: "1", amount: "150" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(150);
    }
  });

  it("id is required on create, unlike InscriptionCreateSchema/DebtRecordCreateSchema (no default/optional)", () => {
    const result = CredentialCreateSchema.safeParse({ ...base, amount: 100 });

    expect(result.success).toBe(false);
  });

  it("description over 255 characters fails", () => {
    expect(
      CredentialCreateSchema.safeParse({ ...base, id: "1", amount: 100, description: "a".repeat(256) }).success
    ).toBe(false);
  });
});

describe("CredentialEditSchema", () => {
  it("structurally identical to CredentialCreateSchema (both require id)", () => {
    const result = CredentialEditSchema.safeParse({
      playerName: "Carlos",
      description: "Match fee",
      id: "credential-1",
      amount: 100,
    });

    expect(result.success).toBe(true);
  });
});
