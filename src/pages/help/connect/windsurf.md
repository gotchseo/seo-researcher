---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Windsurf / Cascade"
description: "Use the remote HTTP configuration in your Cascade environment."
category: "Connect your agent"
icon: "W"
sources: [{"title": "Cascade MCP configuration", "url": "https://docs.windsurf.com/windsurf/cascade/mcp"}]
---

## Add the hosted server

Open your editor’s MCP configuration and merge this server entry into `~/.codeium/windsurf/mcp_config.json` for Windsurf installations using that path:

```json
{
  "mcpServers": {
    "seo-researcher": {
      "serverUrl": "https://mcp.seoresearcher.ai/mcp"
    }
  }
}
```

Refresh the MCP server list and follow the authentication prompt. Enable the server’s tools in Cascade before running the connection check. Keep existing server entries and leave unrelated configuration intact.

The vendor documentation now redirects to Devin Desktop’s Cascade documentation; names and configuration locations may differ in newer installations. Follow the configuration file opened by your installed editor rather than creating a second competing file. If your version cannot complete OAuth, use an OAuth-capable client or ask support about scoped access.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
