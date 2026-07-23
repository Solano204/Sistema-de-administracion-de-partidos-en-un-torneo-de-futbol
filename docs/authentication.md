# Authentication

JWT Bearer. One place checks a password (`POST /auth/login`); everything else trusts the token.

## The token pair

`POST /auth/login` and the two "insert" endpoints that log you in as a side effect (`POST /users`, `POST /referees`) all return a `TokenResponse`:

```json
{
  "userId": "b3f1a2c4-1234-4a5b-8c9d-000000000099",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "username": "admin",
  "roles": ["ROLE_ADMINISTRADOR"]
}
```

- `accessToken` - send as `Authorization: Bearer <accessToken>` on every protected request. Expires after `expiresIn` seconds (dev default: 3600 = 1 hour, `APP_SECURITY_JWT_TOKEN_EXPIRATION_MS`).
- `refreshToken` - exchange for a new pair via `POST /auth/refresh` once the access token expires. Longer-lived (dev default: 86400000 ms = 24 hours, `APP_SECURITY_JWT_REFRESH_EXPIRATION_MS`).
- `roles` - **format is not consistent between endpoints.** See "Role claim format" below before you write any authorization logic against this array client-side.

## Log in

```
POST /auth/login
Content-Type: application/json

{ "username": "ada", "password": "ChangeMe123!" }
```

200 → `TokenResponse` as above.

401 → wrong password, or username doesn't exist. Both come back as the same generic message (Spring Security hides the difference between "wrong password" and "unknown user" by design, to avoid leaking which usernames are registered):

```json
{ "timestamp": "2026-07-18T12:00:00Z", "status": 401, "error": "Unauthorized", "message": "Bad credentials", "path": "/auth/login" }
```

`loginUser` calls Spring Security's `AuthenticationManager` directly; a failed login throws `AuthenticationException`, which `GlobalExceptionHandler#handleAuthenticationException` maps to 401. Every other password/username check in this controller (`change-password`, `change-username`, `change-password/admin`) is a manual check in application code that throws a plain `UserException`, which maps to **400**, not 401 - same underlying idea ("your credential was wrong"), two different status codes, because they're implemented through two different code paths. Documented as-is rather than silently normalized - see `docs/errors.md` for the full mapping and why it wasn't collapsed to one status code in this pass.

## Refresh a token

```
POST /auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGciOiJIUzI1NiJ9...", "userId": "b3f1a2c4-1234-4a5b-8c9d-000000000099" }
```

200 → new `TokenResponse`.

400 → refresh token missing/malformed/expired, or `userId` doesn't match the token's subject. **Empty body** - `AuthController#refreshToken` wraps the call in its own `try/catch` and returns `ResponseEntity.badRequest().build()` on any failure, so unlike every other error in this API there is no `{timestamp, status, error, message, path}` envelope here. Don't parse the body on a 400 from this specific endpoint.

## Self-service password/username change

Both require the caller to already be authenticated (`Authorization: Bearer <token>`) and to know their **current** password:

```
PUT /auth/change-password?username=ada&currentPassword=ChangeMe123!&newPassword=NewPass456!
PUT /auth/change-username?currentUsername=ada&newUsername=ada2&currentPassword=ChangeMe123!
```

(Both take query/form params, not a JSON body.)

200 → new `TokenResponse` (your old tokens are still valid until they expire naturally - there is no server-side revocation, see `docs/errors.md`'s "known limitations").

400 → `currentPassword` is wrong, `newPassword` equals `currentPassword` (change-password only), or the username in the request doesn't exist.

401 → missing/invalid/expired bearer token.

## Admin: reset any user's password

```
PUT /auth/change-password/admin?username=<any user>&newPassword=<anything>
```

**No current-password check, by design** - this exists so an `ADMINISTRADOR` can unlock a user who forgot their password. Requires `ADMINISTRADOR`.

200 → new `TokenResponse` **for the target user**, not the caller.
400 → no user exists with that username.
401 → missing/invalid token.
403 → caller is authenticated but not an `ADMINISTRADOR`.

This was, before this documentation pass, reachable with **no token at all** - see `REVIEW_NOTES.md` for the incident. It is now locked down; mentioned here because it's the one endpoint in this API where "authenticated" alone is deliberately not enough, and getting the role check wrong here is the highest-blast-radius mistake this API can make.

## Role model

```
ADMINISTRADOR, ARBITRO, CAPITAN, JUGADOR, USER
```

`ADMINISTRADOR` self-registration via `POST /users` only succeeds **once** (bootstrap) - after the first admin exists, subsequent `role=ADMINISTRADOR` requests get a 400. `ARBITRO` and `CAPITAN` currently have **no equivalent guard** - any caller can self-register as either through the same public endpoint. Tracked in `REVIEW_NOTES.md`, not fixed here (it's a product decision - are those roles supposed to be self-service at all? - not a pure documentation-scope call).

### Role claim format (read this before checking `roles` client-side)

The `roles` array in a `TokenResponse` is built two different ways depending on which code path issued the token:

| Path | Builds authority as |
|---|---|
| `POST /auth/login` (normal login) | `ADMINISTRADOR` (no prefix) |
| `POST /users`, `POST /referees`, photo/profile updates (`generateDirectTokenResponse`) | `ROLE_ADMINISTRADOR` (prefixed) |

If you're checking roles client-side, check for both forms, or strip a leading `ROLE_` before comparing. Server-side `@PreAuthorize` checks in this API already do the equivalent (`hasRole('ADMINISTRADOR') or hasAuthority('ADMINISTRADOR')`) for exactly this reason - see the comments in `UserController.java`/`AuthController.java`. This is flagged, not fixed, in this pass: the real fix is making authority-building consistent in `CommandHelperTokenProvider`/`CommandHelperUser`, which is a behavior change to token contents, not a documentation change, and risks breaking anything already depending on the current (inconsistent) format.
