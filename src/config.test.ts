import { describe, it, expect, vi, beforeEach } from "vitest";
import { getConfig } from "./config.js";

describe("getConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when OPENROUTER_API_KEY is missing", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    expect(() => getConfig()).toThrow("OPENROUTER_API_KEY");
  });

  it("returns config with defaults when only API key is set", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    const config = getConfig();
    expect(config.openrouterApiKey).toBe("sk-test-123");
    expect(config.models).toEqual([
      "openai/gpt-5.2",
      "google/gemini-3-pro-preview",
      "x-ai/grok-4.1-fast",
      "perplexity/sonar-reasoning-pro",
    ]);
    expect(config.timeout).toBe(30_000);
  });

  it("overrides models from SECOND_OPINION_MODELS", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_MODELS", "model-a,model-b");
    const config = getConfig();
    expect(config.models).toEqual(["model-a", "model-b"]);
  });

  it("trims whitespace around model names", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_MODELS", " model-a , model-b ");
    const config = getConfig();
    expect(config.models).toEqual(["model-a", "model-b"]);
  });

  it("overrides timeout from SECOND_OPINION_TIMEOUT", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_TIMEOUT", "60000");
    const config = getConfig();
    expect(config.timeout).toBe(60_000);
  });
});
