# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
