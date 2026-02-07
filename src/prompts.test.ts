import { describe, it, expect } from "vitest";
import {
  REVIEW_CODE_PROMPTS,
  COMPARE_APPROACHES_PROMPT,
  FACT_CHECK_PROMPT,
} from "./prompts.js";

describe("prompts", () => {
  it("has all REVIEW_CODE_PROMPTS focus areas", () => {
    expect(Object.keys(REVIEW_CODE_PROMPTS)).toEqual(
      expect.arrayContaining(["security", "performance", "style", "bugs"])
    );
  });

  it("all REVIEW_CODE_PROMPTS values are non-empty strings", () => {
    for (const [key, value] of Object.entries(REVIEW_CODE_PROMPTS)) {
      expect(value, `REVIEW_CODE_PROMPTS["${key}"]`).toBeTypeOf("string");
      expect(value.length, `REVIEW_CODE_PROMPTS["${key}"] length`).toBeGreaterThan(0);
    }
  });

  it("COMPARE_APPROACHES_PROMPT is a non-empty string", () => {
    expect(COMPARE_APPROACHES_PROMPT).toBeTypeOf("string");
    expect(COMPARE_APPROACHES_PROMPT.length).toBeGreaterThan(0);
  });

  it("FACT_CHECK_PROMPT is a non-empty string", () => {
    expect(FACT_CHECK_PROMPT).toBeTypeOf("string");
    expect(FACT_CHECK_PROMPT.length).toBeGreaterThan(0);
  });
});
