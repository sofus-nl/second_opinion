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

  it("parses SECOND_OPINION_TEMPERATURE as float", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_TEMPERATURE", "0.7");
    const config = getConfig();
    expect(config.defaultTemperature).toBe(0.7);
  });

  it("parses SECOND_OPINION_MAX_TOKENS as integer", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_MAX_TOKENS", "4096");
    const config = getConfig();
    expect(config.defaultMaxTokens).toBe(4096);
  });

  it("ignores invalid temperature (out of range)", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_TEMPERATURE", "5.0");
    const config = getConfig();
    expect(config.defaultTemperature).toBeUndefined();
  });

  it("ignores invalid temperature (NaN)", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_TEMPERATURE", "notanumber");
    const config = getConfig();
    expect(config.defaultTemperature).toBeUndefined();
  });

  it("ignores invalid max_tokens (zero)", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_MAX_TOKENS", "0");
    const config = getConfig();
    expect(config.defaultMaxTokens).toBeUndefined();
  });

  it("ignores invalid max_tokens (negative)", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    vi.stubEnv("SECOND_OPINION_MAX_TOKENS", "-10");
    const config = getConfig();
    expect(config.defaultMaxTokens).toBeUndefined();
  });

  it("returns undefined for temperature and max_tokens when not set", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test-123");
    const config = getConfig();
    expect(config.defaultTemperature).toBeUndefined();
    expect(config.defaultMaxTokens).toBeUndefined();
  });
});
