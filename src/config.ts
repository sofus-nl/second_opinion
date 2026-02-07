export interface Config {
  openrouterApiKey: string;
  models: string[];
  timeout: number;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
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

  const rawTemp = process.env.SECOND_OPINION_TEMPERATURE;
  const parsedTemp = rawTemp ? parseFloat(rawTemp) : undefined;
  const defaultTemperature =
    parsedTemp !== undefined && !isNaN(parsedTemp) && parsedTemp >= 0 && parsedTemp <= 2
      ? parsedTemp
      : undefined;

  const rawMaxTokens = process.env.SECOND_OPINION_MAX_TOKENS;
  const parsedMaxTokens = rawMaxTokens ? parseInt(rawMaxTokens, 10) : undefined;
  const defaultMaxTokens =
    parsedMaxTokens !== undefined && !isNaN(parsedMaxTokens) && parsedMaxTokens > 0
      ? parsedMaxTokens
      : undefined;

  return { openrouterApiKey, models, timeout, defaultTemperature, defaultMaxTokens };
}
