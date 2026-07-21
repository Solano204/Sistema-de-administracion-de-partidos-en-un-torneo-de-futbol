import { describe, it, expect } from "vitest";
import { userSchema, validatePersonalInfo } from "./UserSchema";

describe("userSchema - .partial() makes every field optional", () => {
  it("a completely empty object passes, since every field is optional", () => {
    expect(userSchema.safeParse({}).success).toBe(true);
  });

  it("a field that IS present still has its own validation enforced", () => {
    // .partial() only makes fields optional when absent - it does not
    // relax the constraint when a value IS supplied.
    expect(userSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(userSchema.safeParse({ age: 200 }).success).toBe(false);
  });
});

describe("validatePersonalInfo", () => {
  it("valid data returns an empty error object", () => {
    const errors = validatePersonalInfo({
      name: "Carlos",
      lastName: "Perez",
      email: "carlos@example.com",
      role: "ADMINISTRADOR",
      age: 30,
      birthDate: "1995-06-01",
    });

    expect(errors).toEqual({});
  });

  it("invalid email returns a field-keyed error, does not throw", () => {
    const errors = validatePersonalInfo({ email: "not-an-email" });

    expect(errors).toHaveProperty("email");
  });

  it("multiple invalid fields all get reported", () => {
    const errors = validatePersonalInfo({ name: "a", email: "bad", age: -5 });

    expect(errors).toHaveProperty("name");
    expect(errors).toHaveProperty("email");
    expect(errors).toHaveProperty("age");
  });
});
