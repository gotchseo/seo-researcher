---
layout: "../../layouts/HelpLayout.astro"
title: "MCP tool reference"
description: "The research tools, their inputs, and the saved research lifecycle."
category: "Reference"
icon: "\u2197"
sources: []
---

## Connection and access

Server URL: `https://mcp.seoresearcher.ai/mcp`. Transport: Streamable HTTP. Permissions: `seo_research:read` and `seo_research:run`. OAuth is the default setup route. API-key access requires an appropriately scoped credential; a skill does not create one.

## seo_research_connection

No inputs. Reports the authenticated `organization_id`, existing `default_client_id` (or `null`), granted research `scopes`, and `metering_model`. Use this before listing jobs when you need to confirm which account is connected. These are account identifiers, not the name or email of the person signed in. A null workspace means none exists yet; the first explicitly requested research job can create it. A successful connection does not prove that research has completed or that unused capacity remains.

This check does not start research or create a workspace. If the tool is missing after an update, refresh your client’s tool list or reconnect the existing connector.

## seo_research_start

Starts research and returns a saved job to follow. Research can consume your included usage and invoke research providers.

| Input | Contract |
| --- | --- |
| `topic` | Required string, 1–500 characters |
| `country` | Optional string, 2–80 characters |
| `language` | String, 2–10 characters; defaults to `en` |
| `location` | Optional string, 1–255 characters |
| `brand_domain` | Optional string, up to 255 characters |
| `target_url` | Optional valid URL |
| `depth` | `standard` (default) or `deep` |
| `idempotency_key` | Optional string, 1–180 characters for the full service path; use one stable value per intentional request |
| `client_id` | Optional existing workspace UUID; omit to use account default |

```json
{
  "topic": "best CRM for solo consultants",
  "country": "United States",
  "language": "en",
  "depth": "standard",
  "idempotency_key": "consultant-crm-brief-2026-09-04-01"
}
```

The key above is illustrative. Create a distinct key for each new intentional job; reuse it only for retries of the same request. Do not invent workspace IDs. Do not send confidential customer details in the topic or idempotency key.

## seo_research_status

Input: `job_id`, the UUID returned by start. Read its actual state, stage, quality information, and polling guidance. Poll at `recommended_poll_seconds` (in seconds) when supplied. Terminal failure is not successful research. Avoid guessing a job ID or restarting work because it is still running.

## seo_research_get

Inputs: `job_id` and `view` (`summary`, `full`, or `evidence`; default `full`). Retrieve after completion. Use summary for orientation, full for detailed briefs and drafting, and evidence to inspect retained source support. A partial-quality packet still requires explicit limitations; missing sources are not zero competition.

## seo_research_list

Inputs: `limit` (integer 1–100, default 20) and optional `cursor` (up to 500 characters). Use this to find recent saved jobs, recover a job ID, or test authenticated access without starting research. MCP list responses also include `connection` metadata identifying the authenticated account, even when the job list is empty.

## A reliable sequence

1. Reuse a suitable existing packet when available, checking freshness and market fit.
2. Start one requested job and save its ID and idempotency key.
3. Poll that same job at the returned interval. If no interval is returned, wait at least 10 seconds. After ten minutes without completion, retain the ID and report the last state; this is a client workflow limit, not a service completion promise.
4. Read the completed result and disclose unavailable evidence.
5. Draft or edit using the agent’s own writing capabilities and your instructions.

The MCP does not publish, write articles, measure your traffic, or automatically verify every source claim. Those steps require other tools and evidence.

## REST equivalents

Base URL: `https://api.seoresearcher.ai`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/research` | Start a job |
| GET | `/v1/research` | List recent jobs |
| GET | `/v1/research/{job_id}` | Read status |
| GET | `/v1/research/{job_id}/result?view=summary` | Read results |

Use a scoped bearer credential in the Authorization header. Preserve idempotency with the `Idempotency-Key` header on retries. Never put credentials in URLs. These are API paths for integrations, not URLs to paste into an MCP server field.
