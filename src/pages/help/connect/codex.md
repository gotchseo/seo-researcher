---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Codex"
description: "Configure the remote server for local Codex and finish OAuth sign-in."
category: "Connect your agent"
icon: "CX"
sources: [{"title": "OpenAI MCP documentation", "url": "https://developers.openai.com/codex/mcp"}]
---

## Add and authorize

Use the Codex CLI on the same machine as your local Codex environment:

```bash
codex mcp add seo-researcher --url https://mcp.seoresearcher.ai/mcp
codex mcp login seo-researcher
codex mcp list
```

Complete the browser sign-in with your SEO Researcher account. Open a new Codex session to load the connection if needed. A remote or cloud environment can have separate configuration; a local installation is not proof it is available there.

If you manage configuration directly, merge this entry into `~/.codex/config.toml`, preserving other settings, then run the login command:

```toml
[mcp_servers.seo-researcher]
url = "https://mcp.seoresearcher.ai/mcp"
```

Use either the add command or manual configuration. Do not save access tokens in the TOML file. The [starter skills](/help/skills) are installed separately from the MCP connection.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
