---
layout: "../../../layouts/HelpLayout.astro"
title: "Other agents & OpenClaw"
description: "Check compatibility before adapting an MCP configuration from another platform."
category: "Connect your agent"
icon: "+"
sources: []
---

## What the client needs

SEO Researcher exposes a remote **Streamable HTTP** server at:

```text
https://mcp.seoresearcher.ai/mcp
```

The client must discover and invoke tools, complete OAuth with PKCE and the server’s discovery endpoints, and preserve its credentials. It must also support multiple turns: start a job, wait, check status, then retrieve results. A field labeled “API URL” or support for local STDIO alone is not enough.

## OpenClaw and less common clients

Do not assume an OpenClaw extension, community bridge, or similarly named MCP integration supports this authentication flow. We have not verified a specific OpenClaw version and installation path. Consult the installed client’s official documentation for remote HTTP and OAuth support before configuring it. Do not copy a JSON shape from Cursor into a different client unchanged.

If OAuth is unsupported, ask [support](/help/support) whether scoped API-key access is available for your account. Do not reuse a browser cookie or another product’s API key. A local bridge adds another dependency and credential store; it is not required for the native clients in our directory.

## For developers

The [tool reference](/help/tools) describes the MCP lifecycle and REST equivalents. A custom REST integration needs its own authentication and error handling; an API URL is not an MCP URL.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
