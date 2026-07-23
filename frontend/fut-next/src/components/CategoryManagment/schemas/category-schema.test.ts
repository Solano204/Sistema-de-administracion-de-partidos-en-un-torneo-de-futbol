import { describe, it, expect } from "vitest";
import { AgeRangeSchema, CategoryBaseSchema, CategoryEditSchema } from "./category-schema";

describe("AgeRangeSchema", () => {
  it("minAge less than or equal to maxAge passes", () => {
    expect(AgeRangeSchema.safeParse({ minAge: 10, maxAge: 17 }).success).toBe(true);
    expect(AgeRangeSchema.safeParse({ minAge: 10, maxAge: 10 }).success).toBe(true); // equal is allowed
  });

  it("minAge greater than maxAge fails the cross-field refine", () => {
    const result = AgeRangeSchema.safeParse({ minAge: 18, maxAge: 15 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["minAge"]);
    }
  });

  it("negative minAge fails before the refine even runs", () => {
    expect(AgeRangeSchema.safeParse({ minAge: -1, maxAge: 10 }).success).toBe(false);
  });

  it("non-numeric minAge (NaN) is rejected before the transform ever runs", () => {
    // z.number() has its own dedicated NaN check that runs before .min()/.transform()
    // ever see the value, so AgeRangeSchema's .transform(val => isNaN(val) ? 0 : val) is
    // actually dead code for this input - Zod rejects it outright instead of coercing it.
    const result = AgeRangeSchema.safeParse({ minAge: NaN, maxAge: 10 });

    expect(result.success).toBe(false);
  });
});

describe("CategoryBaseSchema", () => {
  const validCategory = {
    name: "Sub-17",
    imageUrl: "https://example.com/logo.png",
    ageRange: { minAge: 15, maxAge: 17 },
  };

  it("valid category passes", () => {
    expect(CategoryBaseSchema.safeParse(validCategory).success).toBe(true);
  });

  it("name over 100 characters fails", () => {
    expect(
      CategoryBaseSchema.safeParse({ ...validCategory, name: "a".repeat(101) }).success
    ).toBe(false);
  });

  it("empty imageUrl fails (no actual URL format check, just non-empty)", () => {
    expect(CategoryBaseSchema.safeParse({ ...validCategory, imageUrl: "" }).success).toBe(false);
  });

  it("nested ageRange violation propagates up as a failure", () => {
    expect(
      CategoryBaseSchema.safeParse({ ...validCategory, ageRange: { minAge: 20, maxAge: 10 } }).success
    ).toBe(false);
  });
});

describe("CategoryEditSchema", () => {
  it("requires an id, unlike CategoryCreateSchema", () => {
    const result = CategoryEditSchema.safeParse({
      name: "Sub-17",
      imageUrl: "logo.png",
      ageRange: { minAge: 15, maxAge: 17 },
      // id intentionally omitted
    });

    expect(result.success).toBe(false);
  });
});
