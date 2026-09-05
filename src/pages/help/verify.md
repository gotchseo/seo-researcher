---
layout: "../../layouts/HelpLayout.astro"
title: "Verify your connection"
description: "Confirm authenticated access before starting any research."
category: "Getting started"
icon: "\u2197"
sources: []
---

## Use a read-only check

After adding and authorizing the connector, open a new conversation with the connector enabled and paste:

```text
Check my SEO Researcher connection. Discover its available tools,
then call seo_research_list with limit 1. Do not start a research job.
Report the actual tool result, including whether the list is empty.
```

You should see four tools: `seo_research_start`, `seo_research_status`, `seo_research_get`, and `seo_research_list`. A client may prefix their names with the server name.

| Observation | Meaning | Next step |
| --- | --- | --- |
| Successful list with jobs | Access works | Reuse a relevant job or start your requested research |
| Successful empty list | Access works; no saved jobs returned | Run your first requested research |
| URL saved but no tools | Setup is not verified | Refresh discovery and enable the connector |
| 401 or login loop | Authentication is incomplete | Use connection troubleshooting |
| 403 | Account access or permission is missing | Check the account and granted scopes |

## What this check does not prove

A successful list does not prove a new research job will complete, that every source will be available, or that a draft will be accurate. Those are separate checks. “Your research layer is ready” after checkout confirms subscription access; it does not confirm an external agent connection.

Once the list succeeds, use [your first research](/help/workflows/first-research). The agent should show a real job ID and retrieve a completed packet before making research-backed claims.
