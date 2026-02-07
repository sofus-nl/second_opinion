# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly by emailing the maintainers or opening a [private security advisory](https://github.com/sofus-nl/second_opinion/security/advisories/new) on GitHub.

Do **not** open a public issue for security vulnerabilities.

## API Key Handling

This project requires an OpenRouter API key. To keep your key safe:

- Never commit `.env` files (already excluded via `.gitignore`)
- Use environment variables or your MCP client's config to pass the key
- Rotate your key at [openrouter.ai/keys](https://openrouter.ai/keys) if you suspect it was exposed
- Set usage limits on your OpenRouter account to limit blast radius

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
