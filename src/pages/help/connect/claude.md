---
layout: "../../../layouts/HelpLayout.astro"
title: "Connect Claude"
description: "Set up SEO Researcher in Claude on the web or desktop."
category: "Connect your agent"
icon: "C"
sources: [{"title": "Claude remote connector setup", "url": "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp"}]
---

## Add the remote connector

1. In Claude, open **Customize → Connectors**. Older interfaces put Connectors under Settings.
2. Choose **+ → Add custom connector**. Enter **SEO Researcher** as the name and paste the URL below.
3. Use OAuth when asked. Leave optional OAuth client ID and secret fields empty unless your administrator has provided a registered client.
4. Add the connector, then choose **Connect** if authorization does not start automatically. Sign in with the email used for your SEO Researcher trial.
5. Return to Claude and enable the connector for the conversation from the chat’s connector controls.

```text
https://mcp.seoresearcher.ai/mcp
```

Use **Connectors**, not the local MCP server or desktop-extension settings. On managed plans, an owner may need to add the connector first. Feature availability follows your Claude account and organization policy.

If Claude opens a regular browser after you signed up in Incognito, that browser needs its own login. See the [known authorization issue](/help/troubleshooting#rankability-login-or-an-authorization-loop) if the handoff loses your connection.

## Check that it works

Ask your agent:

```text
Use SEO Researcher to list my most recent research job (limit 1).
Do not start research. Report whether the call succeeded, including
when the account has no saved jobs.
```

A successful `seo_research_list` response—even an empty list—confirms authenticated access. Merely saving the URL or seeing a login screen does not. Then follow [your first research workflow](/help/workflows/first-research). If authorization does not return, use [connection troubleshooting](/help/troubleshooting).
