import { describe, it, expect } from "vitest";
import {
  validateUserRegistration,
  validateUserChangePasswordField,
  validateUserRegisterField,
  validateUserStatusUpdate,
  calculateAge,
} from "./user-validations";
import { UserRole, UserStatus } from "../types/types-user";

describe("validateUserRegistration - wraps ZodError into a JSON-stringified Error", () => {
  it("valid data passes without throwing", () => {
    expect(() =>
      validateUserRegistration({
        id: "user-1",
        firstName: "Carlos",
        lastName: "Perez",
        email: "carlos@example.com",
        birthDate: "1995-06-01",
        age: 30,
        role: UserRole.JUGADOR,
        user: "carlos",
        password: "password123",
        profilePhoto: "photo.jpg",
      })
    ).not.toThrow();
  });

  it("invalid data throws an Error whose message is a JSON-parseable field-error map, not a raw ZodError", () => {
    try {
      validateUserRegistration({ email: "not-an-email" });
      expect.fail("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const parsed = JSON.parse((error as Error).message);
      expect(parsed).toHaveProperty("email");
    }
  });
});

describe("validateUserStatusUpdate", () => {
  it("valid status returns { userId, status } as a pair", () => {
    const result = validateUserStatusUpdate("user-1", UserStatus.SUSPENDIDO);

    expect(result).toEqual({ userId: "user-1", status: UserStatus.SUSPENDIDO });
  });

  it("invalid status throws (delegates to validateUserStatus)", () => {
    expect(() => validateUserStatusUpdate("user-1", "NOT_A_STATUS")).toThrow();
  });
});

describe("validateUserChangePasswordField - the one field-validator with a hand-rolled cross-field special case", () => {
  it("confirmPassword matching newPassword: no error", () => {
    const error = validateUserChangePasswordField("confirmPassword", "newpass123", {
      newPassword: "newpass123",
    });

    expect(error).toBeUndefined();
  });

  it("confirmPassword NOT matching newPassword: returns the mismatch message directly, bypassing the schema entirely", () => {
    const error = validateUserChangePasswordField("confirmPassword", "different456", {
      newPassword: "newpass123",
    });

    expect(error).toBe("Passwords do not match");
  });

  it("confirmPassword alone (no newPassword in existingData yet) falls through to normal per-field schema validation", () => {
    // Documents the exact condition: `testData.newPassword && testData.confirmPassword`
    // both need to be truthy for the special-case branch to run at all -
    // partially-filled forms fall back to the schema's own min-length check.
    const error = validateUserChangePasswordField("confirmPassword", "short", {});

    expect(error).toBeDefined();
    expect(error).not.toBe("Passwords do not match");
  });
});

describe("validateUserRegisterField - single-field validation via a dynamically-built partial schema", () => {
  it("valid field value returns undefined (no error)", () => {
    expect(validateUserRegisterField("email", "carlos@example.com")).toBeUndefined();
  });

  it("invalid field value returns that field's specific error message", () => {
    expect(validateUserRegisterField("email", "not-an-email")).toBe("Invalid email format");
  });

  it("existingData is merged in but only the target field's error is reported", () => {
    const error = validateUserRegisterField("user", "ab", { email: "carlos@example.com" });

    expect(error).toBeDefined();
  });
});

describe("calculateAge (third copy of this logic in the codebase - see referee-validation.test.ts)", () => {
  it("age computed correctly for a normal birth date", () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 40;

    expect(calculateAge(`${birthYear}-01-01`)).toBe(40);
  });

  it("throws for an out-of-range result, same guard as referee-validation's copy", () => {
    expect(() => calculateAge("1850-01-01")).toThrow("Invalid birth date");
  });
});
