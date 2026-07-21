# Errors

## The envelope

Almost every error response in this API - except the two deviations called out below - is a `@RestControllerAdvice` (`GlobalExceptionHandler`) response shaped like this:

```json
{
  "timestamp": "2026-07-18T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Category not found",
  "path": "/categories/b3f1a2c4-1234-4a5b-8c9d-000000000001"
}
```

`message` is always a short, static, human-readable string - never a raw driver/SQL/stack-trace message (that was a real bug, fixed and documented in `REVIEW_NOTES.md`: earlier versions of this handler leaked Postgres constraint names and internal exception text straight into API responses).

## Status code → cause, API-wide

| Status | When | Adds |
|---|---|---|
| 400 | Bean validation failed (`@Valid`/`@NotBlank`/etc. on a request body) | `errors: { field: message, ... }` map of every failing field |
| 400 | `@Validated` path/query param constraint failed (`@NotNull` on a `@PathVariable`/`@RequestParam`) | `errors: { paramPath: message }` map |
| 400 | A domain business rule was violated - see table below for which exception types | - |
| 401 | Login failed (`POST /auth/login` only) - wrong password or unknown username | - |
| 401 | Missing, malformed, or expired Bearer token on a protected endpoint | - |
| 403 | Valid token, but the caller's role doesn't satisfy the endpoint's `@PreAuthorize` | (default Spring Security 403, no custom body) |
| 404 | A domain "this specific resource doesn't exist" exception - see table below | - |
| 409 | Postgres foreign-key or unique-constraint violation (`DataIntegrityViolationException`) | `code: "FOREIGN_KEY_VIOLATION"` or `"UNIQUE_CONSTRAINT_VIOLATION"` |
| 503 | Database unreachable / other `DataAccessException` | - |
| 500 | Anything not explicitly mapped | generic `"An unexpected error occurred"` - never the real exception message |

## Domain exception → status code

Every controller method that isn't a pure CRUD lookup throws one of these on failure. This table is the actual `@ExceptionHandler` grouping in `GlobalExceptionHandler.java`, not a per-endpoint guess:

| Exception | Status | Used by |
|---|---|---|
| `categoryException` | 404 | `CategoryController` |
| `teamException` | 404 | `TeamController` |
| `PlayerStatsException` | 404 | Match/player stats updates (`MatchController#updateMatchStats`, `PlayerController#updatePlayerPositionStats`) |
| `DebtException` | 400 | `DebtPlayerController`, `DebtTeamController` |
| `MatchException` | 400 | `MatchController` |
| `PlayerException` | 400 | `PlayerController` |
| `RefereePaymentException` | 400 | `RefereePaymentController` |
| `TournamentException` | 400 | `TournamentController` |
| `UserException` | 400 | `UserController`, `AuthController`, `RefereeController` (shared user-account logic) |
| `TokenException` | 400 | `AuthController#refreshToken` internally (see deviation below - this endpoint's 400 has no body at all) |
| `AuthenticationException` (Spring Security) | 401 | `AuthController#loginUser` only |

`UserException` and the four 400-mapped domain exceptions above are each reused for several distinct real conditions (not-found, conflict, bad-credential) rather than having their own subtypes per condition - this is a coarse-but-correct-direction mapping (client's fault, not the server's), not a precise REST status per failure mode. Splitting each into its own subtype with its own status code is a larger change than this documentation pass makes; noted here so a 400 from, say, `UserException("User not found")` isn't mistaken for a 404-worthy response format.

`CredentialException` and `RefereeException` exist but are dead code - imported, never thrown, anywhere in the codebase. Don't expect either from a live response.

## Known deviations from the envelope above

- **`POST /auth/refresh` on failure returns 400 with an empty body.** `AuthController#refreshToken` wraps the call in its own `try/catch` and returns `ResponseEntity.badRequest().build()`, bypassing `GlobalExceptionHandler` entirely. Don't attempt to parse a body from this specific 400.
- **`CredentialController` and `InscriptionController` don't throw domain exceptions at all.** Their "not found"/"bad request" paths are manual null-checks that return `ResponseEntity.notFound().build()` / `ResponseEntity.badRequest().build()` directly - also empty bodies, also bypassing the envelope above. Every other controller in this API uses the exception-based path and gets the full `{timestamp, status, error, message, path}` shape.
- **403 responses have no custom body.** Every 4xx/5xx above except 403 goes through code that builds the JSON envelope; a role check failing `@PreAuthorize` is handled entirely by Spring Security's default `AccessDeniedHandler` before it reaches any of this API's own code, and returns an empty 403.

## Known limitations (not bugs, but worth knowing)

- **No token revocation.** Changing your password or username issues a new token pair but does not invalidate the old one - old tokens keep working until they naturally expire (`APP_SECURITY_JWT_TOKEN_EXPIRATION_MS`/`APP_SECURITY_JWT_REFRESH_EXPIRATION_MS`). There is no server-side blocklist/logout endpoint.
- **Role claim format is inconsistent between login paths** - see `docs/authentication.md`'s "Role claim format" section before writing client-side role checks.
