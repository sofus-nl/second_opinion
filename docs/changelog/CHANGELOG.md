# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-02-24

### Added

- `follow_up` tool — drill deeper into previous responses by sending prior markdown as context with a new question
- `src/model-info.ts` — fetches and caches OpenRouter model metadata (pricing, context length, modality)
- Token usage tracking (`prompt_tokens`, `completion_tokens`) on all model responses
- Per-model and total token counts in `StructuredSummary`

### Changed

- `list_models` now returns detailed model info: name, context_length, max_completion_tokens, modality, input/output cost per token
- Server version bumped to 0.4.0
- Server instructions updated to describe `follow_up` tool and token usage in summaries

## [0.3.0] - 2026-02-07

### Added

- `review_code` tool — specialized code review with focus areas (security, performance, style, bugs)
- `compare_approaches` tool — compare 2+ technical approaches with pros/cons/recommendation
- `fact_check` tool — verify claims across models, prioritizing search-augmented models
- `list_models` tool — return currently configured model list
- `second-opinion://config` resource — read server configuration as JSON
- `QueryOptions` interface — context, system_prompt, model/temperature/max_tokens overrides per request
- Latency tracking (`latency_ms`) on all model responses
- Retry logic — automatic single retry when a model returns a very short response (< 5 chars)
- Structured JSON summary (audience: assistant) in tool responses with model stats
- `StructuredSummary` and `buildStructuredSummary()` in formatter module
- `src/prompts.ts` — system prompt templates for specialized tools
- `SECOND_OPINION_TEMPERATURE` env var — default sampling temperature (0-2)
- `SECOND_OPINION_MAX_TOKENS` env var — default max response tokens

### Changed

- `get_second_opinion` now accepts optional `context`, `system_prompt`, `models`, `max_tokens`, `temperature` parameters
- `queryModels()` accepts optional 4th `QueryOptions` parameter (backward compatible)
- Server version bumped to 0.3.0
- Server instructions updated to describe all 5 tools and the resource
- Tool responses now include both markdown (for users) and JSON summary (for assistants)

## [0.2.0] - 2026-02-07

### Added

- Unit tests for `formatter`, `config`, and `providers` modules using Vitest
- `npm test` script for running tests
- Test coverage: 18 tests across 4 test files (unit + integration)
- GitHub Actions CI workflow (build + test on push/PR)
- GitHub Actions publish workflow (npm publish with provenance on GitHub release)
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- GitHub issue templates (bug report, feature request) and PR template
- README badges (CI status, license, Node version)
- `.nvmrc` pinned to Node 24
- `package.json` metadata: `repository`, `author`, `engines`, `homepage`, `bugs`
- MCP server instructions for AI agent behavioral guidance
- Output format description in tool metadata for better AI agent response handling

### Changed

- Default models updated to GPT-5.2, Gemini 3 Pro Preview, Grok 4.1 Fast, Sonar Reasoning Pro
- Tool and server descriptions generalized to any topic (not just coding)
- AI agents can now use the tool on their own initiative, not only when user requests
- OpenAI client created once at startup for faster repeat calls

## [0.1.0] - 2025-02-06

### Added

- Initial release
- MCP server with `get_second_opinion` tool
- Parallel querying of multiple AI models via OpenRouter
- Configurable model list and timeout via environment variables
- Default models: GPT-4o, Gemini 2.5 Pro, Claude Sonnet 4, Grok 3
- Per-model error isolation (one failure doesn't break others)
- Markdown-formatted response output
- `npx` support for zero-install usage
