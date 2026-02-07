import OpenAI from "openai";
import type { Config } from "./config.js";

export interface ModelResult {
  model: string;
  response?: string;
  error?: string;
  latency_ms?: number;
}

export interface QueryOptions {
  context?: string;
  system_prompt?: string;
  models?: string[];
  max_tokens?: number;
  temperature?: number;
}

export function createClient(apiKey: string): OpenAI {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

export async function queryModels(
  query: string,
  config: Config,
  client: OpenAI,
  options?: QueryOptions
): Promise<ModelResult[]> {
  const models = options?.models ?? config.models;
  const temperature = options?.temperature ?? config.defaultTemperature;
  const max_tokens = options?.max_tokens ?? config.defaultMaxTokens;

  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (options?.system_prompt) {
    messages.push({ role: "system", content: options.system_prompt });
  }
  const userContent = options?.context
    ? `${options.context}\n\n---\n\n${query}`
    : query;
  messages.push({ role: "user", content: userContent });

  const requests = models.map(async (model): Promise<ModelResult> => {
    const start = Date.now();
    try {
      const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
        model,
        messages,
      };
      if (temperature !== undefined) params.temperature = temperature;
      if (max_tokens !== undefined) params.max_tokens = max_tokens;

      const completion = await client.chat.completions.create(params, {
        timeout: config.timeout,
      });
      let response = completion.choices[0]?.message?.content ?? "";
      const latency_ms = Date.now() - start;

      // Retry once if response is suspiciously short
      if (response.length < 5) {
        try {
          const retry = await client.chat.completions.create(params, {
            timeout: config.timeout,
          });
          response = retry.choices[0]?.message?.content ?? response;
        } catch {
          // keep the short response
        }
      }

      return { model, response, latency_ms };
    } catch (err) {
      const latency_ms = Date.now() - start;
      const message = err instanceof Error ? err.message : String(err);
      return { model, error: message, latency_ms };
    }
  });

  return Promise.all(requests);
}
