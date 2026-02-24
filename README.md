# second-opinion-mcp-server

[![CI](https://github.com/sofus-nl/second_opinion/actions/workflows/ci.yml/badge.svg)](https://github.com/sofus-nl/second_opinion/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24-brightgreen)](https://nodejs.org)

An MCP server that queries multiple AI models in parallel via [OpenRouter](https://openrouter.ai), giving your AI agent a "second opinion" on any question.

## Quick Start

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Add to your MCP client config:

```json
{
  "mcpServers": {
    "second-opinion": {
      "command": "npx",
      "args": ["-y", "second-opinion-mcp-server"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-..."
      }
    }
  }
}
```

To run from a local clone instead, build first then point to the dist entry:

```json
{
  "mcpServers": {
    "second-opinion": {
      "command": "node",
      "args": ["/path/to/second_opinion/dist/index.js"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-..."
      }
    }
  }
}
```

## Tools

### `get_second_opinion`

Sends a query to multiple AI models in parallel and returns all responses as formatted Markdown.

**Input:**
- `query` (string, required) — The question or prompt to send to all models
- `context` (string, optional) — Additional context prepended to the query
- `system_prompt` (string, optional) — System prompt sent to all models
- `models` (string[], optional) — Override configured models for this request
- `max_tokens` (number, optional) — Max response tokens per model
- `temperature` (number, optional) — Sampling temperature (0-2)

### `review_code`

Send code to multiple AI models for review with a specific focus area.

**Input:**
- `code` (string, required) — The code to review
- `language` (string, optional) — Programming language
- `focus` (enum, required) — Review focus: `security`, `performance`, `style`, or `bugs`
- `models` (string[], optional) — Override configured models
- `max_tokens` (number, optional) — Max response tokens per model

### `compare_approaches`

Compare two or more technical approaches by sending them to multiple AI models.

**Input:**
- `question` (string, required) — The decision or problem to evaluate
- `approaches` (string[], required, min 2) — The approaches to compare
- `models` (string[], optional) — Override configured models

### `fact_check`

Fact-check a claim across multiple AI models, prioritizing search-augmented models.

**Input:**
- `claim` (string, required) — The claim to fact-check
- `models` (string[], optional) — Override configured models

### `follow_up`

Drill deeper into a previous second-opinion response. Send the markdown from a prior tool call as context, then ask a follow-up question.

**Input:**
- `previous_responses` (string, required) — The markdown output from a prior second-opinion tool call
- `question` (string, required) — The follow-up question to ask
- `system_prompt` (string, optional) — System prompt sent to all models
- `models` (string[], optional) — Override configured models
- `max_tokens` (number, optional) — Max response tokens per model
- `temperature` (number, optional) — Sampling temperature (0-2)

### `list_models`

Return configured models with pricing, context length, and capabilities.

**Input:** none

**Output:** JSON array where each entry includes: `id`, `name`, `context_length`, `max_completion_tokens`, `modality`, `input_cost_per_token`, `output_cost_per_token`.

## Resources

### `second-opinion://config`

Returns server configuration as JSON (models, timeout, default temperature/max_tokens).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | - | Your OpenRouter API key |
| `SECOND_OPINION_MODELS` | No | See below | Comma-separated model IDs |
| `SECOND_OPINION_TIMEOUT` | No | `30000` | Per-model timeout in ms |
| `SECOND_OPINION_TEMPERATURE` | No | - | Default sampling temperature (0-2) |
| `SECOND_OPINION_MAX_TOKENS` | No | - | Default max response tokens |

## Default Models

- `openai/gpt-5.2`
- `google/gemini-3-pro-preview`
- `x-ai/grok-4.1-fast`
- `perplexity/sonar-reasoning-pro`

Override with `SECOND_OPINION_MODELS`:

```json
"env": {
  "OPENROUTER_API_KEY": "sk-or-...",
  "SECOND_OPINION_MODELS": "openai/gpt-4o,meta-llama/llama-3-70b-instruct"
}
```

## Development

```bash
npm install
npm run build
npm test
OPENROUTER_API_KEY=sk-or-... node dist/index.js
```

## License

MIT
