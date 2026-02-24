# Project: second-opinion-mcp-server

MCP server that queries multiple AI models in parallel via OpenRouter. 6 tools + 1 resource.

## Commands

- `npm run build` — compile TypeScript to `dist/`
- `npm run dev` — watch mode
- `npm test` — run unit tests (vitest)
- `OPENROUTER_API_KEY=sk-or-... node dist/index.js` — run server locally

## Architecture

```
src/
  index.ts       — MCP server entry point, tool/resource registration, buildToolResponse helper
  config.ts      — env var parsing (API key, models, timeout, temperature, max_tokens)
  providers.ts   — OpenAI client creation, parallel model querying with QueryOptions, latency, retry, token usage
  formatter.ts   — markdown formatting + StructuredSummary builder (includes token counts)
  prompts.ts     — system prompt templates for review_code, compare_approaches, fact_check
  model-info.ts  — fetch + cache OpenRouter model metadata (pricing, context length, modality)
```

6 source modules. Each has a co-located `.test.ts`. Integration test in `providers.integration.test.ts`.

## Tools

- `get_second_opinion` — general multi-model query with context/system_prompt/model overrides
- `review_code` — code review with focus area (security/performance/style/bugs)
- `compare_approaches` — compare 2+ approaches with pros/cons/recommendation
- `fact_check` — verify claims, prioritizes search-augmented models
- `follow_up` — drill deeper into previous responses with a follow-up question
- `list_models` — return configured models with pricing, context length, and capabilities

## Resources

- `second-opinion://config` — server config as JSON

## Environment

- `OPENROUTER_API_KEY` (required) — get at https://openrouter.ai/keys
- `SECOND_OPINION_MODELS` (optional) — comma-separated model IDs
- `SECOND_OPINION_TIMEOUT` (optional) — per-model timeout in ms, default 30000
- `SECOND_OPINION_TEMPERATURE` (optional) — default sampling temperature (0-2)
- `SECOND_OPINION_MAX_TOKENS` (optional) — default max response tokens

## Testing

- Framework: vitest
- Unit tests mock the OpenAI client; integration test hits OpenRouter (needs real API key)
- Run: `npm test`

## Gotchas

- `dist/` is gitignored — must `npm run build` before running or publishing
- Uses ESM (`"type": "module"`) — imports need `.js` extensions in TS source
- Node >=24 required (see `.nvmrc` and `engines` in package.json)
- Mock responses in tests must be >= 5 chars to avoid triggering retry logic

## Conventions

- Changelog: `docs/changelog/CHANGELOG.md` (Keep a Changelog format)
- CI: GitHub Actions on push/PR to main (build + test)
