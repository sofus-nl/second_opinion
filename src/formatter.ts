import type { ModelResult } from "./providers.js";

export interface StructuredSummary {
  model_count: number;
  success_count: number;
  error_count: number;
  avg_latency_ms: number | null;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  models: {
    model: string;
    status: "success" | "error";
    latency_ms: number | null;
    response_length: number;
    prompt_tokens: number | null;
    completion_tokens: number | null;
  }[];
}

export function buildStructuredSummary(results: ModelResult[]): StructuredSummary {
  const models = results.map((r) => ({
    model: r.model,
    status: (r.error ? "error" : "success") as "success" | "error",
    latency_ms: r.latency_ms ?? null,
    response_length: r.error ? 0 : (r.response?.length ?? 0),
    prompt_tokens: r.prompt_tokens ?? null,
    completion_tokens: r.completion_tokens ?? null,
  }));

  const latencies = results
    .map((r) => r.latency_ms)
    .filter((ms): ms is number => ms !== undefined);
  const avg_latency_ms =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : null;

  const total_prompt_tokens = results.reduce((sum, r) => sum + (r.prompt_tokens ?? 0), 0);
  const total_completion_tokens = results.reduce((sum, r) => sum + (r.completion_tokens ?? 0), 0);

  return {
    model_count: results.length,
    success_count: results.filter((r) => !r.error).length,
    error_count: results.filter((r) => !!r.error).length,
    avg_latency_ms,
    total_prompt_tokens,
    total_completion_tokens,
    models,
  };
}

export function formatResults(results: ModelResult[]): string {
  return results
    .map((r) => {
      const header = `### ${r.model}`;
      const body = r.error ? `> Error: ${r.error}` : r.response ?? "";
      return `${header}\n\n${body}`;
    })
    .join("\n\n---\n\n");
}
