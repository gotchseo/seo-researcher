# SEO Researcher project scope

SEO Researcher is a separate public product and brand at `seoresearcher.ai`.
It gives AI agents structured SEO research before they write content.

## In scope

- A one-page marketing site at `seoresearcher.ai`.
- A branded REST API at `api.seoresearcher.ai`.
- A focused remote MCP server at `mcp.seoresearcher.ai/mcp`.
- OAuth discovery and connection flows that delegate identity and entitlement
  decisions to Rankability.
- First-party product analytics for acquisition, activation, research quality,
  agent adoption, retention, reliability, and unit economics.
- Public integration metadata and submission assets for agent ecosystems.

## Out of scope

- A second SERP collection pipeline.
- A second customer database, billing ledger, research queue, or entitlement
  system.
- A content editor or AI writer.
- Exposing Rankability's private implementation, credentials, or provider
  contracts in this public repository.

The research engine and durable customer state remain in the existing
Rankability runtime. Cloudflare is the public edge, website host, API façade,
and focused MCP runtime.
