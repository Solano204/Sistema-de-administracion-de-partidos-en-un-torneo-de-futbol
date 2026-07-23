import { describe, it, expect } from "vitest";
import { teamDataSchema, validateTeamData } from "./validation";

const validTeam = {
  name: "Los Tigres",
  numMembers: 11,
  goals: 20,
  goalsReceived: 5,
  points: 25,
  matches: 10,
  matchesWon: 8,
  matchesDrawn: 1,
  matchesLost: 1,
  qualified: true,
};

describe("teamDataSchema", () => {
  it("valid team data passes", () => {
    expect(teamDataSchema.safeParse(validTeam).success).toBe(true);
  });

  it("numMembers over 50 fails", () => {
    expect(teamDataSchema.safeParse({ ...validTeam, numMembers: 51 }).success).toBe(false);
  });

  it("numMembers of 0 fails - a team needs at least 1 member", () => {
    expect(teamDataSchema.safeParse({ ...validTeam, numMembers: 0 }).success).toBe(false);
  });

  it("negative goals fails", () => {
    expect(teamDataSchema.safeParse({ ...validTeam, goals: -1 }).success).toBe(false);
  });
});

describe("validateTeamData - the try/catch-to-error-map wrapper", () => {
  it("valid data returns an empty error object", () => {
    expect(validateTeamData(validTeam)).toEqual({});
  });

  it("invalid data returns a field-to-message map, not a thrown exception", () => {
    const errors = validateTeamData({ ...validTeam, numMembers: 0, goals: -5 });

    expect(errors).toHaveProperty("numMembers");
    expect(errors).toHaveProperty("goals");
  });

  it("completely malformed input (wrong types) is caught and reported, not thrown", () => {
    expect(() => validateTeamData({ name: 123, qualified: "yes" })).not.toThrow();
  });
});
