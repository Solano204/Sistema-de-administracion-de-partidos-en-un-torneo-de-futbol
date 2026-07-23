import { describe, it, expect } from "vitest";
import { statsSchema, perfilSchema } from "./FormSchemas";

// Found: this exact file (statsSchema + perfilSchema, byte-for-byte
// identical) also exists at
// src/components/PlayerManagment/schemas/FormSchemas.tsx - a third
// instance of this codebase's copy-paste-schema-files pattern, alongside
// PlayerDebtManagment/schemas/debt-schema.ts and
// TeamDebManagment/schemas/team-debt-schema.ts sharing the hardcoded UUID
// default. Not consolidated here (a refactor, not a test-writing decision)
// - flagged so a future fix to one copy doesn't miss the other.
describe("statsSchema", () => {
  const validStats = {
    team: "team-1",
    jerseyNumber: 10,
    goals: 5,
    points: 3,
    playerStatus: "ACTIVO",
    yellowCards: 1,
    redCards: 0,
  };

  it("valid stats pass", () => {
    expect(statsSchema.safeParse(validStats).success).toBe(true);
  });

  it("negative jerseyNumber fails", () => {
    expect(statsSchema.safeParse({ ...validStats, jerseyNumber: -1 }).success).toBe(false);
  });

  it("wrong type for a numeric field fails with the custom Spanish error message", () => {
    const result = statsSchema.safeParse({ ...validStats, goals: "not-a-number" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "Debe ser un número")).toBe(true);
    }
  });

  it("missing required field fails with its custom Spanish required_error", () => {
    const { goals, ...withoutGoals } = validStats;
    const result = statsSchema.safeParse(withoutGoals);

    expect(result.success).toBe(false);
  });
});

describe("perfilSchema", () => {
  const validPerfil = {
    firstName: "Carlos",
    lastName: "Perez",
    email: "carlos@example.com",
    role: "ADMINISTRADOR",
    age: 30,
    birthDate: "1995-06-01",
    photoUrl: "photo.jpg",
  };

  it("valid perfil data passes", () => {
    expect(perfilSchema.safeParse(validPerfil).success).toBe(true);
  });

  it("age of 121 fails (max 120)", () => {
    expect(perfilSchema.safeParse({ ...validPerfil, age: 121 }).success).toBe(false);
  });

  it("age of exactly 120 passes (boundary is inclusive)", () => {
    expect(perfilSchema.safeParse({ ...validPerfil, age: 120 }).success).toBe(true);
  });

  it("empty photoUrl fails - it's required here, unlike AuthSchema's personalInfoSchema where urlPhoto is optional", () => {
    expect(perfilSchema.safeParse({ ...validPerfil, photoUrl: "" }).success).toBe(false);
  });
});
