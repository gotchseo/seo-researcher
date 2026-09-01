---
name: seo-research
description: Research a search topic before writing or revising content. Use when the user asks for SEO research, Google competitors, content gaps, entities, questions, AI citations, or a research-backed content plan.
---

# SEO research

Use the SEO Researcher MCP instead of treating a general web search as a substitute for search-result analysis.

1. Start one research job for the exact target topic. Use `depth: standard` unless the user explicitly needs the widest AI-source coverage.
2. Poll with `seo_research_status` at the returned interval. Stop at `complete` or `failed`; do not create duplicate jobs while one is running.
3. Read `summary` first. Request `full` when writing or planning requires the complete topic, entity, question, citation, and gap set. Request `evidence` when validating source claims.
4. Distinguish observed evidence from recommendations. Preserve source URLs and identify unavailable sources or partial quality.
5. Use the packet to inform the work; do not claim that inclusion guarantees rankings or AI citations.
