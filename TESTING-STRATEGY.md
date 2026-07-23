# Testing strategy — Sistema de Administración de Partidos (backend)

Built per the "PROMPT MAESTRO — Construcción de una Estrategia de Testing Completa." Consolidates FASE 0-10.

**IMPORTANT - verification status**: per an explicit instruction partway through this pass, none of the test files below were run (`mvn test`/`mvn compile`) - they were authored, not executed. Everything here is written carefully and cross-checked against the real source it targets (exact method signatures, field types, DTO shapes all confirmed by reading the actual files, not assumed), but **run `mvn -pl soccer-domain/soccer-application-service,soccer-application -am test` before trusting any of it compiles or passes.** This is a real gap relative to the rest of this session's testing work (NAILS/BARBER's suites were both run and had real bugs caught by doing so) - treat this module's tests as a draft pending that first run.

## FASE 0 — Diagnostic

- **Stack**: Spring Boot 3.x, Java 21, 9-module Maven reactor. JUnit 5 + Mockito + AssertJ available via `spring-boot-starter-test` (already a dependency of `soccer-application` and `soccer-container`; added to `soccer-domain/soccer-application-service` in this pass - it had none before, despite containing the auth-critical `CommandHelperUser`/`CommandHelperTokenProvider` classes).
- **Existing testing before this pass**: exactly 5 test files, all identical empty `@SpringBootTest` `contextLoads()` placeholders (one per module, Spring Initializr defaults) - zero real coverage of any logic.
- **Highest-risk areas** (known precisely from this session's earlier security/documentation passes, not guessed): the JWT auth stack (`CommandHelperUser`, `CommandHelperTokenProvider`), `SecurityConfig`'s authorization matrix (site of the original critical unauthenticated-access vulnerability - see `REVIEW_NOTES.md`), `GlobalExceptionHandler`'s exception-to-status mapping (site of the 500-instead-of-401/400/404 bugs fixed during the OpenAPI documentation pass - see `docs/errors.md`), and the admin-bootstrap guard in `CommandHelperUser.insertUser`/`updateUserDetails` (see FASE 10's critical finding below). All four got tests first, ahead of any business/domain logic in the ~13 other controllers.

## FASE 1 — Pyramid vs. trophy

**Chosen: classic pyramid**, not the trophy shape used for NAILS/BARBER earlier in this pass - a deliberately different choice for a different codebase, not a default. Reasoning: unlike the two Firebase/Next.js apps, this backend has substantial *isolable* business/security logic - password verification rules, token validation, role-claim construction, exception classification - none of which needs a real HTTP request or database to exercise meaningfully. That's the textbook case for a heavy unit-test base (`CommandHelperUserTest`, `CommandHelperTokenProviderTest`, `GlobalExceptionHandlerTest`, all Mockito-isolated or pure), a moderate integration layer (`SecurityConfig`'s real authorization matrix, recommended below, not yet written), and a thin E2E/system layer (not attempted this pass - see FASE 8).

## FASE 2 — Test doubles used, and why each one

| Double | Where | Why this one |
|---|---|---|
| Mock (Mockito `@Mock`) | `UserRepository`, `PasswordEncoder`, `CommandHelperTokenProvider`, `UserMapperDomain`, `AuthenticationManager` in `CommandHelperUserTest` | Verifying `CommandHelperUser`'s own decisions (does it call `changeUserPassword`, does it throw before ever calling the repository) - interaction verification is exactly what these tests check. |
| Fake | `PlatformTransactionManager` (`NoOpTransactionManager`, a tiny 3-method inner class) in `CommandHelperUserTest` | `TransactionTemplate` needs to actually *invoke* the callback it's given to run the real `changePassword`/`changeUsername`/`insertUser` logic inside it - a Mockito mock of `PlatformTransactionManager` would need extensive `when(...)` stubbing to replicate that, while a 6-line real (if trivial) implementation does it naturally. Chosen over `@Mock` specifically because this dependency is used structurally (a callback-invoking collaborator), not as a single call to verify. |
| Stub | `WebRequest` in `GlobalExceptionHandlerTest` | Every handler needs *some* path string back from `getDescription(false)` - the tests check the resulting response shape, not how many times or in what order `WebRequest` was called. |
| None (real objects) | `JwtProperties`, `BadCredentialsException`, `DataIntegrityViolationException`, `TransactionSystemException`, `DataAccessResourceFailureException` in `CommandHelperTokenProviderTest`/`GlobalExceptionHandlerTest` | These are simple, fast, real Spring/JWT-library objects - constructing the real thing is cheaper and more honest than faking it, and there's no external I/O to isolate from. |

