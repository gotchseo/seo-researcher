---
layout: "../../layouts/HelpLayout.astro"
title: "Fix connection & research problems"
description: "Find the failed step without creating another trial or duplicate research job."
category: "Getting started"
icon: "\u2197"
sources: []
---

## Rankability login or an authorization loop

**Updated September 5, 2026:** the authorization return-path repair is deployed. A live read-only test verified SEO Researcher consent, callback state, token exchange, and MCP tool discovery. The shared sign-in service still uses `app.rankability.com`; the consent page should identify SEO Researcher and request only SEO research permissions. Use the account from signup; you should not buy a second subscription to connect.

A new login can be expected if your agent opens a different browser profile or a regular window after an Incognito signup. Use the same account in that browser, then restart **Connect** from the original agent. Reconnect an older connector after the update so it receives a grant for the current SEO Researcher server. Each client still needs its own successful connection check. If you land on a generic dashboard, pricing page, or repeated login, stop and [send the connection details to support](/help/support).

Do not copy session cookies, paste tokens, grant broader Rankability permissions, or repeatedly create connectors to work around this issue. Successful connection requires the [read-only check](/help/verify).

## No tools appear

If your client reports an OAuth **issuer mismatch**, save the error text and contact support. This is an authorization-server configuration problem; do not disable issuer validation or substitute a different server URL to force a connection.

Confirm the URL ends in `/mcp`, the transport is Streamable HTTP, the connector is enabled in this conversation, and your client permits custom servers. Refresh the server’s tool list or start a new conversation. Claude’s local MCP settings are a different feature from remote Connectors.

## Unauthorized or forbidden

A `401` normally requires authentication. A `403` can indicate an inactive subscription, wrong account, wrong organization, or insufficient scopes. SEO Researcher uses `seo_research:read` and `seo_research:run`. Keep the permission request focused on this product. Reconnect if a previous grant predates your access; reinstalling a skill does not update OAuth permissions.

## Research takes longer than expected

Keep the returned job ID and ask for status on that same job. Follow `recommended_poll_seconds` (in seconds); if the response does not provide an interval, wait at least 10 seconds between checks. If the agent cannot wait or its session ends, save the ID and resume later. After ten minutes without a terminal result, report the last status and ask support instead of starting again.

## Rate limit, temporary error, or failed job

For a `429`, respect the returned recovery time. For a temporary request failure, retry a bounded number of times; reuse the same idempotency key if a start response was lost. A terminal failed job is not a completed packet. Inspect its reason before intentionally starting a replacement. Empty or unavailable evidence is not proof that competitors or AI citations do not exist.

## Trial active, but the email says Rankability

A wrong-product trial email was reported September 4, 2026. Separate SEO Researcher trial templates and a send-time product check were deployed September 5. Previously delivered emails cannot be recalled. An older Rankability email may describe a seven-day trial or tracking workflow, while SEO Researcher’s offer is fourteen days. Confirm your actual subscription dates in your checkout/account record and contact support about any mismatch. Do not start another checkout to repair an email or connector issue.
