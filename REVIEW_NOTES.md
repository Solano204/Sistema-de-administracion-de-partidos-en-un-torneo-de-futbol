# Review Notes — Sistema de Administración de Partidos (Soccer Tournament Admin)

Full-stack: Spring Boot backend (hexagonal/clean architecture, PostgreSQL) + Next.js 15 frontend. Public GitHub repo. This is the newest addition to this review series and needed the most urgent attention of anything reviewed so far.

## CRITICAL, FIXED: unauthenticated full account takeover was live

`SecurityConfig.java`'s `authorizeHttpRequests` had `"/users/**"` and `"/auth/**"` **entirely** in `permitAll()` (with a telling `// "/**"` commented out just above it - evidence someone had briefly made *everything* public while testing and didn't fully revert). Combined with zero `@PreAuthorize` anywhere in `UserController`/`AuthController`, this meant, with no token at all:

- `PUT /auth/change-password/admin?username=<any>&newPassword=<anything>` reset **any account's password to anything**, no current-password check - including an existing admin's. This is the single most severe finding across every project reviewed this session.
- `GET /users?role=ADMINISTRADOR` listed every user with a given role.
- `DELETE /users/{userId}` deleted any account. `PUT /users/{userId}` and `PUT /users/photo` modified any account's details/photo. `PUT /users/{userId}/status` activated/suspended any account.
- `GET /users/get-user-details/{userId}` returned full details for any user by id.

**Fixed**, verified with a full offline Maven reactor build (`BUILD SUCCESS`) after each change:
- `SecurityConfig.java`: narrowed the public surface to exactly `POST /auth/login`, `POST /auth/refresh`, `POST /users` (self-registration - see below), `GET /users/exist-admin` (bootstrap UX check), and the standard actuator/swagger paths. Everything else now requires `.anyRequest().authenticated()`.
- Added `@PreAuthorize` to every `UserController`/`AuthController` method as defense in depth on top of the URL-level fix, so a future accidental route-pattern change can't silently reopen this again.
- Discovered and worked around a real, separate bug while doing this: `CommandHelperTokenProvider` issues role claims **inconsistently** depending on which flow mints the token - `generateDirectTokenResponse` (registration/photo-update) prepends `"ROLE_"`, but the normal `/auth/login` path (`loadUserByUsername` → `getAuthoritiesString`) does not. A plain `hasRole('ADMINISTRADOR')` would have silently 403'd a real admin who logged in normally. Used `hasRole('ADMINISTRADOR') or hasAuthority('ADMINISTRADOR')` everywhere as the safe form. **The real fix is making authority-building consistent in `CommandHelperTokenProvider`/`CommandHelperUser`** - flagged, not attempted blind in the same pass as an urgent auth fix, since getting that wrong risks locking out real admins.

**Flagged, not fixed - needs a product decision**: `POST /users` (self-registration) is intentionally still public because of a real chicken-and-egg problem - `CommandHelperUser.insertUser` has a one-time bootstrap guard (`"Admin already exist"`) *intended* to limit the `ADMINISTRADOR` role to a single initial signup (see the CRITICAL finding below - that guard turned out not to actually work). `UserRegisterRecord.role()` is a free-form string with **no equivalent guard for `ARBITRO` or `CAPITAN`** either way - anyone can self-register as a referee or team captain with no approval step. Whether that's intended (open signup for those roles) or should require existing-admin approval is a business decision this pass didn't guess at.

## CRITICAL, FIXED (unverified - see note): the admin bootstrap guard was dead code on both paths that use it

Found while writing `CommandHelperUserTest.java` in this session's testing-strategy pass, and missed by the earlier review above, which took the guard's presence at face value without tracing the actual types involved. In both `CommandHelperUser.insertUser()` (`POST /users`) and `CommandHelperUser.updateUserDetails()` (`PUT /users/{userId}`), the guard compared a `String` to the `UserRole` enum via `.equals()`:

