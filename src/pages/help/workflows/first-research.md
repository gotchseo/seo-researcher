---
layout: "../../../layouts/HelpLayout.astro"
title: "Run your first useful research"
description: "Give your agent a specific topic, audience, and market before it writes."
category: "Content workflows"
icon: "\u2197"
sources: []
---

## Define the job

Research is most useful when it informs a real decision. Specify the search topic, intended reader, page type, country, language, and what the reader should be able to do afterward. Include your brand or existing page when relevant. Avoid combining several unrelated topics into one job.

```text
Use SEO Researcher to research “best CRM for solo consultants” for a
US English comparison article. Readers need a simple way to choose
software without hiring an administrator. Use standard depth.

Return the dominant search intent, relevant ranking competitors,
questions, topics, AI-cited sources, and the most useful content gaps.
Separate observed findings from recommendations. Explain missing or
partial evidence. Give me a proposed angle and the original evidence
we would need to make this article worth reading. Do not draft yet.
```

## Follow the saved job

The agent calls `seo_research_start`, keeps the job ID, polls `seo_research_status`, and retrieves the packet with `seo_research_get`. A successful start means work was accepted, not completed. Reuse that ID across the conversation. [The tool reference](/help/tools) explains the exact inputs.

Start with standard depth. Choose deep when broader AI-source coverage would materially change the decision; it does not guarantee complete coverage or a better article. Treat new research as usage-bearing work and avoid launching a batch merely because the agent can.

## Read the result critically

Check the recorded market, language, capture time, and quality state. Exclude irrelevant competitor pages from your interpretation. Identify whether the search calls for a comparison, service page, definition, product page, or practical tutorial. Do not write an informational article for a clearly transactional need without a deliberate reason.

Pick one valuable contribution your team can support: original measurements, a worked example, first-hand experience, a decision framework, or an expert explanation. If the packet has no trustworthy evidence for a claim, mark it for verification rather than filling the gap with confident prose.

Next: [turn the research into a brief](/help/workflows/content-brief), or [install the research skill](/help/skills).
