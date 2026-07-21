import { describe, it, expect } from "vitest";
import { DebtRecordCreateSchema, DebtRecordEditSchema, DebtStatusUpdateSchema } from "./debt-schema";

// Found, not fixed - two real issues worth a human decision, both also
// present identically in team-debt-schema.ts (TeamDebtRecordCreateSchema):
//
// 1. DebtRecordCreateSchema.Id defaults to a HARDCODED, FIXED UUID
//    ('36dfd3fc-80ef-4fae-a816-d2ae1a5612c0') rather than generating a
//    fresh one - every debt submitted through this schema without an
//    explicit Id gets the exact same id value. Whether the backend
//    actually uses this client-supplied id or generates its own
//    server-side (in which case this is harmless) isn't visible from the
//    schema alone.
// 2. dueDate's .transform(val => val || new Date()...) can NEVER actually
//    fire its fallback: the preceding .regex(YYYY-MM-DD) already rejects
//    any falsy/malformed value before the transform runs, so by the time
//    .transform sees `val`, it's always already a valid non-empty date
//    string - `val || fallback` is always just `val`. Dead code, pinned
//    down explicitly below rather than assumed.
describe("DebtRecordCreateSchema", () => {
  const validBase = {
    IdProperty: "player-123",
    amount: 100,
    description: "Registration fee",
    state: "PENDIENTE",
    dueDate: "2026-06-01",
  };

  it("Id omitted, defaults to the same hardcoded UUID every time - not a fresh generated one", () => {
    const first = DebtRecordCreateSchema.parse(validBase);
    const second = DebtRecordCreateSchema.parse(validBase);

    expect(first.Id).toBe("36dfd3fc-80ef-4fae-a816-d2ae1a5612c0");
    expect(first.Id).toBe(second.Id); // same fixed value both times
  });

  it("nameProperty omitted, defaults to a hardcoded literal person's name, not a placeholder like 'N/A'", () => {
    const result = DebtRecordCreateSchema.parse(validBase);

    expect(result.nameProperty).toBe("carlos josue lopez");
  });

  it("dueDate empty string fails validation before the transform's fallback could ever run", () => {
    const result = DebtRecordCreateSchema.safeParse({ ...validBase, dueDate: "" });

    expect(result.success).toBe(false); // NOT defaulted to today's date
  });

  it("amount must be positive", () => {
    expect(DebtRecordCreateSchema.safeParse({ ...validBase, amount: 0 }).success).toBe(false);
    expect(DebtRecordCreateSchema.safeParse({ ...validBase, amount: -5 }).success).toBe(false);
  });

  it("paidDate omitted, becomes null rather than undefined", () => {
    const result = DebtRecordCreateSchema.parse(validBase);

    expect(result.paidDate).toBeNull();
  });

  it("all fields valid and explicit, parses through unchanged", () => {
    const result = DebtRecordCreateSchema.parse({
      ...validBase,
      Id: "real-uuid-here",
      nameProperty: "Real Player Name",
      paidDate: "2026-05-15",
    });

    expect(result.Id).toBe("real-uuid-here");
    expect(result.nameProperty).toBe("Real Player Name");
    expect(result.paidDate).toBe("2026-05-15");
  });
});

describe("DebtRecordEditSchema", () => {
  it("Id is required (no default) - unlike the create schema", () => {
    const result = DebtRecordEditSchema.safeParse({
      IdProperty: "player-123",
      amount: 100,
      description: "Fee",
      state: "PENDIENTE",
      dueDate: "2026-06-01",
      paidDate: null,
      // Id intentionally omitted
    });

    expect(result.success).toBe(false);
  });
});

describe("DebtStatusUpdateSchema", () => {
  it("valid status update parses", () => {
    const result = DebtStatusUpdateSchema.safeParse({
      Id: "debt-123",
      state: "PAGADO",
      paidDate: "2026-05-15",
    });

    expect(result.success).toBe(true);
  });

  it("invalid enum state value fails", () => {
    const result = DebtStatusUpdateSchema.safeParse({
      Id: "debt-123",
      state: "NOT_A_REAL_STATUS",
      paidDate: null,
    });

    expect(result.success).toBe(false);
  });
});
