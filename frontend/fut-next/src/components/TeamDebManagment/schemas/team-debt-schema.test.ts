import { describe, it, expect } from "vitest";
import { TeamDebtRecordCreateSchema, TeamDebtRecordEditSchema } from "./team-debt-schema";

// Structurally identical to PlayerDebtManagment/schemas/debt-schema.ts (see
// that file's test for the full explanation) - same two findings apply
// here verbatim: the SAME hardcoded UUID default
// ('36dfd3fc-80ef-4fae-a816-d2ae1a5612c0', copy-pasted across both files)
// and the same dead dueDate transform fallback.
describe("TeamDebtRecordCreateSchema", () => {
  const validBase = {
    IdProperty: "team-123",
    amount: 500,
    description: "Tournament fee",
    state: "PENDIENTE",
    dueDate: "2026-06-01",
  };

  it("Id omitted, defaults to the exact same hardcoded UUID as DebtRecordCreateSchema", () => {
    const result = TeamDebtRecordCreateSchema.parse(validBase);

    expect(result.Id).toBe("36dfd3fc-80ef-4fae-a816-d2ae1a5612c0");
  });

  it("nameProperty omitted, defaults to the literal string 'team name' (a different placeholder than the player version's hardcoded person name)", () => {
    const result = TeamDebtRecordCreateSchema.parse(validBase);

    expect(result.nameProperty).toBe("team name");
  });

  it("amount must be positive", () => {
    expect(TeamDebtRecordCreateSchema.safeParse({ ...validBase, amount: 0 }).success).toBe(false);
  });
});

describe("TeamDebtRecordEditSchema", () => {
  it("Id is required, unlike the create schema's defaulted Id", () => {
    const result = TeamDebtRecordEditSchema.safeParse({
      IdProperty: "team-123",
      amount: 500,
      description: "Fee",
      state: "PENDIENTE",
      dueDate: "2026-06-01",
      paidDate: null,
    });

    expect(result.success).toBe(false);
  });
});
