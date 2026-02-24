import { describe, it, expect } from "vitest";
import { formatResults, buildStructuredSummary } from "./formatter.js";
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

describe("buildStructuredSummary", () => {
  it("summarizes all-success results", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "Hello world", latency_ms: 100, prompt_tokens: 10, completion_tokens: 20 },
      { model: "model-b", response: "Hi there", latency_ms: 200, prompt_tokens: 10, completion_tokens: 15 },
    ];
    const summary = buildStructuredSummary(results);
    expect(summary.model_count).toBe(2);
    expect(summary.success_count).toBe(2);
    expect(summary.error_count).toBe(0);
    expect(summary.avg_latency_ms).toBe(150);
    expect(summary.models[0]).toEqual({
      model: "model-a",
      status: "success",
      latency_ms: 100,
      response_length: 11,
      prompt_tokens: 10,
      completion_tokens: 20,
    });
  });

  it("summarizes mixed results", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "OK", latency_ms: 50 },
      { model: "model-b", error: "timeout", latency_ms: 5000 },
    ];
    const summary = buildStructuredSummary(results);
    expect(summary.success_count).toBe(1);
    expect(summary.error_count).toBe(1);
    expect(summary.avg_latency_ms).toBe(2525);
    expect(summary.models[1].status).toBe("error");
    expect(summary.models[1].response_length).toBe(0);
  });

  it("handles results with no latency data", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "OK" },
    ];
    const summary = buildStructuredSummary(results);
    expect(summary.avg_latency_ms).toBeNull();
    expect(summary.models[0].latency_ms).toBeNull();
  });

  it("includes per-model token counts (null when missing)", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "OK", prompt_tokens: 50, completion_tokens: 100 },
      { model: "model-b", response: "Hi" },
    ];
    const summary = buildStructuredSummary(results);
    expect(summary.models[0].prompt_tokens).toBe(50);
    expect(summary.models[0].completion_tokens).toBe(100);
    expect(summary.models[1].prompt_tokens).toBeNull();
    expect(summary.models[1].completion_tokens).toBeNull();
  });

  it("calculates total token counts across all models", () => {
    const results: ModelResult[] = [
      { model: "model-a", response: "OK", prompt_tokens: 30, completion_tokens: 80 },
      { model: "model-b", response: "Hi", prompt_tokens: 30, completion_tokens: 120 },
      { model: "model-c", response: "Hey" },
    ];
    const summary = buildStructuredSummary(results);
    expect(summary.total_prompt_tokens).toBe(60);
    expect(summary.total_completion_tokens).toBe(200);
  });
});
