# Help center maintenance

The public help center is built from `src/pages/help/` using `HelpLayout.astro`.
Add a Markdown article with title, description, category, icon, and sources in
frontmatter. The directory search discovers articles automatically. Use the
appropriate relative layout path for nested articles.

Platform instructions must link to official documentation and distinguish
documented support from successful SEO Researcher connection tests. Update the
source-check date in the layout after reviewing all platform instructions.
Keep known OAuth and trial-email limitations accurate; documentation does not
repair authentication or lifecycle-email routing.

Skill sources live in `skills/<name>/SKILL.md`. `npm run build` packages the five
curated skills as deterministic ZIPs, plain Markdown previews, and a SHA-256
manifest under `public/downloads/`, then embeds the static site in the Worker.
Update the packaging list and skills guide together when adding a skill.
Skills are instructions, not credential installers. Preserve research scope,
idempotency, polling, evidence provenance, and human editorial review.

## Validation

- Run `npm run build`, `npm run check`, `npm test`, and `git diff --check`.
- Run a Wrangler deployment dry run before proposing a deployment.
- Check the help directory search, code-copy buttons, mobile layouts, and ZIP
  downloads. Test embedded binary responses as well as the Astro dev server.
- Verify local links/anchors and check skill frontmatter with the skill validator.
- Do not report live OAuth, paid research, or installation across every client
  as tested unless those tests were actually completed.

September 4, 2026 validation: 25 rendered pages had no broken local links or
anchors; 15 tests passed; build and type checks passed; all five skill packages
passed frontmatter and independent ZIP integrity checks; Worker dry run passed.
Browser review covered desktop and 390px layouts, search, and copy controls.
Live OAuth, paid research, and client-by-client skill installation were not run.

Deployment remains a separate production action. A merged PR is not evidence
that these pages are live.
