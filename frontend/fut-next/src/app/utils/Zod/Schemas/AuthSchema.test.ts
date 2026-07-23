import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  personalInfoSchema,
  changePasswordSchema,
  changeUsernameSchema,
  calculateAge,
} from "./AuthSchema";

describe("loginSchema", () => {
  it("valid username and password pass", () => {
    expect(loginSchema.safeParse({ username: "carlos", password: "password123" }).success).toBe(true);
  });

  it("username shorter than 3 chars fails", () => {
    expect(loginSchema.safeParse({ username: "ab", password: "password123" }).success).toBe(false);
  });

  it("password shorter than 8 chars fails", () => {
    expect(loginSchema.safeParse({ username: "carlos", password: "short1" }).success).toBe(false);
  });
});

describe("signupSchema password policy", () => {
  const base = { user: "carlos" };

  it("meets every requirement, passes", () => {
    expect(signupSchema.safeParse({ ...base, password: "Passw0rd!" }).success).toBe(true);
  });

  it("missing an uppercase letter fails", () => {
    expect(signupSchema.safeParse({ ...base, password: "passw0rd!" }).success).toBe(false);
  });

  it("missing a lowercase letter fails", () => {
    expect(signupSchema.safeParse({ ...base, password: "PASSW0RD!" }).success).toBe(false);
  });

  it("missing a digit fails", () => {
    expect(signupSchema.safeParse({ ...base, password: "Password!" }).success).toBe(false);
  });

  it("missing a special character fails", () => {
    expect(signupSchema.safeParse({ ...base, password: "Password0" }).success).toBe(false);
  });
});

describe("changePasswordSchema - a WEAKER policy than signup, documented not fixed", () => {
  // Found: signupSchema requires uppercase + lowercase + digit + special
  // char. changePasswordSchema's equivalent special-character regex is
  // commented out in the source, so a new password meeting only the first
  // three requirements is accepted here even though it would have been
  // rejected at signup - an inconsistent, weaker policy for the "change my
  // password" flow specifically.
  it("new password with no special character - REJECTED at signup, ACCEPTED here", () => {
    const signupResult = signupSchema.safeParse({ user: "carlos", password: "Password0" });
    const changeResult = changePasswordSchema.safeParse({
      username: "carlos",
      currentPassword: "OldPassword0!",
      newPassword: "Password0",
    });

    expect(signupResult.success).toBe(false);
    expect(changeResult.success).toBe(true);
  });

  it("still requires uppercase/lowercase/digit", () => {
    expect(
      changePasswordSchema.safeParse({
        username: "carlos",
        currentPassword: "OldPassword0!",
        newPassword: "alllowercase0",
      }).success
    ).toBe(false);
  });
});

describe("changeUsernameSchema", () => {
  it("valid input passes", () => {
    expect(
      changeUsernameSchema.safeParse({
        currentUsername: "carlos",
        newUsername: "carlos2",
        currentPassword: "password123",
      }).success
    ).toBe(true);
  });

  it("new username shorter than 3 chars fails", () => {
    expect(
      changeUsernameSchema.safeParse({
        currentUsername: "carlos",
        newUsername: "ab",
        currentPassword: "password123",
      }).success
    ).toBe(false);
  });
});

describe("personalInfoSchema", () => {
  it("valid info passes", () => {
    expect(
      personalInfoSchema.safeParse({
        firstName: "Carlos",
        lastName: "Perez",
        email: "carlos@example.com",
        birthDate: "1995-06-01",
      }).success
    ).toBe(true);
  });

  it("invalid email fails", () => {
    expect(
      personalInfoSchema.safeParse({
        firstName: "Carlos",
        lastName: "Perez",
        email: "not-an-email",
        birthDate: "1995-06-01",
      }).success
    ).toBe(false);
  });

  it("unparsable birthDate string fails", () => {
    expect(
      personalInfoSchema.safeParse({
        firstName: "Carlos",
        lastName: "Perez",
        email: "carlos@example.com",
        birthDate: "not-a-date",
      }).success
    ).toBe(false);
  });

  it("urlPhoto is optional", () => {
    expect(
      personalInfoSchema.safeParse({
        firstName: "Carlos",
        lastName: "Perez",
        email: "carlos@example.com",
        birthDate: "1995-06-01",
      }).success
    ).toBe(true);
  });

  it("urlPhoto present but not a valid URL fails", () => {
    expect(
      personalInfoSchema.safeParse({
        firstName: "Carlos",
        lastName: "Perez",
        email: "carlos@example.com",
        birthDate: "1995-06-01",
        urlPhoto: "not-a-url",
      }).success
    ).toBe(false);
  });
});

describe("calculateAge", () => {
  it("birthday already happened this year", () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 20;
    // A birthday clearly in the past relative to today (Jan 1) - avoids
    // flakiness around the exact current date.
    const birthDate = `${birthYear}-01-01`;

    expect(calculateAge(birthDate)).toBe(20);
  });

  it("birthday has not happened yet this year - subtracts one more", () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 20;
    // A birthday clearly in the future relative to today (Dec 31) - the
    // exact "off by one" edge case this function's month/day comparison
    // exists to handle.
    const birthDate = `${birthYear}-12-31`;

    expect(calculateAge(birthDate)).toBe(19);
  });
});