```java
if (existAdmin(UserRole.ADMINISTRADOR) && refereeRecord.role().equals(UserRole.ADMINISTRADOR)) {
```

`refereeRecord.role()` (and `updatedDetails.role()` in the other method) returns a raw `String` - both `UserRegisterRecord.role` and `UserUpdateBasicInformation.role` are typed `String`, not `UserRole` (a leftover from an earlier refactor - `UserRegisterRecord.java` even has the old `UserRole role`-typed version commented out directly above the current one). `String#equals(Object)` returns `false` for any argument that isn't a `String`, so `refereeRecord.role().equals(UserRole.ADMINISTRADOR)` could **never evaluate to `true`**, for any input. The bootstrap guard was complete dead code on both paths.

**Practical impact**: anyone could self-register as `ADMINISTRADOR` via the public `POST /users` endpoint, or promote any account to `ADMINISTRADOR` via `PUT /users/{userId}`, at any time, unlimited times, regardless of whether an admin already existed - a live privilege-escalation vulnerability. Given `POST /users` is intentionally public (see above), this was reachable by anyone on the internet with no token at all, same blast radius as the original CRITICAL finding at the top of this document.

**Fixed and verified**: comparing `UserRole.ADMINISTRADOR.name()` against the raw string (String-to-String) in both locations. Originally left unverified pending a real `mvn test` run (see `TESTING-STRATEGY.md`) - that run has since happened (in a later pass) and `CommandHelperUserTest.java`'s `insertUser_adminAlreadyExists_requestingAdministradorRole_throwsUserException` and its sibling tests confirm the fix behaves as intended. That same run also caught an unrelated, separate, whole-module build breakage (a stray `java.lang.foreign.Linker` import poisoning Lombok processing across `soccer-dataacess`) - see `TESTING-STRATEGY.md`'s "Pass 2" section.

**Scope limit, stated explicitly**: fixing the critical bug meant every endpoint across the other ~10 business controllers (`TeamController`, `MatchController`, `PlayerController`, `RefereeController`, `CategoryController`, `CredentialController`, `DebtPlayerController`, `DebtTeamController`, `InscriptionController`, `RefereePaymentController`, `TournamentController`) now requires *some* authenticated user by default (via `.anyRequest().authenticated()`), which is a large improvement over "public to the entire internet." Fine-grained role checks on those (e.g., should a `CAPITAN` be able to delete a team, should a `JUGADOR` see payment/debt records) were **not** reviewed given the scope of this pass - they weren't reachable at all before, so this isn't a regression, but it's real remaining work.

## Fixed: `GlobalExceptionHandler` leaked raw exception/DB detail on every endpoint

This `@RestControllerAdvice` applies API-wide, not per-route. `handleDataIntegrityViolation`, `handleTransactionSystemException`, and `handleDataAccessException` all put the raw Postgres/transaction error message into a `details` field in the response body; `handleAllExceptions` (the catch-all `Exception.class` handler) put `ex.getMessage()` straight into the response for literally any unhandled exception anywhere in the app. Every handler already had a proper `log.error(...)` call server-side, so nothing about debuggability changed - only removed the leaked detail from what reaches the client. Verified with the same offline Maven build.

## Fixed: `JwtProperties` had no validation - a missing JWT secret would fail confusingly at first use, not at startup

Added `@Validated` + `@NotBlank` on `secretKey`, matching the fail-fast pattern already enforced on the equivalent secret in every other project reviewed this session. Required adding `spring-boot-starter-validation` to `common-domain`'s `pom.xml` (it wasn't a direct dependency there, only version-managed at the root) - caught this the hard way via a real compile failure, then fixed it and reconfirmed `BUILD SUCCESS`.

## Fixed: repo hygiene (public repo)

