---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Cline"
description: "Set up the Streamable HTTP transport in Cline\u2019s MCP server controls."
category: "Connect your agent"
icon: "CL"
sources: [{"title": "Cline MCP configuration", "url": "https://docs.cline.bot/mcp/mcp-overview"}]
---

## Configure the connection

In Cline, open **MCP Servers → Remote Servers**. Enter **SEO Researcher**, paste the URL, choose **Streamable HTTP**, and add the server.

For manual configuration, open **Configure → Configure MCP Servers** and merge:

```json
{
  "mcpServers": {
    "seo-researcher": {
      "type": "streamableHttp",
      "url": "https://mcp.seoresearcher.ai/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Set the transport explicitly; omitting it can select legacy SSE. Complete OAuth if your installed client offers it. This guide verifies the documented transport configuration; authenticated SEO Researcher interoperability in your Cline version must still pass the check below. If it only offers token headers, ask support about a scoped credential or use a documented OAuth-capable client. Never paste a token into chat or a shared configuration file.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