No dishonest mocks: nothing here fakes a return value that misrepresents what the real dependency would actually do (the `NoOpTransactionManager` genuinely runs the callback exactly once, matching real transactional behavior for these tests' purposes - it just skips real commit/rollback semantics, which none of these tests need).

## FASE 3 — Structure: AAA, naming, independence

- AAA followed throughout; explicit `// Arrange`/`// Act`/`// Assert` comments where the split isn't visually obvious from blank lines alone.
- Naming: `methodUnderTest_scenario_expectedResult` (e.g. `changePassword_wrongCurrentPassword_throwsUserExceptionAndNeverWrites`) - the idiomatic Java-ecosystem convention for this style of test, chosen (over a sentence style, unlike NAILS/BARBER) because these ARE narrowly-scoped single-method unit tests, where a method-first identifier reads better than a behavior sentence.
- Independence: `@ExtendWith(MockitoExtension.class)` + fresh `@Mock` fields per test class instance (JUnit 5 creates a new test instance per test method by default), so no hand-written `@BeforeEach` reset logic is needed for the mocks themselves - `@BeforeEach setUp()` only wires the fresh mocks into a fresh `CommandHelperUser`/`CommandHelperTokenProvider` instance.
- Edge cases covered: wrong password, same-as-old password, too-short password, non-existent user, username collision, token/userId mismatch, invalid/garbage/cross-key-signed tokens, suspended vs. active account status, both the ROLE_-prefixed and unprefixed authority-format code paths.

## FASE 4 — Mutation testing

**Not set up in this pass.** The JVM-ecosystem equivalent of Stryker (used for NAILS/BARBER) is PIT (`pitest-maven`). Given the explicit instruction to author, not execute, in this session's SISTEMA PARTIDOS work, and that PIT's real value only shows up by actually running it against a real compiled+tested module (exactly the two things this pass didn't do), setting up an unrun PIT config would be closer to theater than to FASE 4's actual intent. **Recommended next step, once the tests above are confirmed passing**: add `pitest-maven` scoped to `CommandHelperUser`/`CommandHelperTokenProvider`/`GlobalExceptionHandler` (mirroring the pilot-module approach used for NAILS/BARBER) and run it for real.

## FASE 5 — Test data

- No real data: every username/password/UUID/JWT secret in every test is an obviously-fake placeholder or freshly-generated `UUID.randomUUID()`.
- No real credentials: `TEST_SECRET` in `CommandHelperTokenProviderTest` is the same dev-only Base64 string already committed as the default in `application.yaml`/`.env` and used in this repo's own CI workflows - not a production secret, and already public in this codebase, not newly exposed by the test.
- Fixtures: `buildUser(...)` in `CommandHelperUserTest` is the one small factory method extracted so far (constructs a `User` with just the fields each test needs via the real `@SuperBuilder`). No dedicated fixtures package yet - the domain objects involved so far are simple enough that inline builder calls plus this one helper cover it; revisit if entity construction gets more complex as coverage expands to other controllers.

## FASE 6 — Flaky test audit

No flakiness sources present in what was written: no timing/`Thread.sleep` assumptions, no shared static/mutable state between test methods, no real network/database/filesystem access anywhere (everything is either a pure function, a Mockito double, or an in-memory JWT/crypto operation). Not yet confirmed by an actual repeated `mvn test` run, per the verification-status note at the top of this document.

## FASE 7 — Integration-level tests

**Not written in this pass** - the highest-value integration target is `SecurityConfig`'s real `authorizeHttpRequests` authorization matrix, tested via `@SpringBootTest(webEnvironment = MOCK) + @AutoConfigureMockMvc` with the repository/service layer `@MockBean`-stubbed (no real database needed) - a direct regression test for the original critical vulnerability in `REVIEW_NOTES.md` (every endpoint's actual public-vs-authenticated-vs-role-gated status, verified over real HTTP through the real filter chain, not just read from the config file). This is the single most valuable test not yet written for this project - flagged as the top FASE 10 priority below, deliberately not attempted blind in the same pass as the "don't execute" constraint, since a security-boundary integration test is exactly the kind of thing that must be run and observed passing before being trusted.

## FASE 8 — E2E / system tests

**Not implemented.** No Postman/Newman-driven or REST-Assured-driven live-server E2E suite exists yet (the Postman collection in this repo is a manual-use artifact, not wired into automated E2E). Recommended once the unit + `SecurityConfig` integration layers above are confirmed solid: a REST-Assured or Postman/Newman suite covering the real login → protected-resource → refresh flow against a running instance (Testcontainers Postgres), matching `docs/quickstart.md`'s documented golden path.

## FASE 9 — CI integration

`backend-pr.yml`/`backend-main.yml` (added in the earlier CI/CD hardening pass this session) already run `mvn -B test` across the full reactor with a real Postgres service container - the new test files above will run automatically the next time either workflow fires, with no further CI changes needed. Their very first real run **is** this project's first actual verification of everything in this document - watch it.

## FASE 10 — Consolidated checklist

**Done, this pass:**
1. Added `spring-boot-starter-test` to `soccer-domain/soccer-application-service` (was missing despite containing the most security-critical classes in the backend).
2. `CommandHelperTokenProviderTest.java` - 9 tests: token round-tripping, cross-key-signature rejection, and both halves of the documented `ROLE_`-prefix-vs-not role-claim-format inconsistency, pinned down explicitly so it can't silently drift further.
3. `CommandHelperUserTest.java` - 21 tests covering `loginUser`, `insertUser`'s bootstrap guard, `changePassword`/`changePasswordWithoutPassword`/`changeUsername`, `refreshToken`, and `loadUserByUsername`'s authority-building (the other half of the role-claim inconsistency).
4. `GlobalExceptionHandlerTest.java` - 16 tests, the direct regression suite for every exception-to-status-code fix made during the earlier OpenAPI documentation pass this session (500→401/400/404), plus explicit assertions that raw driver/exception detail never reaches a response body.
5. **Found and fixed a real, critical, previously-undiscovered vulnerability while writing `CommandHelperUserTest`**: the "only one ADMINISTRADOR can self-register" bootstrap guard, in **both** `CommandHelperUser.insertUser()` (`POST /users`) and `CommandHelperUser.updateUserDetails()` (`PUT /users/{userId}`), compared a `String` (`UserRegisterRecord.role()` / `UserUpdateBasicInformation.role()` - both raw `String` fields, not the `UserRole` enum) to the `UserRole` enum via `.equals()`. `String#equals(Object)` returns `false` for any non-`String` argument, so this condition could **never** evaluate `true` - the guard was complete dead code on both paths. Practical impact: **any caller could self-register as `ADMINISTRADOR` via the public `POST /users` endpoint, or promote any account to `ADMINISTRADOR` via `PUT /users/{userId}`, at any time, unlimited times, regardless of whether an admin already existed** - a live privilege-escalation vulnerability, comparable in severity to the unauthenticated-access issue already fixed and documented in `REVIEW_NOTES.md`. Fixed by comparing `UserRole.ADMINISTRADOR.name()` against the raw string (String-to-String) in both locations. **Not verified with `mvn compile`/`mvn test`** - the regression tests in `CommandHelperUserTest` (`insertUser_adminAlreadyExists_requestingAdministradorRole_throwsUserException` and friends) exercise this exact fix and will confirm it on the first real run; until then, treat this as an urgent, unverified hotfix, not a closed issue.

**Not done, explicitly flagged (priority order):**
1. ~~Run `mvn test` and fix whatever doesn't compile/pass on the first try~~ **Done in pass 2, see below.**
2. ~~Add the `SecurityConfig` MockMvc integration test (FASE 7)~~ **Done in pass 2, see below.**
3. Add this critical fix to `REVIEW_NOTES.md`/`CHANGELOG.md` alongside the earlier findings.
4. Mutation testing (PIT) pilot on the three classes covered above (FASE 4), once their tests are confirmed passing.
5. E2E/system suite (FASE 8).
6. ~~Extend unit coverage to the remaining ~13 business controllers~~ **CommandHelper layer done in pass 2 (see below); CommandHandler/ApplicationServiceImpl/Controller layers and soccer-dataacess mappers/adapters still pending.**

## Pass 2 — verification + CommandHelper-layer coverage

**Verified `mvn test` for real** (per item 1 above), and it did NOT pass on the first try - three real, previously-undiscovered bugs surfaced and were fixed:

1. **Build-breaking, whole-module bug**: a stray, unused `import java.lang.foreign.Linker.Option;` (present in 4 files across `soccer-application-service` and `soccer-dataacess` - `TeamRepository.java`, `UserRepository.java`, `PlayerDebtRepository.java`, `MatchRepositoryData.java`) was poisoning Lombok annotation processing for the **entire** `soccer-dataacess` module, cascading into ~150 unrelated "cannot find symbol" compile errors across mappers/repositories/entities. That module could never have compiled. Someone had "fixed" the resulting preview-API compile error by adding `--enable-preview` to the root `pom.xml`'s `maven-compiler-plugin` (a duplicate plugin block) instead of removing the bad import - removed both the dead imports and the duplicate plugin block.
2. `GlobalExceptionHandlerTest.java` failed to compile: `MatchException` was ambiguous between the app's own exception and JDK 21's new `java.lang.MatchException`, via a wildcard import. Fixed with an explicit import.
3. `CommandHelperUserTest.loadUserByUsername_existingUser_buildsAuthorityWithNoRolePrefix` was missing its `userRepository` stub, so it never actually tested what it claimed. Fixed.

Also deleted 4 dead `@SpringBootTest contextLoads` placeholders left in non-bootable library modules (`common`, `common/common-domain`, `soccer-application`, `soccer-dataacess` - none of these have their own `@SpringBootApplication`, so the test could never pass), and replaced an empty test file in `common-domain` with a real `JwtPropertiesTest` (5 tests covering the `@NotBlank` secret-key validation fix). All 52 real unit tests now pass. `soccer-container`'s own `contextLoads` (the one module that legitimately has a `@SpringBootApplication`) still needs a real Postgres or an H2/test-profile setup to run standalone - not attempted this pass.

**`SecurityConfigIntegrationTest.java`** (13 tests) - the FASE 7 test, as a `@WebMvcTest` slice over all 13 controllers with the real `SecurityConfig`/`JwtAuthenticationFilter`/`JwtAuthenticationEntryPoint` wired in and every `*ApplicationService` input port `@MockBean`-stubbed, so no database is needed at all. Covers: public endpoints are never blocked; every protected endpoint 401s with no token (including `PUT /auth/change-password/admin`, the original critical finding); a valid token gets past the filter chain; non-admins get 403 on admin-gated routes; and specifically that an ADMINISTRADOR token minted via either the registration flow (`ROLE_`-prefixed) or the login flow (unprefixed) passes the `hasRole()`/`hasAuthority()` dual check - a direct regression test for the documented role-claim-format inconsistency. **Authored, not run**, per this pass's own instruction (mirrors pass 1's constraint) - the JWT-filter stub re-implements `CommandHelperUser.handleJwtAuthentication`'s exact logic against a real `CommandHelperTokenProvider`, cross-checked against that source, but not yet executed.

