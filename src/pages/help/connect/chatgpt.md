---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect ChatGPT"
description: "Use a custom MCP app where your ChatGPT account enables developer mode."
category: "Connect your agent"
icon: "GPT"
sources: [{"title": "ChatGPT developer mode", "url": "https://developers.openai.com/api/docs/guides/developer-mode"}]
---

## Create a custom app

In ChatGPT on the web, open **Settings → Security and login** and enable **Developer mode**, where available. Organization policy may require an administrator.

Open ChatGPT Plugins, choose the plus button, and create a developer-mode app from your MCP server. Use **SEO Researcher** as the name, choose OAuth with dynamic client registration (DCR) if a registration choice appears, and enter:

```text
https://mcp.seoresearcher.ai/mcp
```

Complete authorization, then select the app for your conversation. Refresh its tools from app settings if discovery is stale. Developer mode supports tools beyond `search` and `fetch`; do not rename SEO Researcher’s tools or choose a read-only search integration that cannot start research.

This is a custom app setup, not a claim that SEO Researcher is listed in the public app directory. Availability and approvals depend on your account. If developer mode is unavailable, use another client in the [setup directory](/help#connect).

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
