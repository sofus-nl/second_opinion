#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getConfig } from "./config.js";
import { createClient, queryModels } from "./providers.js";
import type { ModelResult, QueryOptions } from "./providers.js";
import { formatResults, buildStructuredSummary } from "./formatter.js";
import {
  REVIEW_CODE_PROMPTS,
  COMPARE_APPROACHES_PROMPT,
  FACT_CHECK_PROMPT,
} from "./prompts.js";

function buildToolResponse(results: ModelResult[]) {
  const markdown = formatResults(results);
  const summary = buildStructuredSummary(results);
  return {
    content: [
      { type: "text" as const, text: markdown },
      {
        type: "text" as const,
        text: JSON.stringify(summary),
        annotations: { audience: ["assistant" as const] },
      },
    ],
  };
}

async function main() {
  const config = getConfig();
  const client = createClient(config.openrouterApiKey);

  const server = new McpServer(
    {
      name: "second-opinion",
      version: "0.3.0",
    },
    {
      instructions: [
        "This server provides multiple AI perspectives via OpenRouter. Available tools:",
        "",
        "- get_second_opinion: General-purpose multi-model query. Supports context, system prompts, model/temperature/max_tokens overrides.",
        "- review_code: Specialized code review with focus areas (security, performance, style, bugs).",
        "- compare_approaches: Compare 2+ technical approaches with pros/cons and a recommendation.",
        "- fact_check: Verify a claim across models, prioritizing search-augmented models.",
        "- list_models: Show currently configured model list.",
        "",
        "Resource: second-opinion://config — read server configuration (models, timeout, defaults).",
        "",
        "Present each model's response as-is. The structured JSON summary (audience: assistant) contains latency and success/error counts for your internal use.",
      ].join("\n"),
    }
  );

  // --- get_second_opinion (updated) ---
  server.tool(
    "get_second_opinion",
    "Query multiple AI models in parallel via OpenRouter and return their responses. Supports optional context, system prompts, model overrides, and temperature/max_tokens control. Returns Markdown with ### model-name headers separated by --- dividers, plus a JSON structured summary for the assistant.",
    {
      query: z.string().describe("The question or prompt to send to all models"),
      context: z.string().optional().describe("Additional context prepended to the query (e.g. code, document, conversation history)"),
      system_prompt: z.string().optional().describe("System prompt sent to all models"),
      models: z.array(z.string()).optional().describe("Override configured models for this request"),
      max_tokens: z.number().int().positive().optional().describe("Max response tokens per model"),
      temperature: z.number().min(0).max(2).optional().describe("Sampling temperature (0-2)"),
    },
    async ({ query, context, system_prompt, models, max_tokens, temperature }) => {
      const options: QueryOptions = { context, system_prompt, models, max_tokens, temperature };
      const results = await queryModels(query, config, client, options);
      return buildToolResponse(results);
    }
  );

  // --- list_models ---
  server.tool(
    "list_models",
    "Return the list of AI models currently configured for second-opinion queries.",
    {},
    async () => ({
      content: [{ type: "text" as const, text: JSON.stringify(config.models) }],
    })
  );

  // --- review_code ---
  server.tool(
    "review_code",
    "Send code to multiple AI models for review with a specific focus area (security, performance, style, or bugs). Each model returns targeted feedback.",
    {
      code: z.string().describe("The code to review"),
      language: z.string().optional().describe("Programming language (e.g. typescript, python)"),
      focus: z.enum(["security", "performance", "style", "bugs"]).describe("Review focus area"),
      models: z.array(z.string()).optional().describe("Override configured models for this request"),
      max_tokens: z.number().int().positive().optional().describe("Max response tokens per model"),
    },
    async ({ code, language, focus, models, max_tokens }) => {
      const langTag = language ?? "";
      const query = `Review the following code:\n\n\`\`\`${langTag}\n${code}\n\`\`\``;
      const options: QueryOptions = {
        system_prompt: REVIEW_CODE_PROMPTS[focus],
        models,
        max_tokens,
      };
      const results = await queryModels(query, config, client, options);
      return buildToolResponse(results);
    }
  );

  // --- compare_approaches ---
  server.tool(
    "compare_approaches",
    "Compare two or more technical approaches by sending them to multiple AI models for analysis. Each model provides pros, cons, and a recommendation.",
    {
      question: z.string().describe("The decision or problem to evaluate"),
      approaches: z.array(z.string()).min(2).describe("The approaches to compare (minimum 2)"),
      models: z.array(z.string()).optional().describe("Override configured models for this request"),
    },
    async ({ question, approaches, models }) => {
      const numbered = approaches.map((a, i) => `${i + 1}. ${a}`).join("\n");
      const query = `${question}\n\nApproaches:\n${numbered}`;
      const options: QueryOptions = {
        system_prompt: COMPARE_APPROACHES_PROMPT,
        models,
      };
      const results = await queryModels(query, config, client, options);
      return buildToolResponse(results);
    }
  );

  // --- fact_check ---
  server.tool(
    "fact_check",
    "Fact-check a claim by sending it to multiple AI models. Prioritizes search-augmented models (e.g. Perplexity) when available.",
    {
      claim: z.string().describe("The claim to fact-check"),
      models: z.array(z.string()).optional().describe("Override configured models for this request"),
    },
    async ({ claim, models: modelOverride }) => {
      // Reorder to put search-augmented (Perplexity) models first
      const modelsToUse = modelOverride ?? [...config.models];
      modelsToUse.sort((a, b) => {
        const aSearch = a.toLowerCase().includes("perplexity") ? 0 : 1;
        const bSearch = b.toLowerCase().includes("perplexity") ? 0 : 1;
        return aSearch - bSearch;
      });

      const query = `Fact-check the following claim:\n\n"${claim}"`;
      const options: QueryOptions = {
        system_prompt: FACT_CHECK_PROMPT,
        models: modelsToUse,
      };
      const results = await queryModels(query, config, client, options);
      return buildToolResponse(results);
    }
  );

  // --- server_config resource ---
  server.resource(
    "server_config",
    "second-opinion://config",
    async () => ({
      contents: [
        {
          uri: "second-opinion://config",
          mimeType: "application/json",
          text: JSON.stringify({
            models: config.models,
            timeout: config.timeout,
            defaultTemperature: config.defaultTemperature ?? null,
            defaultMaxTokens: config.defaultMaxTokens ?? null,
          }),
        },
      ],
    })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
