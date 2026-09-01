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
