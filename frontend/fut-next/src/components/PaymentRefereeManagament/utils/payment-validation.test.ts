import { describe, it, expect } from "vitest";
import { validatePaymentCreate, validatePaymentUpdate, calculatePaymentAmount, formatCurrency, formatDate } from "./payment-validation";

describe("calculatePaymentAmount", () => {
  it("multiplies hourly rate by hours worked", () => {
    expect(calculatePaymentAmount(100, 3.5)).toBe(350);
  });

  it("zero hours worked yields zero, does not throw", () => {
    expect(calculatePaymentAmount(100, 0)).toBe(0);
  });

  it("this calculated value is NOT automatically enforced by validatePaymentCreate - totalAmount can be set to anything regardless", () => {
    // See payment-schema.test.ts: PaymentBaseSchema.totalAmount has no
    // constraint tying it to hoursWorked * hourlyRate at all - this
    // function exists but nothing forces callers to actually use its
    // result before submitting.
    const mismatched = validatePaymentCreate({
      referee: { id: "referee-1" },
      paymentDate: "2026-06-01",
      hoursWorked: 3,
      hourlyRate: 100,
      totalAmount: 999999, // should be 300 per calculatePaymentAmount, schema doesn't care
    });

    expect(mismatched.totalAmount).toBe(999999);
  });
});

describe("validatePaymentCreate / validatePaymentUpdate", () => {
  const validPayment = {
    referee: { id: "referee-1" },
    paymentDate: "2026-06-01",
    hoursWorked: 3,
    hourlyRate: 100,
    totalAmount: 300,
  };

  it("create without an id succeeds", () => {
    expect(() => validatePaymentCreate(validPayment)).not.toThrow();
  });

  it("update without an id throws (PaymentUpdateSchema requires it)", () => {
    expect(() => validatePaymentUpdate(validPayment)).toThrow();
  });
});

describe("formatCurrency", () => {
  it("defaults to USD when no currency argument is given", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("accepts a different currency code", () => {
    expect(formatCurrency(100, "MXN")).toContain("100.00");
  });
});

describe("formatDate", () => {
  it("empty string input returns an empty string", () => {
    expect(formatDate("")).toBe("");
  });

  it("garbage date string returns the literal 'Invalid Date' string, not null and not the original input", () => {
    // Note the inconsistency with sibling modules: debt/team-debt/
    // inscription/credential's date helpers all call .toISOString() on a
    // bad Date, which DOES throw a RangeError, caught by their try/catch
    // to return null/"". This function calls .toLocaleDateString()
    // instead, which does NOT throw for an Invalid Date - it just returns
    // the string "Invalid Date", so the try/catch here never actually
    // fires and the fallback `return dateString` path is effectively dead
    // for this input shape.
    expect(formatDate("not-a-real-date")).toBe("Invalid Date");
  });
});
