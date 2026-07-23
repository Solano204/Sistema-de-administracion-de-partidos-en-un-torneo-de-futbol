# Interactive docs verification

Swagger UI is served at `/swagger-ui.html` (redirects to `/swagger-ui/index.html`) once the app is running, backed by the live spec at `/v3/api-docs` (both configured in `application.yaml`'s `springdoc:` block).

## What was verified statically (this pass)

Every environment this documentation work ran in has no permission to start the Spring app or any Docker service, so nothing below could be confirmed against a running server or an actual browser session of Swagger UI. What could be verified without running anything:

- **`mvn compile` on the full 9-module reactor succeeds** after every annotation/exception-handler change in this pass (last run: `BUILD SUCCESS`, all modules). This proves the annotations are syntactically valid and the app compiles - it does not prove the spec renders correctly or that "Try it out" works.
- **Every `@RestController` has a `@Tag`** (13/13 - checked by grepping for `@RestController` and cross-checking `@Tag` presence on each match).
- **No duplicate `operationId`s.** Found one real collision: `UserController` and `RefereeController` both had a method literally named `updateUserDetails` - springdoc's default `operationId` is the method name, so both would have generated the same `operationId` in the spec. Swagger UI's deep-linking and any codegen tooling (openapi-generator, etc.) both require unique operationIds; a collision like this either causes one to be silently renamed with a numeric suffix by springdoc (version-dependent, not something to rely on) or breaks codegen outright. Fixed by setting explicit `operationId = "updateUserDetails"` / `operationId = "updateRefereeDetails"` on the two `@Operation` annotations - no behavior change, purely disambiguates the generated spec. This exact class of bug is also what `.spectral.yaml`'s (default, not overridden) `operation-operationId-unique` rule exists to catch in CI going forward.

## What still needs a live check (first person to run this, please do these and delete this section once done)

1. `docker compose up -d postgres backend` (or run `soccer-container`'s jar directly against a local Postgres).
2. Open `http://localhost:8080/swagger-ui.html`. Confirm:
   - All 13 tags appear (Auth, Users, Categories, Teams, Players, Referees, Referee Payments, Player Debts, Team Debts, Credentials, Inscriptions, Matches, Tournaments) and each expands to the expected endpoint count.
   - The `Authorize` button prompts for a Bearer token and applies it to every subsequent "Try it out" call.
3. Cross-check at least 3 endpoints end-to-end through the UI (per this documentation prompt's own verification checklist) - the natural three, since they chain:
   - `POST /auth/login` - confirm the example request body in the UI matches what actually works, and the response actually contains `accessToken`/`refreshToken`/`roles` as documented in `docs/authentication.md`.
   - `POST /categories` with the token from step above - confirm 200 and the response shape matches `docs/quickstart.md`'s example.
   - `GET /categories/{categoryId}` with a nonexistent UUID - confirm the 404 body matches the envelope documented in `docs/errors.md` (`{timestamp, status, error, message, path}`, `message: "Category not found"`).
4. While there, spot-check one of the two documented envelope deviations for real: `POST /auth/refresh` with a garbage `refreshToken` should come back 400 with an **empty body** - confirm Swagger UI shows that correctly rather than an error parsing an expected-but-missing JSON response.
5. If any of the above doesn't match what's written in `docs/quickstart.md`, `docs/authentication.md`, or `docs/errors.md`, that's a documentation bug - fix the doc, not the other way around, unless the live behavior is itself wrong (in which case, same rule as everywhere else in this pass: fix the code, then re-verify, then update the doc to match).