**CommandHelper-layer unit tests added** for every remaining business domain (11 classes, ~60 tests, all Mockito-isolated, AAA, `methodUnderTest_scenario_expectedResult` naming, same style as pass 1): `CommandHelperTeamTest`, `CommandHelperMatchTest`, `CommandHelperPlayerTest` (these three have real validation/sorting logic - category/team-existence guards, points-descending sort - and got the deepest coverage); `CommandHelperCategoryTest`, `CommandHelperCredentialTest`, `CommandHelperDebtPlayerTest`, `CommandHelperDebtTeamTest`, `CommandHelperInscriptionTest`, `CommandHelperRefereePaymentTest`, `CommandHelperRefereeTest`, `CommandHelperTournamentTest` (thinner repository+mapper delegation - covered for the throw-on-empty/delegation behavior itself, not padded with redundant cases). **Also authored, not run.**

**Found, not fixed - flagged for a human decision**: `CommandHelperMatchStats.java` is entirely commented-out dead code referencing a package structure (`com.soccer.fut7.soccer_system.Entity.*`, `com.soccer.fut7.soccer_system.exception.*`) that no longer exists in this codebase - it predates the `EntityApplication`/`ExceptionApplication` rename. `MatchStatsApplicationService`/`MatchStatsRepository` exist as port interfaces but this looks like an orphaned, superseded implementation attempt. Not deleted or resurrected in this pass since that's a production-code judgment call, not a test-writing one.

