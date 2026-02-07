import OpenAI from "openai";
import type { Config } from "./config.js";

export interface ModelResult {
  model: string;
  response?: string;
  error?: string;
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
  client: OpenAI
): Promise<ModelResult[]> {
  const requests = config.models.map(async (model): Promise<ModelResult> => {
    try {
      const completion = await client.chat.completions.create(
        {
          model,
          messages: [{ role: "user", content: query }],
        },
        { timeout: config.timeout }
      );
      const response = completion.choices[0]?.message?.content ?? "";
      return { model, response };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { model, error: message };
    }
  });

  return Promise.all(requests);
}
