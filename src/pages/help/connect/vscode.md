---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect VS Code & Copilot"
description: "Add a remote HTTP server and make its tools available in agent chat."
category: "Connect your agent"
icon: "VS"
sources: [{"title": "VS Code MCP setup", "url": "https://code.visualstudio.com/docs/agent-customization/mcp-servers"}]
---

## Add your configuration

Run **MCP: Add Server** from the Command Palette and choose an HTTP server, or merge this into `.vscode/mcp.json`:

```json
{
  "servers": {
    "seo-researcher": {
      "type": "http",
      "url": "https://mcp.seoresearcher.ai/mcp"
    }
  }
}
```

Notice the top-level key is `servers`, not `mcpServers`. Keep existing server entries.

Start the server from VS Code’s MCP controls, review the trust prompt, and complete the authentication prompt. In chat, select a tool-capable agent and enable the SEO Researcher tools with **Configure Tools**. Your organization can restrict MCP servers.

This guide covers interactive VS Code. GitHub’s hosted coding agent and other remote environments have their own configuration and authorization constraints.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
