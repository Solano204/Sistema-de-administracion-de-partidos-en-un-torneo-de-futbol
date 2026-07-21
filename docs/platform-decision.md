# Documentation platform decision

## Recommendation

**Markdown-in-repo (`docs/`, rendered by GitHub) + springdoc's built-in Swagger UI for interactive docs.** No dedicated docs platform, no static-site generator, no third-party hosted service. This is what's already in place after this pass - this section is the justification for *not* adding anything on top of it, not a proposal for new tooling.

## What actually informed this, from this specific project

- **Team size**: everything in this repo's history (this review, `REVIEW_NOTES.md`, the fact that CI had literally never run once before this pass) points to a solo or near-solo maintainer, not a team with a dedicated docs owner. Any platform with its own admin UI, publishing workflow, or account management is overhead nobody is asking for.
- **Consumers, today**: one - the bundled Next.js frontend in the same repo. There is no evidence of an external/public API consumer, no partner integrations, no third-party developer program. Public-developer-portal tooling (ReadMe, Stoplight, GitBook-with-a-custom-domain) solves a problem this project doesn't have yet.
- **Toolchain**: the backend is pure Maven, no Node.js/npm anywhere in it. Adding Docusaurus (or any JS-based static site generator) to document a Java backend means introducing and maintaining an entire second toolchain - a new `package.json`, a new build step, a new place for dependency drift - purely for docs. That cost is real and, for this project, unjustified.
- **Budget/infra signals**: `.env` in this repo has hobby-tier defaults everywhere (`admin`/`1234` Postgres creds, a self-labeled "do not use in production" JWT secret, a free-tier-shaped Supabase project). Nothing here suggests budget for a paid docs platform (ReadMe and Stoplight are both paid past small free tiers; even "free" hosted options add an external account/dependency).
- **What's already free and already correct**: springdoc generates `/v3/api-docs` and serves `/swagger-ui.html` directly from the running app, with zero extra infrastructure - the spec can never drift from the code because it's regenerated from the code's own annotations on every boot. That property (spec can't go stale) is worth more here than any prose-authoring/theming features a dedicated platform would add.

## Why not the alternatives

- **Docusaurus / VitePress / any static-site generator**: real strength is versioned, themed, searchable prose docs at scale - valuable when there are many versions to maintain in parallel or a large narrative-docs surface (tutorials, guides, SDKs in multiple languages). This project has neither. Revisit if that changes.
- **ReadMe.io / Stoplight / Mintlify (hosted docs platforms)**: their value is a polished public developer portal, API key management UI, and usage analytics for external developers. There's no external developer audience yet. Also introduces a paid third-party dependency and an external account for a solo-maintainer project.
- **Confluence / Notion**: solves internal knowledge-sharing for a team, not API reference docs; also puts documentation outside version control, so it can't be reviewed in the same PR as the code change that makes it necessary (which is exactly what happened with the exception-handling fixes in this very pass - the code fix and the doc update landed together because both live in the same repo).

## When to revisit this

- A second real API consumer shows up that isn't this repo's own frontend (a partner, a public integration, a mobile app maintained by a different team) → revisit a hosted portal.
- The API needs to support multiple concurrent versions long-term (see `docs/versioning.md`) → revisit a static-site generator with versioned-docs support.
- A dedicated docs owner (technical writer, DX role) joins → their tooling preferences should drive this decision at that point, not this one.
