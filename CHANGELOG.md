# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/). See `docs/versioning.md` for what counts as breaking in this API and how version bumps work. This is the first entry - the project had no changelog before this pass, so nothing earlier is reconstructed here.

## [Unreleased]

### Breaking

- **`/users/**` and `/auth/**` now require authentication except for the specific public endpoints listed below.** Previously both prefixes were entirely `permitAll()`. Any client relying on unauthenticated access to a `/users/*` or `/auth/*` endpoint other than the ones below will now get a 401.
  - Still public: `POST /auth/login`, `POST /auth/refresh`, `POST /users` (self-registration), `GET /users/exist-admin`.
  - Everything else under those two prefixes (including `PUT /auth/change-password/admin`, previously reachable with **no token at all**) now requires a valid Bearer token, and several also require the `ADMINISTRADOR` role. Full detail: `REVIEW_NOTES.md`.
- **`POST /auth/login` failures now return 401** with the standard error envelope (`{timestamp, status, error, message: "Bad credentials", path}`). Previously fell through to a generic 500.
- **`change-password`, `change-username`, `change-password/admin`, and `refresh` failures now return 400** (or, for `/refresh` specifically, 400 with an empty body) instead of a generic 500. See `docs/errors.md` for the full status-code table.
- **Match/player-stats-update failures (`PlayerStatsException`) now return 404** instead of a generic 500.

### Added

- OpenAPI 3 spec generated from code via springdoc (`/v3/api-docs`, `/swagger-ui.html`) - every controller now carries `@Tag`/`@Operation`/`@ApiResponses`/`@SecurityRequirement`. See `docs/quickstart.md` to get started.
- `docs/authentication.md`, `docs/errors.md` - the full JWT flow and the API-wide error contract, written from and cross-checked against the actual `GlobalExceptionHandler`/`SecurityConfig` behavior, not just the annotations.
- `.spectral.yaml` + `.github/workflows/openapi-lint.yml` - lints the generated spec on every PR that touches the backend (see `docs/interactive-docs-verification.md` for what's been verified about this workflow vs. what still needs a first live run).
- `llms.txt` (repo root) - curated entry point for LLM-assisted tooling/agents working against this API.

### Fixed

- `GlobalExceptionHandler` no longer leaks raw exception/database detail (table/column/constraint names, driver messages) into any API response - it was doing so on every unhandled or data-layer exception, API-wide. Server-side logging is unchanged.
- `JwtProperties.secretKey` now fails fast at startup if unset, instead of failing confusingly at first token use.
- Duplicate `operationId` collision (`UserController#updateUserDetails` / `RefereeController#updateUserDetails`, both defaulting to the same springdoc-generated `operationId`) resolved by setting explicit `operationId`s - no behavior change, fixes Swagger UI deep-linking and any future client codegen.

### Known issues (tracked, not fixed this round)

- JWT role claims are formatted inconsistently depending on which code path issues the token (`ROLE_`-prefixed vs. not) - see `docs/authentication.md`.
- `POST /users` has no self-registration guard for the `ARBITRO`/`CAPITAN` roles (only `ADMINISTRADOR` is bootstrap-limited) - a product decision, not a bug fix, per `REVIEW_NOTES.md`.
- No token revocation/logout - old tokens remain valid until natural expiry even after a password change.
