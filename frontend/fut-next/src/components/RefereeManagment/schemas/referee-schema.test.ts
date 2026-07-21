import { describe, it, expect } from "vitest";
import { RefereeRegisterSchema, RefereePhotoSchema, RefereeStatusSchema } from "./referee-schema";
import { UserRole, UserStatus } from "../types/referee-types";

// Found: RefereePhotoSchema/RefereeStatusSchema require id to be a valid
// UUID format (z.string().uuid()), but the structurally equivalent
// UserManagment schemas (UserPhotoSchema/UserStatusUpdateSchema) only
// require id to be a non-empty string, no UUID format check at all - an
// inconsistency between two otherwise near-identical schema families for
// the same underlying User entity (a referee IS a User with role ARBITRO).
describe("RefereePhotoSchema - requires an actual UUID, unlike UserPhotoSchema", () => {
  it("valid UUID passes", () => {
    expect(RefereePhotoSchema.safeParse({ id: "123e4567-e89b-12d3-a456-426614174000", profilePhoto: "photo.jpg" }).success).toBe(true);
  });

  it("non-UUID string id fails here, though it would pass UserPhotoSchema's plain string check", () => {
    expect(RefereePhotoSchema.safeParse({ id: "not-a-uuid", profilePhoto: "photo.jpg" }).success).toBe(false);
  });
});

describe("RefereeStatusSchema", () => {
  it("valid UUID and status pass", () => {
    expect(
      RefereeStatusSchema.safeParse({ id: "123e4567-e89b-12d3-a456-426614174000", status: UserStatus.ACTIVO }).success
    ).toBe(true);
  });

  it("non-UUID id fails", () => {
    expect(RefereeStatusSchema.safeParse({ id: "referee-1", status: UserStatus.ACTIVO }).success).toBe(false);
  });
});

describe("RefereeRegisterSchema", () => {
  const validBase = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    firstName: "Ana",
    lastName: "Gomez",
    email: "ana@example.com",
    birthDate: "1990-01-01",
    age: 35,
    role: UserRole.ARBITRO,
    user: "ana",
    password: "password123",
    urlPhoto: "photo.jpg",
  };

  it("status omitted, defaults to ACTIVO", () => {
    const result = RefereeRegisterSchema.parse(validBase);

    expect(result.status).toBe(UserStatus.ACTIVO);
  });

  it("id here is a plain string (not required to be a UUID), unlike RefereePhotoSchema/RefereeStatusSchema", () => {
    // Another cross-schema inconsistency: the common id field is
    // z.string() in RefereeCommonSchema (which RefereeRegisterSchema
    // extends) but z.string().uuid() in the two schemas above.
    expect(RefereeRegisterSchema.safeParse({ ...validBase, id: "not-a-uuid" }).success).toBe(true);
  });

  it("malformed birthDate fails", () => {
    expect(RefereeRegisterSchema.safeParse({ ...validBase, birthDate: "01/01/1990" }).success).toBe(false);
  });
});
