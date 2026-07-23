import { describe, it, expect } from "vitest";
import { validateCredentialRecord, formatDateForInput } from "./credential-validation";

describe("validateCredentialRecord", () => {
  const validCreateData = { playerName: "Carlos", amount: 100, description: "Fee" };

  it("create requires an id (CredentialCreateSchema has no default/optional id, unlike debt/inscription)", () => {
    expect(() => validateCredentialRecord(validCreateData, false)).toThrow();
  });

  it("create with an explicit id succeeds", () => {
    const result = validateCredentialRecord({ ...validCreateData, id: "cred-1" }, false);

    expect(result.id).toBe("cred-1");
  });

  it("edit with no id throws the guard error before the schema even runs", () => {
    expect(() => validateCredentialRecord(validCreateData, true)).toThrow("ID is required for edit operations");
  });
});

describe("formatDateForInput - keeps time (16 chars), unlike InscriptionManagment's date-only (10 chars) version of the same-named function", () => {
  it("valid ISO datetime keeps the date AND time portion", () => {
    expect(formatDateForInput("2026-06-01T14:30:00.000Z")).toBe("2026-06-01T14:30");
  });

  it("null input returns an empty string", () => {
    expect(formatDateForInput(null)).toBe("");
  });
});
