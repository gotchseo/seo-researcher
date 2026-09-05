---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Cursor"
description: "Make SEO Researcher available to Cursor Agent with a small configuration entry."
category: "Connect your agent"
icon: "\u2197"
sources: [{"title": "Cursor MCP documentation", "url": "https://cursor.com/docs/mcp"}]
---

## Configure the remote server

Merge the following into `.cursor/mcp.json` for one project, or `~/.cursor/mcp.json` for your user account:

```json
{
  "mcpServers": {
    "seo-researcher": {
      "url": "https://mcp.seoresearcher.ai/mcp"
    }
  }
}
```

Preserve other servers in the file. Open Cursor’s MCP controls, enable the server, and complete its OAuth sign-in when prompted. Use Agent chat with the SEO Researcher tools enabled.

SEO Researcher supports dynamic client registration, so you do not need to invent a client ID, client secret, or API-key header for this OAuth path. If tools are absent, reload the session and inspect the server’s connection status before retrying research.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
