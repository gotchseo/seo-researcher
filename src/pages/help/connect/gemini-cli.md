---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Gemini CLI"
description: "Configure Streamable HTTP and authenticate from the CLI."
category: "Connect your agent"
icon: "G"
sources: [{"title": "Gemini CLI MCP documentation", "url": "https://geminicli.com/docs/tools/mcp-server/"}]
---

## Configure and sign in

Merge this into the `mcpServers` object in your Gemini CLI settings, commonly `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "seo-researcher": {
      "httpUrl": "https://mcp.seoresearcher.ai/mcp"
    }
  }
}
```

Use `httpUrl` for Streamable HTTP. Restart Gemini CLI if the updated server is not discovered. In the interactive session, authenticate with:

```text
/mcp auth seo-researcher
```

Complete the browser authorization and return to the CLI. Use `/mcp list` to inspect connection state. Do not enable global automatic approval merely to get through setup. If authentication fails, retain the error category and consult [troubleshooting](/help/troubleshooting).

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
