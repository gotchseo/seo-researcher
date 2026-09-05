---
layout: "../../layouts/HelpLayout.astro"
title: "Install your starter skills"
description: "Give your agent a reusable workflow for research, briefs, drafts, refreshes, and review."
category: "Starter skills"
icon: "\u2197"
sources: []
---

## Start with research

The MCP supplies research tools. A skill teaches your agent how to use them for a particular job. Installing a skill does not connect the MCP, create an account, or grant permissions. [Connect and verify access](/help/verify) first, then install only the workflows you want.

Each download is a small, inspectable ZIP containing one folder and `SKILL.md`. There is no executable installer and no API key inside. You do not need a GitHub account to download a skill.

| Download | Skill name | Preview |
| --- | --- | --- |
| [Research before writing](/downloads/seo-research.zip) | `seo-research` | [Read instructions](/downloads/seo-research.md) |
| [Build a content brief](/downloads/seo-content-brief.zip) | `seo-content-brief` | [Read instructions](/downloads/seo-content-brief.md) |
| [Write with evidence](/downloads/seo-evidence-draft.zip) | `seo-evidence-draft` | [Read instructions](/downloads/seo-evidence-draft.md) |
| [Improve an existing page](/downloads/seo-content-refresh.zip) | `seo-content-refresh` | [Read instructions](/downloads/seo-content-refresh.md) |
| [Review before publication](/downloads/seo-editorial-review.zip) | `seo-editorial-review` | [Read instructions](/downloads/seo-editorial-review.md) |

## Claude web or desktop

Download one ZIP. In Claude, open **Customize → Skills → + → Create skill → Upload a skill** and upload it. Enable the skill and the SEO Researcher connector. If your account does not expose Skills, use the prompt fallback below. Upload each skill separately rather than wrapping all five in another ZIP.

[Claude skill upload instructions](https://support.claude.com/en/articles/12512180-using-skills-in-claude).

## Claude Code

Unzip a download and place its named folder in `.claude/skills/` inside your project, or `~/.claude/skills/` for personal use. The resulting path is, for example, `.claude/skills/seo-research/SKILL.md`.

Invoke it with `/seo-research` and your topic. Substitute the other skill names for later stages. [Claude Code skills](https://code.claude.com/docs/en/skills).

## Codex

Unzip and place the named folder in `.agents/skills/` in your project, or `~/.agents/skills/` for personal use. The final path should end in `seo-research/SKILL.md`, with no extra ZIP-name nesting. Open a new session if discovery has not refreshed. Invoke `$seo-research` with your request. [OpenAI skill documentation](https://developers.openai.com/codex/skills).

## Cursor

Unzip into `.cursor/skills/` in your project or `~/.cursor/skills/` for your user. Cursor also supports `.agents/skills/`. Invoke a skill from the `/` menu in Agent chat. [Cursor skills](https://cursor.com/docs/skills).

## Other clients and a no-install fallback

Where native skill installation is unavailable or unverified, open the **Read instructions** link, copy the Markdown into your agent’s conversation or project instructions, and ask it to follow that workflow. This is reusable guidance, not automatic skill discovery. The MCP must still be connected in that client.

```text
Use the SEO Researcher research workflow for [topic], aimed at
[audience] in [market/language]. Research before writing, keep the
saved job ID, disclose incomplete evidence, and propose a useful angle.
Do not draft or publish yet.
```

## Check the installation

Ask the agent to identify the skill and explain its intended workflow **without starting research**. Then make your first scoped research request. Confirm it uses the actual `seo_research_*` tools, retains the job ID, and returns evidence rather than a generic article.

## Update or remove

Preview the new instructions before replacing your installed folder. Keep a backup of your custom edits. To remove a local skill, remove only its named folder; in Claude, disable or delete the uploaded skill. Disconnecting OAuth is a separate action in the client’s connector controls.
