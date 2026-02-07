import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryModels } from "./providers.js";
import type { Config } from "./config.js";
import type OpenAI from "openai";

const mockCreate = vi.fn();

const mockClient = {
  chat: { completions: { create: mockCreate } },
} as unknown as OpenAI;

const baseConfig: Config = {
  openrouterApiKey: "sk-test",
  models: ["model-a", "model-b"],
  timeout: 5000,
};

describe("queryModels", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns successful responses for each model", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "answer" } }],
    });

    const results = await queryModels("test query", baseConfig, mockClient);

    expect(results).toHaveLength(2);
    expect(results[0].model).toBe("model-a");
    expect(results[0].response).toBe("answer");
    expect(results[1].model).toBe("model-b");
    expect(results[1].response).toBe("answer");
  });

  it("catches per-model errors without breaking other models", async () => {
    mockCreate
      .mockRejectedValueOnce(new Error("rate limited"))
      .mockResolvedValueOnce({
        choices: [{ message: { content: "ok response" } }],
      });

    const results = await queryModels("test query", baseConfig, mockClient);

    expect(results[0].error).toBe("rate limited");
    expect(results[1].response).toBe("ok response");
  });

  it("handles empty response content gracefully", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const results = await queryModels("test query", baseConfig, mockClient);

    expect(results[0].response).toBe("");
    expect(results[0].error).toBeUndefined();
  });

  it("handles missing choices gracefully", async () => {
    mockCreate.mockResolvedValue({ choices: [] });

    const results = await queryModels("test query", baseConfig, mockClient);

    expect(results[0].response).toBe("");
  });

  it("passes query and model to the API client", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "ok response" } }],
    });

    await queryModels("explain recursion", {
      ...baseConfig,
      models: ["model-a"],
    }, mockClient);

    expect(mockCreate).toHaveBeenCalledWith(
      { model: "model-a", messages: [{ role: "user", content: "explain recursion" }] },
      { timeout: 5000 }
    );
  });

  it("queries all models in parallel", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "a]sufficient response" } }],
    });

    await queryModels("test", baseConfig, mockClient);

    // 2 models, no retries (response >= 5 chars)
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("sends system_prompt as system message", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "reviewed" } }],
    });

    await queryModels("check this", { ...baseConfig, models: ["model-a"] }, mockClient, {
      system_prompt: "You are a reviewer.",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      {
        model: "model-a",
        messages: [
          { role: "system", content: "You are a reviewer." },
          { role: "user", content: "check this" },
        ],
      },
      { timeout: 5000 }
    );
  });

  it("prepends context to user message", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "ok response" } }],
    });

    await queryModels("what does this do?", { ...baseConfig, models: ["model-a"] }, mockClient, {
      context: "function foo() { return 42; }",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      {
        model: "model-a",
        messages: [
          { role: "user", content: "function foo() { return 42; }\n\n---\n\nwhat does this do?" },
        ],
      },
      { timeout: 5000 }
    );
  });

  it("uses options.models over config.models", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "ok response" } }],
    });

    const results = await queryModels("test", baseConfig, mockClient, {
      models: ["custom-model"],
    });

    expect(results).toHaveLength(1);
    expect(results[0].model).toBe("custom-model");
  });

  it("passes temperature and max_tokens to API", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "ok response" } }],
    });

    await queryModels("test", { ...baseConfig, models: ["model-a"] }, mockClient, {
      temperature: 0.5,
      max_tokens: 1000,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      {
        model: "model-a",
        messages: [{ role: "user", content: "test" }],
        temperature: 0.5,
        max_tokens: 1000,
      },
      { timeout: 5000 }
    );
  });

  it("falls back to config defaults for temperature and max_tokens", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "ok response" } }],
    });

    await queryModels("test", {
      ...baseConfig,
      models: ["model-a"],
      defaultTemperature: 0.3,
      defaultMaxTokens: 2048,
    }, mockClient);

    expect(mockCreate).toHaveBeenCalledWith(
      {
        model: "model-a",
        messages: [{ role: "user", content: "test" }],
        temperature: 0.3,
        max_tokens: 2048,
      },
      { timeout: 5000 }
    );
  });

  it("tracks latency_ms on successful responses", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "ok response" } }],
    });

    const results = await queryModels("test", { ...baseConfig, models: ["model-a"] }, mockClient);

    expect(results[0].latency_ms).toBeTypeOf("number");
    expect(results[0].latency_ms).toBeGreaterThanOrEqual(0);
  });

  it("tracks latency_ms on error responses", async () => {
    mockCreate.mockRejectedValue(new Error("fail"));

    const results = await queryModels("test", { ...baseConfig, models: ["model-a"] }, mockClient);

    expect(results[0].latency_ms).toBeTypeOf("number");
    expect(results[0].error).toBe("fail");
  });

  it("retries once when response is very short", async () => {
    mockCreate
      .mockResolvedValueOnce({ choices: [{ message: { content: "ok" } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: "Full detailed response here" } }] });

    const results = await queryModels("test", { ...baseConfig, models: ["model-a"] }, mockClient);

    // Should have called twice for the single model (initial + retry)
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(results[0].response).toBe("Full detailed response here");
  });

  it("keeps short response when retry also fails", async () => {
    mockCreate
      .mockResolvedValueOnce({ choices: [{ message: { content: "ok" } }] })
      .mockRejectedValueOnce(new Error("retry failed"));

    const results = await queryModels("test", { ...baseConfig, models: ["model-a"] }, mockClient);

    expect(results[0].response).toBe("ok");
  });
});
