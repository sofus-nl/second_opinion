#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getConfig } from "./config.js";
import { createClient, queryModels } from "./providers.js";
import { formatResults } from "./formatter.js";

async function main() {
  const config = getConfig();
  const client = createClient(config.openrouterApiKey);

  const server = new McpServer(
    {
      name: "second-opinion",
      version: "0.1.0",
    },
    {
      instructions: [
        "Use the get_second_opinion tool when you or the user want alternative perspectives from other AI models on any topic.",
        "Present each model's response to the user as-is — do not summarize or merge them.",
        "The response is pre-formatted Markdown with ### model-name headers separated by --- dividers.",
        "If any model returned an error (shown as > Error: ...), mention it briefly but focus on the successful responses.",
      ].join("\n"),
    }
  );

  server.tool(
    "get_second_opinion",
    "Query multiple AI models in parallel via OpenRouter and return their responses. Use this when you or the user want a second opinion on any question or decision. Returns Markdown with a ### model-name header and response body per model, separated by --- dividers. Errors appear as > Error: blockquotes.",
    { query: z.string().describe("The question or prompt to send to all models") },
    async ({ query }) => {
      const results = await queryModels(query, config, client);
      const formatted = formatResults(results);
      return { content: [{ type: "text", text: formatted }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
