import { describe, it, expect } from "vitest";
import { formatResults } from "./formatter.js";
import type { ModelResult } from "./providers.js";

describe("formatResults", () => {
  it("formats a single successful result", () => {
    const results: ModelResult[] = [
      { model: "openai/gpt-4o", response: "Use a hash map." },
    ];
    expect(formatResults(results)).toBe(
      "### openai/gpt-4o\n\nUse a hash map."
    );
  });

  it("formats a single error result with blockquote", () => {
    const results: ModelResult[] = [
      { model: "openai/gpt-4o", error: "timeout" },
    ];
    expect(formatResults(results)).toBe(
      "### openai/gpt-4o\n\n> Error: timeout"
    );
  });

  it("separates multiple results with ---", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "Answer A" },
      { model: "model-b", response: "Answer B" },
    ];
    expect(formatResults(results)).toBe(
      "### model-a\n\nAnswer A\n\n---\n\n### model-b\n\nAnswer B"
    );
  });

  it("handles mixed success and error results", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "OK" },
      { model: "model-b", error: "rate limited" },
    ];
    const output = formatResults(results);
    expect(output).toContain("### model-a\n\nOK");
    expect(output).toContain("### model-b\n\n> Error: rate limited");
    expect(output).toContain("---");
  });

  it("returns empty string for empty results array", () => {
    expect(formatResults([])).toBe("");
  });

  it("treats missing response as empty body", () => {
    const results: ModelResult[] = [{ model: "model-a" }];
    expect(formatResults(results)).toBe("### model-a\n\n");
  });
});
