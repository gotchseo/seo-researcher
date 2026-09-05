# SEO Researcher

SEO Researcher gives Claude, Codex, Cursor, and other agents the live search research they are missing before they write: Google competitors, topics, entities, search questions, AI citations, content gaps, and source URLs.

The public website, REST façade, and remote MCP server run on Cloudflare. Research jobs use the existing Rankability research infrastructure behind a narrow, versioned adapter. This repository contains no SERP-provider runtime and no Rankability secrets.

## Connect an agent

The [help center](https://seoresearcher.ai/help) includes platform-specific
connection guides, content workflows, troubleshooting, and five downloadable
[starter skills](https://seoresearcher.ai/help/skills).

Use the Streamable HTTP MCP endpoint:

```text
https://mcp.seoresearcher.ai/mcp
```

The first connection opens OAuth. After authorization, ask your agent:

```text
Research “best CRM software” before we create this article.
```

The focused tool surface is:

- `seo_research_start`
- `seo_research_status`
- `seo_research_get`
- `seo_research_list`

## REST API

The REST façade is available at `https://api.seoresearcher.ai/v1`. Send the same OAuth access token or Rankability API key as a bearer token. See [docs/API.md](docs/API.md) and [openapi.yaml](openapi.yaml).

## Local development

```bash
npm install
npm run dev
npm run dev:worker
```

Copy `.env.example` to `.dev.vars` for local Worker secrets. Never commit `.dev.vars`.

## Validation and deployment

```bash
npm run validate
npm run deploy
```

Cloudflare serves the same Worker at `seoresearcher.ai`, `api.seoresearcher.ai`, and `mcp.seoresearcher.ai`. The Worker separates each host's surface, records edge analytics, and proxies only the dedicated SEO Researcher contract.

The trial CTA hands customers to `https://app.seoresearcher.ai/start`. That
branded host uses Rankability's existing account, billing, and research
infrastructure without exposing the generic Rankability pricing funnel.

## Security

See [SECURITY.md](SECURITY.md). OAuth is preferred. Raw access tokens are never written to analytics or logs.

## License

The public integration and deployment shell is available under the MIT License. Rankability's private research engine is not part of this repository.
