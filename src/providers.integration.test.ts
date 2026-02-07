import { describe, it, expect } from "vitest";
import { createClient, queryModels } from "./providers.js";
import { getConfig } from "./config.js";
import { formatResults } from "./formatter.js";
import { config as dotenv } from "dotenv";

dotenv();

const canRun = !!process.env.OPENROUTER_API_KEY;

describe.skipIf(!canRun)("providers (integration)", () => {
  it("queries OpenRouter and returns formatted responses", async () => {
    const config = getConfig();
    const client = createClient(config.openrouterApiKey);
    const results = await queryModels("Reply with just the word 'pong'.", config, client, {
      temperature: 0,
    });

    expect(results.length).toBe(config.models.length);

    for (const result of results) {
      expect(result.model).toBeTruthy();
      expect(result.latency_ms).toBeTypeOf("number");
      expect(result.latency_ms).toBeGreaterThan(0);
      if (result.error) {
        console.warn(`${result.model} errored: ${result.error}`);
      } else {
        expect(result.response).toBeTruthy();
      }
    }

    const formatted = formatResults(results);
    expect(formatted).toContain("###");

    const successful = results.filter((r) => !r.error);
    expect(successful.length).toBeGreaterThan(0);
  }, 60_000);
});
