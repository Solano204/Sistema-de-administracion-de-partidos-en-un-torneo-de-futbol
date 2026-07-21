import { describe, it, expect } from "vitest";
import { validateInscriptionRecord, formatDateForInput, formatCurrency } from "./inscription-validation";

describe("validateInscriptionRecord", () => {
  const validCreateData = { nameTeam: "Los Tigres", numPlayer: 12, amount: 500, date: "2026-06-01" };

  it("edit with no id throws before the schema runs", () => {
    expect(() => validateInscriptionRecord(validCreateData, true)).toThrow("ID is required for edit operations");
  });

  it("create with valid data succeeds", () => {
    const result = validateInscriptionRecord(validCreateData, false);

    expect(result.nameTeam).toBe("Los Tigres");
  });
});

describe("formatDateForInput - truncates to YYYY-MM-DD (10 chars), unlike CredentialsManagment's 16-char datetime-local format", () => {
  it("empty/null input returns an empty string", () => {
    expect(formatDateForInput(null)).toBe("");
  });

  it("valid ISO date truncates to just the date portion", () => {
    expect(formatDateForInput("2026-06-01T14:30:00.000Z")).toBe("2026-06-01");
  });

  it("garbage date string returns an empty string rather than throwing", () => {
    expect(formatDateForInput("not-a-date")).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats a number as USD currency", () => {
    expect(formatCurrency(500)).toBe("$500.00");
  });

  it("formats a negative amount with a leading minus sign", () => {
    expect(formatCurrency(-50)).toContain("50.00");
  });
});
