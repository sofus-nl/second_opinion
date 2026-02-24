export interface ModelInfo {
  id: string;
  name: string;
  context_length: number;
  max_completion_tokens: number | null;
  modality: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  top_provider?: { max_completion_tokens?: number | null };
  architecture?: { modality?: string };
}

export async function fetchModelInfo(apiKey: string): Promise<Map<string, ModelInfo>> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`OpenRouter /models returned ${res.status}`);
  }
  const json = (await res.json()) as { data: OpenRouterModel[] };
  const map = new Map<string, ModelInfo>();
  for (const m of json.data) {
    map.set(m.id, {
      id: m.id,
      name: m.name,
      context_length: m.context_length,
      max_completion_tokens: m.top_provider?.max_completion_tokens ?? null,
      modality: m.architecture?.modality ?? "unknown",
      input_cost_per_token: parseFloat(m.pricing.prompt) || 0,
      output_cost_per_token: parseFloat(m.pricing.completion) || 0,
    });
  }
  return map;
}

export function getModelInfo(cache: Map<string, ModelInfo>, modelIds: string[]): ModelInfo[] {
  return modelIds.map((id) =>
    cache.get(id) ?? {
      id,
      name: id,
      context_length: 0,
      max_completion_tokens: null,
      modality: "unknown",
      input_cost_per_token: 0,
      output_cost_per_token: 0,
    }
  );
}
