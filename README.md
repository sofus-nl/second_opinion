# second-opinion-mcp-server

[![CI](https://github.com/sofus-nl/second_opinion/actions/workflows/ci.yml/badge.svg)](https://github.com/sofus-nl/second_opinion/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/second-opinion-mcp-server)](https://www.npmjs.com/package/second-opinion-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24-brightgreen)](https://nodejs.org)

An MCP server that queries multiple AI models in parallel via [OpenRouter](https://openrouter.ai), giving your AI agent a "second opinion" on any question.

## Features

- **6 specialized tools** — general queries, code review, approach comparison, fact-checking, follow-ups, and model listing
- **Parallel model querying** — all models are queried simultaneously with per-model error isolation
- **Token usage tracking** — every response includes `prompt_tokens` and `completion_tokens` per model and totals
- **Latency tracking** — each model response includes `latency_ms`
- **Automatic retry** — retries models that return very short responses (< 5 chars)
- **Structured summaries** — tool responses include both human-readable Markdown and a JSON summary for AI agents

## Quick Start

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Install using one of the options below:

### One-Click Install

[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=second-opinion&inputs=%5B%7B%22id%22%3A%22openrouter_api_key%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22OpenRouter%20API%20Key%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22second-opinion-mcp-server%22%5D%2C%22env%22%3A%7B%22OPENROUTER_API_KEY%22%3A%22%24%7Binput%3Aopenrouter_api_key%7D%22%7D%7D)
[![Install in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=second-opinion&inputs=%5B%7B%22id%22%3A%22openrouter_api_key%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22OpenRouter%20API%20Key%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22second-opinion-mcp-server%22%5D%2C%22env%22%3A%7B%22OPENROUTER_API_KEY%22%3A%22%24%7Binput%3Aopenrouter_api_key%7D%22%7D%7D&quality=insiders)
[![Install in Cursor](https://img.shields.io/badge/Cursor-Install_Server-F14C28?style=flat-square&logo=cursor&logoColor=white)](cursor://anysphere.cursor-deeplink/mcp/install?name=second-opinion&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsInNlY29uZC1vcGluaW9uLW1jcC1zZXJ2ZXIiXSwiZW52Ijp7Ik9QRU5ST1VURVJfQVBJX0tFWSI6IiJ9fQ==)
[![smithery badge](https://smithery.ai/badge/second-opinion-mcp-server)](https://smithery.ai/server/second-opinion-mcp-server)

### Manual Configuration

<details open>
<summary><b>Claude Desktop</b></summary>

Add to your config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

Restart Claude Desktop after saving.

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `~/.cursor/mcp.json`:

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

</details>

<details>
<summary><b>VS Code (Copilot)</b></summary>

Create `.vscode/mcp.json` in your workspace:

```json
{
  "mcp": {
    "servers": {
      "second-opinion": {
        "command": "npx",
        "args": ["-y", "second-opinion-mcp-server"],
        "env": {
          "OPENROUTER_API_KEY": "sk-or-..."
        }
      }
    }
  }
}
```

</details>

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add second-opinion \
  --scope user \
  --transport stdio \
  npx -y second-opinion-mcp-server \
  --env OPENROUTER_API_KEY=sk-or-...
```

Verify with `/mcp` inside Claude Code.

</details>

<details>
<summary><b>Windsurf</b></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

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

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Add to your `settings.json`:

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

</details>

<details>
<summary><b>Local clone</b></summary>

Build first, then point to the dist entry:

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

</details>

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