- Backend had **no `.gitignore` at all** - 49 files of Maven `target/` build output and `.env` (a real Supabase anon key, plus obviously-local `admin`/`1234` Postgres credentials and a self-labeled `"...do_not_use_in_production"` JWT secret) were tracked. Added a proper `.gitignore`, untracked all of it (kept locally), and de-duplicated `.env`'s content (the same block of variables was pasted in twice).
- `frontend/fut-next/github/workflows/` was missing the leading dot - GitHub never recognized this as a workflow directory, so **CI has never actually run once**, ever, on this repo. Fixed the path *and* the workflow itself (see below) - just fixing the path alone would have made a broken workflow start running.
- A stray empty git submodule reference (`Nueva carpeta/soccer-system (2)/soccer-system/soccer-system`, mode `160000`) was accidentally committed inside the frontend directory - almost certainly a drag-and-drop accident that dragged the backend's own `.git` along with it. Removed.
- `frontend/fut-next/an .npmrc` (literal filename, typo) was never actually being read by npm, so its `legacy-peer-deps=true` setting silently did nothing. Renamed to `.npmrc`.

## Fixed: the actual root cause of a broken CI pipeline (once the path was fixed)

`docker-build.yml` went straight from checkout to `docker build`, but the (consolidated) `Dockerfile` packages an **already-built** app - it never ran `next build` itself, deliberately, because this app has a real, extensively-documented memory problem building in Docker (`runs-on: ubuntu-latest # GitHub's runners have 7GB of RAM`, and 5 different Dockerfile variants plus `build:memory`/`build:windows`/`build:emergency` npm scripts requesting up to 16GB heap locally). Added the missing `npm ci` + `npm run build` steps to the workflow, on the runner directly rather than inside the Docker build.

## Fixed: 5 Dockerfiles → 1, and 2 concrete bugs in the surviving one

`Dockerfile`, `Dockerfile.debug`, `Dockerfile.prebuilt`, `Dockerfile.simple`, `Dockerfile.working` all existed simultaneously, and `docker-compose.prod.yml` referenced a **sixth**, `Dockerfile.prod`, which didn't exist anywhere - `docker compose -f docker-compose.prod.yml build` would have failed outright. Consolidated to one `Dockerfile` (the one both the fixed CI workflow and the fixed `docker-compose.prod.yml` now reference), and fixed two real bugs in it: `COPY ./.next/static ./.next/static 2>/dev/null || echo "..."` used shell redirection/fallback syntax on a `COPY` instruction, which isn't valid Dockerfile syntax (`COPY` is a build-engine directive, not a shell command) - replaced with a correct unconditional copy, since a successful `next build` with `output: 'standalone'` always produces `.next/static`. Also added a `HEALTHCHECK`, matching every other project reviewed this session.

## Confirmed already correct

- Every JPA query across `soccer-dataacess` (dozens, including several `nativeQuery = true` calls into real Postgres functions like `fut_jaguar.check_tournament_stage`) uses named parameters (`:param` + `@Param`) - checked every `@Query` annotation in the module, not a sample. No SQL injection surface found anywhere in this backend.
- Docker Compose's backend service (`docker-compose.yml` at the backend root) already pulls every credential/secret from `${VAR}` env-var interpolation with no hardcoded fallback in the compose file itself - the only place real-feeling values existed was the tracked `.env`, now fixed above.
- Passwords are BCrypt-hashed (`BCryptPasswordEncoder(12)`), and the `changePassword`/`changeUsername` self-service flows correctly require the caller's current password.

## Not reviewed this pass (explicit, not a silent gap)

Given the scale of the critical fix and everything downstream of it, the following weren't reviewed: fine-grained role authorization on the ~10 remaining business controllers (see above), the frontend's own `Authentication`/`UserManagment` components for how they consume the now-corrected auth model, backend test coverage (only 5 test files exist across the whole multi-module backend; frontend has zero), and the Supabase project's actual Row Level Security configuration (the anon key found in `.env` is meant to be public *if* RLS is configured correctly - that's a Supabase-dashboard setting, not something visible from this codebase; worth verifying directly).

## Postman collection

See `sistema-partidos.postman_collection.json` - covers auth (login, register, the now-fixed admin password reset), user management, and a representative sample of the business API (teams, matches) given the scale of the full controller set.
