import { describe, it, expect } from "vitest";
import { validateDebtRecord, validateDebtStatus, formatDateString } from "./debt-validation";

// This wrapper's isEdit-missing-Id guard fires BEFORE the schema even runs
// (a plain thrown Error, not a ZodError) - distinct from debt-schema.test.ts,
// which covers the schema's own validation directly. This file is the
// identical pattern also used by inscription-validation.ts,
// credential-validation.ts, and team-debt-validation.ts.
describe("validateDebtRecord", () => {
  const validCreateData = {
    IdProperty: "player-1",
    amount: 100,
    description: "Fee",
    state: "PENDIENTE" as const,
    dueDate: "2026-06-01",
  };

  it("create (isEdit=false) with no Id succeeds, using the schema's default", () => {
    const result = validateDebtRecord(validCreateData, false);

    expect(result.Id).toBe("36dfd3fc-80ef-4fae-a816-d2ae1a5612c0"); // see debt-schema.test.ts
  });

  it("edit (isEdit=true) with no Id throws a plain Error BEFORE the schema runs", () => {
    expect(() => validateDebtRecord(validCreateData, true)).toThrow("ID is required for edit operations");
  });

  it("edit (isEdit=true) with an Id present succeeds", () => {
    const result = validateDebtRecord({ ...validCreateData, Id: "debt-1", paidDate: null }, true);

    expect(result.Id).toBe("debt-1");
  });

  it("schema-level validation failures still propagate as thrown errors (not caught/swallowed)", () => {
    expect(() => validateDebtRecord({ ...validCreateData, amount: -50 }, false)).toThrow();
  });
});

describe("validateDebtStatus", () => {
  it("valid status string passes through", () => {
    expect(validateDebtStatus("PAGADO")).toBe("PAGADO");
  });

  it("invalid status string throws", () => {
    expect(() => validateDebtStatus("NOT_REAL")).toThrow();
  });
});

describe("formatDateString", () => {
  it("null input returns null, does not throw", () => {
    expect(formatDateString(null)).toBeNull();
  });

  it("valid date string is formatted to YYYY-MM-DD", () => {
    expect(formatDateString("2026-06-01T00:00:00.000Z")).toBe("2026-06-01");
  });

  it("Date object input is formatted correctly", () => {
    expect(formatDateString(new Date("2026-06-01T00:00:00.000Z"))).toBe("2026-06-01");
  });

  it("garbage, unparsable date string returns null rather than throwing", () => {
    // new Date("not-a-date") produces an Invalid Date object, whose
    // .toISOString() THROWS a RangeError - caught by the try/catch here.
    expect(formatDateString("not-a-real-date")).toBeNull();
  });
});
