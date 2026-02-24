import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchModelInfo, getModelInfo } from "./model-info.js";
import type { ModelInfo } from "./model-info.js";

const mockResponse = {
  data: [
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      context_length: 128000,
      pricing: { prompt: "0.0000025", completion: "0.00001" },
      top_provider: { max_completion_tokens: 16384 },
      architecture: { modality: "text+image->text" },
    },
    {
      id: "google/gemini-pro",
      name: "Gemini Pro",
      context_length: 32000,
      pricing: { prompt: "0.000001", completion: "0.000002" },
      top_provider: { max_completion_tokens: null },
      architecture: { modality: "text->text" },
    },
  ],
};

describe("fetchModelInfo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses API response into Map keyed by model ID", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const map = await fetchModelInfo("sk-test");
    expect(map.size).toBe(2);
    expect(map.has("openai/gpt-4o")).toBe(true);
    expect(map.has("google/gemini-pro")).toBe(true);
  });

  it("parses pricing strings to numbers", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const map = await fetchModelInfo("sk-test");
    const gpt = map.get("openai/gpt-4o")!;
    expect(gpt.input_cost_per_token).toBe(0.0000025);
    expect(gpt.output_cost_per_token).toBe(0.00001);
  });

  it("extracts context_length, max_completion_tokens, and modality", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const map = await fetchModelInfo("sk-test");
    const gpt = map.get("openai/gpt-4o")!;
    expect(gpt.context_length).toBe(128000);
    expect(gpt.max_completion_tokens).toBe(16384);
    expect(gpt.modality).toBe("text+image->text");

    const gemini = map.get("google/gemini-pro")!;
    expect(gemini.max_completion_tokens).toBeNull();
  });

  it("handles missing top_provider and architecture gracefully", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "test/model",
            name: "Test",
            context_length: 4096,
            pricing: { prompt: "0", completion: "0" },
          },
        ],
      }),
    });

    const map = await fetchModelInfo("sk-test");
    const model = map.get("test/model")!;
    expect(model.max_completion_tokens).toBeNull();
    expect(model.modality).toBe("unknown");
  });

  it("throws on non-OK response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(fetchModelInfo("bad-key")).rejects.toThrow("OpenRouter /models returned 401");
  });

  it("sends Authorization header", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await fetchModelInfo("sk-my-key");
    expect(fetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: "Bearer sk-my-key" },
    });
  });
});

describe("getModelInfo", () => {
  const cache = new Map<string, ModelInfo>([
    [
      "openai/gpt-4o",
      {
        id: "openai/gpt-4o",
        name: "GPT-4o",
        context_length: 128000,
        max_completion_tokens: 16384,
        modality: "text+image->text",
        input_cost_per_token: 0.0000025,
        output_cost_per_token: 0.00001,
      },
    ],
  ]);

  it("returns info for known models", () => {
    const result = getModelInfo(cache, ["openai/gpt-4o"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("GPT-4o");
    expect(result[0].context_length).toBe(128000);
  });

  it("returns fallback entry for unknown models", () => {
    const result = getModelInfo(cache, ["unknown/model"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("unknown/model");
    expect(result[0].name).toBe("unknown/model");
    expect(result[0].context_length).toBe(0);
    expect(result[0].modality).toBe("unknown");
  });

  it("handles mix of known and unknown models", () => {
    const result = getModelInfo(cache, ["openai/gpt-4o", "unknown/model"]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("GPT-4o");
    expect(result[1].name).toBe("unknown/model");
  });
});
