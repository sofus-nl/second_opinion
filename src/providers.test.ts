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

    expect(results).toEqual([
      { model: "model-a", response: "answer" },
      { model: "model-b", response: "answer" },
    ]);
  });

  it("catches per-model errors without breaking other models", async () => {
    mockCreate
      .mockRejectedValueOnce(new Error("rate limited"))
      .mockResolvedValueOnce({
        choices: [{ message: { content: "ok" } }],
      });

    const results = await queryModels("test query", baseConfig, mockClient);

    expect(results).toEqual([
      { model: "model-a", error: "rate limited" },
      { model: "model-b", response: "ok" },
    ]);
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
      choices: [{ message: { content: "ok" } }],
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
      choices: [{ message: { content: "ok" } }],
    });

    await queryModels("test", baseConfig, mockClient);

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
