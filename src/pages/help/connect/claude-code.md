---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Claude Code"
description: "Add the hosted MCP from your terminal and authorize it in your browser."
category: "Connect your agent"
icon: ">_"
sources: [{"title": "Claude Code MCP documentation", "url": "https://code.claude.com/docs/en/mcp"}]
---

## Add the server

Run this in your terminal. The user scope makes the connection available across your projects:

```bash
claude mcp add --transport http --scope user seo-researcher https://mcp.seoresearcher.ai/mcp
```

Open Claude Code and enter:

```text
/mcp
```

Select **seo-researcher** and complete its authentication flow. Return to the terminal after browser approval. If that name is already configured, inspect it with `claude mcp get seo-researcher` before changing it; do not create duplicate entries.

For a shared project configuration, choose `--scope project` instead of `--scope user`. Each teammate still authorizes their own account. Keep tool approval enabled for research starts; adding the connection does not mean approving unlimited work.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
