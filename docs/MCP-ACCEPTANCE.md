# MCP read-only acceptance

Run this before provider-backed research or load testing. The suite validates the connection and saved-read surface; it does not establish output quality, paid-research concurrency, complete billing settlement, or actual Claude/Codex OAuth refresh behavior.

## Local regression suite

`npm run test:mcp` executes the real Workers entrypoint, Agents MCP handler, and MCP SDK transport with intercepted upstream fetches. Fixtures cover missing/expired credentials, permission denial, rate limits, service failure/retry, invalid input, result-not-ready guidance, list pagination, account identity projection, and 25 concurrent accounts. No application server, database, provider, or production binding is contacted. The separate Rankability regression executes its actual connection route against strict read-only mocks and verifies that a new account creates no workspace, an existing workspace is scoped to the authenticated organization, and a failed read is not reported as an empty successful connection.

## Deployment order

Deploy the Rankability connection-read repair through Replit before deploying this gateway. The previous application connection endpoint could create a default workspace as a side effect of every MCP authentication check. The new connection tool must not be described as read-only on that previous application build. The gateway release itself adds no schema, secret, scope, or infrastructure setting.

## Bounded production check

Run `npm run acceptance:read-only`. Without a token it checks OAuth discovery, resource identity, and the missing-credential challenge. Supply `SEO_RESEARCHER_ACCESS_TOKEN` through an existing secret manager to add initialize, tool discovery, account identity, and one page of existing jobs. Never paste a token into a command, URL, issue, or chat. The report omits job content and credentials. It makes no automatic retry and starts no jobs. A skipped credential check is not an authenticated pass.

In Codex and Claude, use the existing SEO Researcher connector and ask: “Check which SEO Researcher organization is connected and list my existing research jobs. Do not start research.” Match `organization_id` to the intended account. A working list on one client does not prove another client's OAuth grant, the trial account, or session recovery. Refresh the client's tool catalog if `seo_research_connection` is absent.

Test expiry, revoked permission, cross-tenant IDs, and failure injection with fixtures first. Live grant revocation or reauthorization must be scoped to a dedicated test connector; do not break a customer's active session for a test. Provider-backed research needs an explicit topic and authorization. Research throughput tests need an isolated environment, provider mocks, a fixed request cap, and stop thresholds before any production load experiment.
