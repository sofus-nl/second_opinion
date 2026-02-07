export interface Config {
  openrouterApiKey: string;
  models: string[];
  timeout: number;
}

const DEFAULT_MODELS = [
  "openai/gpt-5.2",
  "google/gemini-3-pro-preview",
  "x-ai/grok-4.1-fast",
  "perplexity/sonar-reasoning-pro",
];

const DEFAULT_TIMEOUT = 30_000;

export function getConfig(): Config {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is required. Get one at https://openrouter.ai/keys"
    );
  }

  const models = process.env.SECOND_OPINION_MODELS
    ? process.env.SECOND_OPINION_MODELS.split(",").map((m) => m.trim())
    : DEFAULT_MODELS;

  const timeout = process.env.SECOND_OPINION_TIMEOUT
    ? parseInt(process.env.SECOND_OPINION_TIMEOUT, 10)
    : DEFAULT_TIMEOUT;

  return { openrouterApiKey, models, timeout };
}
