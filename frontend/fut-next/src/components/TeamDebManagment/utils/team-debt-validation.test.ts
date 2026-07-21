import { describe, it, expect } from "vitest";
import { validateTeamDebtRecord, validateTeamDebtStatus, formatDateString } from "./team-debt-validation";

// Structurally identical wrapper to PlayerDebtManagment/utils/debt-validation.ts
// (see that file's test for the full explanation of the isEdit guard).
describe("validateTeamDebtRecord", () => {
  const validCreateData = {
    IdProperty: "team-1",
    amount: 500,
    description: "Fee",
    state: "PENDIENTE" as const,
    dueDate: "2026-06-01",
  };

  it("edit (isEdit=true) with no Id throws before the schema runs", () => {
    expect(() => validateTeamDebtRecord(validCreateData, true)).toThrow("ID is required for edit operations");
  });

  it("create (isEdit=false) succeeds and uses the shared hardcoded UUID default", () => {
    const result = validateTeamDebtRecord(validCreateData, false);

    expect(result.Id).toBe("36dfd3fc-80ef-4fae-a816-d2ae1a5612c0");
  });
});

describe("validateTeamDebtStatus", () => {
  it("invalid status throws", () => {
    expect(() => validateTeamDebtStatus("BOGUS")).toThrow();
  });
});

describe("formatDateString", () => {
  it("unparsable date returns null instead of throwing", () => {
    expect(formatDateString("garbage")).toBeNull();
  });
});
