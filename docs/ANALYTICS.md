# Analytics contract

Every event carries `schema_version`, environment, request ID, surface, host, path, referrer class, UTM attribution, and a pseudonymous identity when authenticated. Raw bearer tokens, API keys, queries, and result payloads are prohibited.

## Acquisition funnel

`landing_viewed` → `primary_cta_clicked` → `signup_started` → `checkout_started` → `trial_started` → `connection_verified` → `first_research_started` → `first_packet_retrieved` → `trial_converted`

## Embedded-use signals

Track active organizations, connected clients, research jobs, successful packets, failures, latency by stage, packet views, distinct usage days, tools per organization, source availability, queue time, and MCP versus REST use. The primary activation milestone is the first complete packet retrieved through an external agent. The primary retention metric is weekly embedded research organizations.

## Required dashboards and alerts

- Acquisition and 14-day trial funnel by source, directory, client, and billing interval.
- Time to OAuth connection, first research, and first complete packet.
- Day 1/3/7/14 usage and trial conversion cohorts.
- Weekly embedded research organizations and jobs per active organization.
- Research quality, source availability, provider latency, failures, and cost per complete packet.
- Alerts for auth failures, queue lag, completion-rate regression, source degradation, and abnormal per-organization use.

## Cloudflare dataset schema

Dataset: `seo_researcher_events`

- `index1`: pseudonymous authenticated identity hash, or `anonymous`.
- `blob1`: event name.
- `blob2`–`blob18`: product, environment, request ID, host, path, method, operation, job ID, error code, session ID, UTM dimensions, referrer class, and bounded user-agent string.
- `double1`–`double4`: HTTP status, success state, latency in milliseconds, and edge write time.

Referrers are reduced to `direct`, `self`, `unknown`, or the external source hostname. URL paths, query strings, bearer tokens, API keys, research topics, and result contents are never written to the dataset.

## Production collection status

Rankability PostHog project `294857` is the canonical cross-surface analytics store. The pinned dashboard **SEO Researcher — Launch, Activation & Embedded Usage** is created there; saved insights are added only after the corresponding production event/property pairs appear in PostHog's live schema.

Cloudflare Analytics Engine is enabled for the production account and the Worker binds `SEO_ANALYTICS` to `seo_researcher_events`. The Worker retains its privacy-safe `edge_analytics_fallback` log path so a missing binding remains visible instead of silently dropping telemetry. Rankability PostHog remains the canonical cross-surface product analytics store; edge counts are reconciled against it after the Rankability production adapter begins emitting the matching lifecycle events.
