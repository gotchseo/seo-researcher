# API quickstart

Base URL: `https://api.seoresearcher.ai/v1`

```bash
curl -X POST https://api.seoresearcher.ai/v1/research \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: crm-article-2026-09" \
  -d '{"topic":"best CRM software","depth":"standard"}'
```

Poll `GET /research/{job_id}` until `status` is `complete`, then fetch `GET /research/{job_id}/result?view=full`.

Views:

- `summary`: compact quality, totals, gaps, and recommended coverage.
- `full`: topics, entities, questions, competitors, citations, gaps, and recommendations.
- `evidence`: competitor and AI-citation source evidence only.

Use stable idempotency keys when retrying. Respect `recommended_poll_seconds` and HTTP `429` retry headers.