**Not done, still pending after pass 2:**
1. CommandHandler layer (thin wrappers one level above CommandHelper - e.g. `CommandHandlerCategory`, `CommandHandlerMatch`, etc.), ApplicationServiceImpl layer, and the 11 remaining Controllers (beyond the security-matrix coverage `SecurityConfigIntegrationTest` already gives them).
2. `soccer-dataacess` mappers/adapters (mapping logic between JPA entities and domain entities - some of these, e.g. `TeamMapper`/`PlayerMapper`, have real conversion logic worth testing).
3. Domain entities/value objects with real behavior (as opposed to plain data holders).
4. Frontend (`frontend/fut-next`) - zero tests exist.
5. Run the full suite for real and fix whatever doesn't pass (same caveat as pass 1, now compounding across two passes of unrun tests).

## Pass 3 — Controller layer + a deliberate scope cut

**All 13 REST controllers now have unit tests** (pure Mockito, no Spring context - same style as `GlobalExceptionHandlerTest`: construct the controller directly via its Lombok-generated all-args constructor, mock the `*ApplicationService` it depends on, call methods directly). Deepest coverage on the two controllers with real logic of their own: `TournamentController` (hand-rolled date-range validation - null/empty check, ISO parse with try/catch, start-after-end check - plus a `String`→`UUID` conversion and a hardcoded status) and `CredentialController`/`InscriptionController` (null-check-then-404/400 branching that every other controller here doesn't have, since their service layer returns `null` rather than throwing). The other 9 controllers are close to pure delegation, so their tests confirm argument order and `ResponseEntity` status codes (200 vs 201 vs 204) rather than re-testing business logic already covered at the `CommandHelper` layer.

**Deliberate scope cut, not an oversight**: the `CommandHandler` layer (e.g. `CommandHandlerCategory`) and `ApplicationServiceImpl` layer (e.g. `CategoryApplicationServiceImpl`) were read in full and found to be **pure 1:1 delegation with zero branching** - every method is exactly `return commandHelperX.method(args);`. Testing these would mean two more Mockito-verify-style test files per domain (26 more files total) whose only possible failure mode (wrong method/argument) is already caught by the compiler (interface implementation) or by a `CommandHelperXTest`/`XControllerTest` at either end of the same call chain. Skipped in favor of spending the same effort on the controller layer (real HTTP contract) and `soccer-dataacess` (real mapping logic) instead - matches this session's existing "don't pad thin delegation with redundant tests" restraint (see pass 2's `CommandHelperTournamentTest` for the same call).

**Not done, still pending after pass 3:**
1. `soccer-dataacess` mappers/adapters.
2. Domain entities/value objects with real behavior.
3. Frontend (`frontend/fut-next`) - zero tests exist.
4. Run the full suite for real (now three passes of unrun tests compounding - see pass 2's caveat).

## Pass 4 — soccer-dataacess mappers (started)

`soccer-dataacess` had **no test dependency at all** (`spring-boot-starter-test` missing from its own `pom.xml`) - added it, same gap-class as pass 2's `common-domain` fix.

Triaged all 16 files in `team/mapper` by size and conditional-branch density before writing anything (`BaseMapper`/`EntityMapper` are trivial; `CredentialMapper`/`InscriptionMapper` have zero branches; `PlayerMapper` at 329 lines/46 branches and `TeamMapper` at 122/21 are the outliers). Wrote full test coverage for those two:

- **`TeamMapperTest`** - found two real issues: (1) `toEntityWithPlayers` has no null-safety on `name`/`logo` unlike its sibling `toEntity`, which does - an NPE risk, documented as current behavior, not changed (a call-site problem, not obviously this method's bug to unilaterally fix). (2) `toTeamStats` wraps `entity.getId()` in `new TeamStatsId(...)`, whose compact constructor throws on null - so mapping a not-yet-persisted `TeamStatsEntity` throws. Also documented, not changed - same reasoning.
- **`PlayerMapperTest`** - **found and fixed a real, previously-undiscovered data-loss bug**: `toEntity`'s `playerStatus` handling was `if (domain.getPlayerStatus() == null) { builder.playerStatus(ACTIVO) }` with **no branch at all for the non-null case** - every other nullable field in this same method correctly follows "if present, copy it," but this one silently dropped any real, non-default status (`LESIONADO`/`INACTIVO`) every time a player entity was built from its domain object, always reverting to whatever the builder's default was. Fixed by adding the missing branch; `toEntity_playerStatusIsSet_isCarriedThroughNotDropped` is the direct regression test.

Both test files use the same technique for `BaseMapper`'s Spring-context-based collaborator lookup (`getMapper(...)`): the test class lives in the exact same package as the mapper under test so it can set the inherited `protected ApplicationContext applicationContext` field directly and stub `getBean(...)`, instead of needing a real Spring context.

**Not done, still pending after pass 4:**
1. The other 12 `soccer-dataacess` mappers (lower branch-density; `CategoryMapper`, `UserMapper`, `MatchMapper`/`MatchMapperProjection` are the next-highest-value if this continues).
2. All 13 dataaccess adapters (`ports/outport` implementations - thin JPA-repository delegation, not yet triaged for real logic vs. pass-through).
3. Domain entities/value objects with real behavior.
4. Frontend (`frontend/fut-next`) - zero tests exist.
5. Run the full suite for real (four passes of unrun tests now compounding).

## Pass 4 continued — CategoryMapper, UserMapper, MatchMapper, PlayerDebtMapper, TeamDebtMapper

7 of 16 `team/mapper` files now covered (the two highest-density ones from the original triage, `TeamMapper`/`PlayerMapper`, plus these five). Two more real findings, both documented rather than silently changed (neither is as unambiguous as `PlayerMapper`'s inverted-if):

- **`CategoryMapper.toEntity`** has zero null-safety on `name`/`ageRange` (NPEs if either is missing) - relies entirely on `CategoryInfoRecord`'s `@NotNull`/`@Valid` guaranteeing both are present by the time a `Category` reaches this mapper.
- **`UserMapper.toEntity`** (no-password variant) never sets `.age(...)` on the builder, while its sibling `toEntityWithPassword` does - so a caller persisting a user via the no-password path silently loses the age value every time. Not fixed: unclear from this mapper alone whether every `toEntity` call site is followed by a separate age-preserving update (which would make this intentional), unlike `PlayerMapper`'s bug where no such explanation was possible.
- **`MatchMapper.toDomain`** calls `entity.getJourney().getJourneyNumber()` with no null-check on `getJourney()` itself (`journey_id` has no `nullable=false`) - a live NPE risk if a match is ever read back before a journey is assigned. Documented, not changed, same reasoning as the two above.
- Also confirmed (not a mapper bug, a domain-design fact worth knowing): `Money`'s compact constructor **unconditionally forces currency to `"MXN"`** regardless of what's passed in, including whatever a debt entity's `currency` column actually stores (which defaults to `"USD"` at the JPA level) - every `PlayerDebtMapper`/`TeamDebtMapper` test above pins this down explicitly so it doesn't look like a test mistake later.

`MatchMapper.convertToCustomMatchDetails`/`mapMatchesWithStats` (raw-native-query row-unpacking helpers needing several more repository mocks each) were left uncovered - lower marginal value for the effort versus the two `BaseMapper`-routed methods.

**Not done, still pending:**
1. `RefereePaymentMapper`, `TeamStatsMapper`, `PlayerStatsMapper`, `TournamentMapper`, `MatchMapperProjection`, `CredentialMapper`, `InscriptionMapper` (9 mapper files remaining, all lower branch-density than what's covered).
2. All 13 dataaccess adapters.
3. Domain entities/value objects with real behavior.
4. Frontend - zero tests exist.
5. Run the full suite for real.

## Pass 4 complete — all 16 `team/mapper` files now covered

Finished the remaining 7: `RefereePaymentMapper`, `TeamStatsMapper`, `PlayerStatsMapper`, `TournamentMapper`, `MatchMapperProjection`, `CredentialMapper`, `InscriptionMapper`. (`BaseMapper`/`EntityMapper` are trivial infrastructure - a 3-line ApplicationContext-lookup helper and a bare interface - correctly left untested.) 14 mapper test files total for this pass.

More findings, all documented rather than changed (same reasoning throughout: none is as unambiguous as `PlayerMapper`'s inverted-if, each needs broader call-site knowledge this mapper package alone doesn't have):

- **`CredentialMapper` and `InscriptionMapper`** are the only two mappers in the whole package with **no null-guard at all** - every other one starts `if (x == null) return null`; these two go straight to `.getId()`, so a null argument throws instead of returning null.
- **`TournamentMapper.toEntity`** hardcodes `currentPhase`/`status` to `"ROUND_ROBIN"`/`"ACTIVO"` regardless of the domain object's actual state, and generates a fresh random UUID whenever `domain.getId()` is null (calling it twice for the same not-yet-persisted tournament produces two different ids) - fine for initial creation, would silently reset an in-progress tournament's phase/status if ever reused for updates.
- **`TeamStatsMapper`** duplicates `TeamMapper.toTeamStats`'s logic as an independent, separately-testable class doing the same `TeamStatsEntity`<->`TeamStats` conversion - not consolidated, just flagged.
- **`PlayerStatsMapper.toEntity`** delegates the player reference through `PlayerMapper`'s *full* `toEntity(Player)` mapping, while the structurally similar `TeamStatsMapper.toEntity` uses `TeamMapper`'s bare `UUIDtoEntity` shell reference for the same kind of parent-reference field - an asymmetry between two otherwise-parallel classes.
- **`RefereePaymentMapper.toDomainWithReferee`** never sets `.id(...)` on the builder (only `.idPayment(...)`), unlike its sibling `toDomain`, which sets both to the same value.

**Not done, still pending - all of `soccer-dataacess` mapper package is done:**
1. All 13 dataaccess adapters (`ports/outport` implementations).
2. Domain entities/value objects with real behavior.
3. Frontend (`frontend/fut-next`) - zero tests exist.
4. Run the full suite for real (unrun tests now compounding across four full passes).

## Pass 5 — dataaccess adapters (started)

Triaged all 13 `team/adapter` files by size/branch-density. `MatchAdapter` is by far the largest and most complex file in the entire `soccer-dataacess` module (484 lines, 8 injected collaborators, ~26 conditional constructs) - an order of magnitude bigger than anything covered so far, including `PlayerMapper`.

**`MatchAdapterTest`** covers only `createMatch` (self-contained validation: both teams must exist, both must share a category - only 2 of the 8 collaborators involved) and `updateMatchStatus` (trivial delegation). The other ~350 lines (`updateMatchStats` and its two `enrichMatchWith[out]Stats` helpers) need a much larger fixture graph spanning most of the other 6 collaborators for comparatively lower marginal coverage per line - explicitly left for a dedicated future pass rather than rushed.

**Found, not fixed - a real, live NPE risk**: both `enrichMatchWithStats` and `enrichMatchWithoutStats` fetch `homeTeamStats`/`awayTeamStats` via `.findFirst().orElse(null)` and then immediately call `.getGoals()` on the result with **no null-check in between** - a match with no `TeamMatchStatsEntity` row yet for one of its teams (e.g. immediately after creation, before either team's cumulative stats exist) would NPE here. Not fixed: the right behavior (skip enrichment? default to zero?) is a product decision, not something to guess at while writing tests.

**Not done, still pending:**
1. The other 12 dataaccess adapters (`UserAdapter` at 192 lines/9 conditionals and `PlayerAdapter` at 183/5 are the next-highest-value; `CategoryAdapter`/`CredentialAdapter`/`InscriptionAdapter`/`MatchStatsAdapter`/`PlayerStatsAdapter`/`RefereeAdapter`/`TournamentAdapter` all have zero branches per the triage and are lower priority).
2. The rest of `MatchAdapter` itself (`updateMatchStats` and the two enrich helpers).
3. Domain entities/value objects with real behavior.
4. Frontend - zero tests exist.
5. Run the full suite for real.

## Pass 5 continued — UserAdapter, PlayerAdapter

**`UserAdapterTest`** - the highest-value finding of this entire testing pass, security-relevant like FASE 0/10's original scope:

- **`UserAdapter.loginUser` is completely broken, confirmed DEAD CODE** (grepped all of `soccer-application-service` - nothing calls `UserRepository.loginUser`; the real login path is `CommandHelperUser.loginUser` via Spring Security's `AuthenticationManager`, an entirely separate code path). If it were ever wired up: it chains two `.filter()`s - the first correctly does `passwordEncoder.matches(password, user.getPasswordHash())`, but the second does `user.getPasswordHash().equals(password)`, comparing a BCrypt hash directly against raw plaintext via `String#equals()` - which can never be `true`. Every login attempt through this method, even with the exactly correct password, returns `Optional.empty()`. Documented and regression-tested as a known trap (not fixed - it's unreachable, so "fixing" dead code isn't the priority; flagging it so nobody tries to wire it up assuming it works).
- **`changeUserPassword`'s second `.filter()`** computes `user.getPasswordHash().equals(currentPassword)` and throws the result away, unconditionally `return true` - a complete no-op.
- **Checked, NOT a plaintext-password bug** (verified against `CommandHelperUserTest`, not assumed): `changeUserPassword`/`changePasswordWithoutPassword` skip `passwordEncoder.encode(newPassword)` (commented out) - correct, because `CommandHelperUser` (the only real caller, confirmed via the earlier pass's tests) already encodes the password one layer up before calling into this adapter. Encoding again here would double-hash it. Pinned down as an explicit "no re-encoding" contract test so this isn't "fixed" into a double-encoding bug later by someone who doesn't know the contract.
- Also covered: `updateBasicInformation`'s field-by-field partial-update logic (only overwrites a field when the new value is non-null/non-empty; confirmed an empty-string first name does NOT clear the existing one) and `getAllUser`'s empty-list-becomes-`Optional.empty()` (not `Optional.of(emptyList())`) conversion.

**`PlayerAdapterTest`** - covers `registerPlayerWithBasicInfo`'s single-team existence check and `registerBatchPlayerWithBasicInfo`'s count-based validation (compares distinct-team-id count against `findAllById(...)`'s result count - pinned down including its actual blind spot: it can tell you a team is missing, never *which* one). The other two structurally-identical batch methods (`registerBatchPlayersWithBasicInfoWithoutTeam`, `updateBatchPlayerInformation`) share the exact same validation shape and were not each re-tested separately.

**Not done, still pending:**
1. The other 11 dataaccess adapters (all lower branch-density per the triage: `RefereePaymentAdapter` 122/5, `DebtPlayerAdapter`/`DebtTeamAdapter` ~90/2 each, `TeamAdapter` 130/1, rest at 0 branches).
2. The rest of `MatchAdapter` (`updateMatchStats` and the two enrich helpers).
3. Domain entities/value objects with real behavior.
4. Frontend - zero tests exist.
5. Run the full suite for real.

## Pass 5 complete — adapter layer

Covered `DebtPlayerAdapter`/`DebtTeamAdapter` (team/player-existence gate before insert/update - both isomorphic to their `*DebtMapper` siblings), `TeamAdapter` (category-existence gate on `createTeam`/`updateTeamByCategory` - found `createTeam` silently returns `Optional.empty()` on a missing category while `updateTeamByCategory` explicitly throws `IllegalArgumentException` for the same situation, an inconsistency pinned down via the two tests' names rather than "fixed" into consistency, since which behavior is correct is a caller-contract decision), and `RefereePaymentAdapter` (`updateOrInsert` is the one method in the whole adapter layer with genuine branch-on-existing-data logic - it only treats a same-id lookup as "the same payment" if it *also* matches the same `matchId`; all three branches, including the "found but different match still inserts" edge case, are covered).

**Two adapters found to be effectively non-functional, neither fixed - both are "does this feature exist at all" product questions, not test-writing ones:**

- **`MatchStatsAdapter`** implements `MatchStatsRepository` but has **no `@Component` annotation** (so it's never registered as a Spring bean) and **every single method unconditionally throws `UnsupportedOperationException`**. If anything ever tries to `@Autowired` a `MatchStatsRepository`, the application either fails to start (no bean found) or throws immediately on first call. Not tested (asserting "every method throws" is technically possible but is closer to documenting an admitted stub than finding a bug) - flagged instead.
- **`PlayerStatsAdapter`** is **entirely commented out**, same as `CommandHelperMatchStats.java` from pass 2 (references the same stale `com.soccer.fut7.soccer_system.Entity.*`/`.exception.*` package structure that predates the `EntityApplication`/`ExceptionApplication` rename). No class exists to test. `PlayerMatchStatsRepository` (the port) has zero implementations anywhere in the codebase.

**Deliberately not given individual test files** (matches this pass's own restraint elsewhere - e.g. `CommandHandler`/`ApplicationServiceImpl` layers, `CommandHelperTournament`): `CategoryAdapter`, `CredentialAdapter`, `InscriptionAdapter`, `RefereeAdapter`, `TournamentAdapter` - all zero-conditional pure pass-through per the triage, already exercised structurally by their sibling `*Mapper`/`*CommandHelperRepository` classes' own tests.

**This closes out the `soccer-dataacess` module for this pass.** Total for passes 4+5: 21 new test files (14 mappers + 7 adapters), 3 real bugs fixed (`PlayerMapper` status-drop, the two pom/import fixes from pass 2), 2 confirmed-non-functional features found (`MatchStatsAdapter`, `PlayerStatsAdapter`), and roughly a dozen smaller documented inconsistencies across mappers/adapters.

**Not done, still pending for the whole SISTEMA PARTIDOS backend:**
1. `MatchAdapter.updateMatchStats` + its two enrich helpers (the ~350 remaining lines of the module's largest file).
2. Domain entities/value objects (`soccer-domain-core`) with real behavior - not yet started.
3. Frontend (`frontend/fut-next`) - zero tests exist.
4. Run the full suite for real - five full passes of unrun tests now compounding.

## Pass 6 — soccer-domain-core (domain entities/value objects)

`soccer-domain-core` had **no test dependency at all** either (missing `spring-boot-starter-test`) - same gap-class as `common-domain` and `soccer-dataacess` in earlier passes, fixed the same way.

Covered the value objects and entity methods with real behavior (most VOs in this module - `TeamName`, `CategoryName`, `AgeRange`, `Email`, `JerseyNumber`, `Goals`, `Points`, `Cards`, `UserCredentials`, `MatchDate`/`DebtDate`/`PaymentDate`/`BirthDate` - are plain unvalidated wrapper records, correctly left untested per this pass's established restraint):

- **`MoneyTest`** - the fullest VO test of this pass: confirms the compact constructor silently overrides ANY requested currency to MXN (already flagged in pass 4 as relevant to the `*DebtMapper` classes), rejects negative/null amounts, and rounds (doesn't reject) amounts with more than 2 decimal places using `HALF_EVEN`. Also covers `add`/`subtract`/`multiply`'s own guards.
- **`PhoneNumberTest`** - real regex validation (`^\+?[0-9]{10,15}$`), though note this VO is imported by `User.java` but never actually used as a field there (a dead import) - no entity in this backend currently has a live `PhoneNumber` field.
- **`TeamStatsIdTest`** - the compact-constructor null-check that's the actual root cause of `TeamMapper.toTeamStats`/`TeamStatsMapper.toDomain` throwing on a not-yet-persisted `TeamStatsEntity` (see pass 4).
- **`DomainServiceImpTest`** - found, not fixed: `DomainService.setPlayersTeam` is never called anywhere in the backend (dead), AND its own implementation doesn't do what its name promises even taken at face value - it validates its arguments and returns, never actually calling `player.setTeam(team)` for anything. Tested to pin down exactly that gap.
- **`DebtValidationMethodsTest`** - found, not fixed: `Debt.validateDebt()`/`PlayerDebt.validatePlayerDebt()`/`TeamDebt.validateTeamDebt()`/`RefereePayment.validateRefereePayment()` are all declared but **never called from anywhere** - no `SuperBuilder` hook, no service-layer call. A `PlayerDebt` with a null status, or a `RefereePayment` whose amount doesn't match `hoursWorked * hourlyRate`, can currently be built and persisted without any of these guards ever firing. Each method's real logic is tested by calling it directly (same-package access to the `protected` methods) - this documents exactly what protection exists *if* something is ever wired to call them, which reads like the actual intended fix.

**Also found, pure repo hygiene, not touched**: a stray file named `ds` (no `.java` extension, so Maven silently ignores it - doesn't affect compilation) sits inside `EntityApplication/`, containing what looks like an old/abandoned version of several entity classes concatenated together (a `Category` with different fields than the current one, references to a `validateId()` method that doesn't exist in the current `AggregateRoot`). Harmless to the build, but worth deleting as portfolio cleanup - not done here since deleting isn't a test-writing action.

**This closes out the meaningful, testable surface of `soccer-domain-core` for this pass.**

**Not done, still pending for the whole SISTEMA PARTIDOS backend:**
1. `MatchAdapter.updateMatchStats` + its two enrich helpers.
2. Frontend (`frontend/fut-next`) - zero tests exist.
3. Run the full suite for real - six full passes of unrun tests now compounding.
