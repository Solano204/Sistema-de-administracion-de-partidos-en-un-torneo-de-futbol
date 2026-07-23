import { describe, it, expect } from "vitest";
import { calculateAge, validateRefereeRegistration, validateRefereePhotoUpdate } from "./referee-validation";

// This module's calculateAge is the THIRD independent implementation of the
// same age-from-birthdate calculation in this codebase (also in
// AuthSchema.tsx and UserManagment/utils/user-validations.ts). Unlike
// AuthSchema's version, this one (and UserManagment's) additionally
// range-checks the result and throws if it's outside [0, 120] - a real
// behavioral difference between copies of what looks like the same
// utility function.
describe("calculateAge", () => {
  it("computes age correctly for a birthday already passed this year", () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 25;

    expect(calculateAge(`${birthYear}-01-01`)).toBe(25);
  });

  it("a future birth date produces a negative age, which throws (unlike AuthSchema's calculateAge, which has no such guard)", () => {
    const nextYear = new Date().getFullYear() + 1;

    expect(() => calculateAge(`${nextYear}-01-01`)).toThrow("Invalid birth date");
  });

  it("an implausibly old birth date (>120 years) throws", () => {
    expect(() => calculateAge("1800-01-01")).toThrow("Invalid birth date");
  });
});

describe("validateRefereeRegistration", () => {
  it("throws on invalid data rather than returning an error object", () => {
    expect(() => validateRefereeRegistration({})).toThrow();
  });
});

describe("validateRefereePhotoUpdate", () => {
  it("requires a UUID-format id, consistent with RefereePhotoSchema", () => {
    expect(() => validateRefereePhotoUpdate({ id: "not-a-uuid", profilePhoto: "x.jpg" })).toThrow();
    expect(() =>
      validateRefereePhotoUpdate({ id: "123e4567-e89b-12d3-a456-426614174000", profilePhoto: "x.jpg" })
    ).not.toThrow();
  });
});
