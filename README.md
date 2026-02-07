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
      "args": ["/mnt/c/Users/wvdsl/Git/second_opinion/dist/index.js"],
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

**Input:** `{ "query": "your question here" }`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | - | Your OpenRouter API key |
| `SECOND_OPINION_MODELS` | No | See below | Comma-separated model IDs |
| `SECOND_OPINION_TIMEOUT` | No | `30000` | Per-model timeout in ms |

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
