import { describe, it, expect } from "vitest";
import {
  UserRoleSchema,
  UserPasswordUpdateSchema,
  UserStatusSchema,
  UserRegisterSchema,
} from "./user-schemas";
import { UserRole, UserStatus } from "../types/types-user";

// CRITICAL frontend/backend contract mismatch, found here, not fixed:
// the backend's UserRole enum (soccer-domain-core/ValueObject/UserRole.java)
// has FIVE values: ADMINISTRADOR, ARBITRO, CAPITAN, JUGADOR, USER. This
// frontend's UserRole enum (types-user.tsx) only defines THREE:
// ADMINISTRADOR, ARBITRO, JUGADOR - CAPITAN and USER are entirely missing.
// UserRoleSchema = z.nativeEnum(UserRole) means any user record the backend
// returns with role "CAPITAN" or "USER" (both real, reachable roles - see
// UserController's public self-registration, which explicitly allows
// role=USER) FAILS this schema's validation. Any admin-dashboard form
// using this schema to validate a captain's or regular user's data would
// break. This is the single most consequential frontend finding after the
// getAuthUserAdmin vulnerability - flagged prominently, not silently fixed,
// since adding the missing enum values is a one-line change but should be
// a deliberate one given how many places import UserRole from this file.
describe("UserRoleSchema - frontend/backend enum mismatch", () => {
  it("ADMINISTRADOR, ARBITRO, JUGADOR are accepted (present in both frontend and backend)", () => {
    expect(UserRoleSchema.safeParse("ADMINISTRADOR").success).toBe(true);
    expect(UserRoleSchema.safeParse("ARBITRO").success).toBe(true);
    expect(UserRoleSchema.safeParse("JUGADOR").success).toBe(true);
  });

  it("CRITICAL: CAPITAN is a real backend role but is REJECTED by this frontend schema", () => {
    expect(UserRoleSchema.safeParse("CAPITAN").success).toBe(false);
  });

  it("CRITICAL: USER is a real backend role (used for public self-registration) but is REJECTED here", () => {
    expect(UserRoleSchema.safeParse("USER").success).toBe(false);
  });
});

describe("UserPasswordUpdateSchema", () => {
  it("newPassword and confirmPassword match, passes", () => {
    const result = UserPasswordUpdateSchema.safeParse({
      id: "user-1",
      newPassword: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("newPassword and confirmPassword do not match, fails on confirmPassword specifically", () => {
    const result = UserPasswordUpdateSchema.safeParse({
      id: "user-1",
      newPassword: "password123",
      confirmPassword: "different456",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });
});

describe("UserRegisterSchema", () => {
  const validBase = {
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
  };

  it("status omitted, defaults to ACTIVO", () => {
    const result = UserRegisterSchema.parse(validBase);

    expect(result.status).toBe(UserStatus.ACTIVO);
  });

  it("username shorter than 3 characters fails", () => {
    expect(UserRegisterSchema.safeParse({ ...validBase, user: "ab" }).success).toBe(false);
  });

  it("invalid birthDate format (not YYYY-MM-DD) fails", () => {
    expect(UserRegisterSchema.safeParse({ ...validBase, birthDate: "06/01/1995" }).success).toBe(false);
  });
});
