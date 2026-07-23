# Versioning & breaking-change policy

## Where the version lives today

`OpenApiConfig.customOpenAPI()` sets `info.version` to `"0.0.1"`, matching the Maven artifact version (`0.0.1-SNAPSHOT` in the root `pom.xml`). There is currently **no URL-level API version** (no `/v1/...` prefix) - every consumer hits the same unversioned base path (`http://localhost:8080/...`). This is fine while there's a single consumer (the bundled Next.js frontend) but is a real limitation the moment there's a second consumer that can't upgrade in lockstep with the backend. Not changed in this pass - introducing a URL version prefix is an architecture decision with real cost (routing, docs, client updates) that should happen deliberately, at the point of the *first* real breaking change, not preemptively.

## What counts as breaking

A change to this API is breaking if an existing, correctly-written client could start failing or silently misbehaving because of it, without any change on their end. Concretely:

- Removing or renaming a field in a request or response body.
- Removing or renaming an endpoint, or changing its path/HTTP method.
- Making a previously-optional request field required.
- Tightening validation on an existing field (e.g. a new `@Size`/`@Pattern` that rejects previously-valid input).
- Changing a response's status code for an existing scenario (e.g. a 404 that used to be a 200-with-null).
- Changing a field's type or semantics (e.g. `roles` switching from `["ADMINISTRADOR"]` to `["ROLE_ADMINISTRADOR"]` API-wide would be breaking for any client already handling both forms per `docs/authentication.md`).
- **Making an endpoint newly require authentication, or a stricter role, than it did before.** This is the one non-obvious entry on this list: security fixes that close an unintended-public endpoint are unambiguously the right call, but they are still breaking from an API-contract point of view - a client that depended on the old (wrong) public access will now get 401/403. The critical fixes in this repo's history (see `REVIEW_NOTES.md`) are exactly this case: correct to ship, but they must be called out in the changelog like any other breaking change, not treated as invisible because they're "just" a security fix.

## What counts as non-breaking

- Adding a new endpoint.
- Adding a new optional request field, or a new response field an existing client will simply ignore.
- Adding a new possible response status code for a scenario that previously wasn't distinguished (e.g. splitting a generic 500 into a specific 400/404/401 - see `docs/errors.md`'s FASE 5 fixes, which did exactly this for the auth endpoints. Clients that only checked `res.ok` are unaffected; clients that specifically branched on "500 means X" get more precise information, not less).
- Loosening validation (accepting input that used to be rejected).
- Documentation-only changes (this entire FASE 1-10 pass, minus the exception-handler fixes called out in `docs/errors.md`, is non-breaking - it describes existing behavior, it doesn't change it).

## How a change gets communicated

1. Every breaking change gets an entry in `CHANGELOG.md` (repo root) under a dated, versioned heading, in **plain language**, before or at the same time it ships - not discovered by a consumer via a failing request.
2. `OpenApiConfig`'s `info.version` bumps on every breaking change (minor/major-style bump; this project doesn't need to adopt strict SemVer for the API version, but "breaking changes bump the number, additive changes don't" is the one rule that matters).
3. If/when there's a second real consumer of this API, that's the trigger to introduce a `/v1/` prefix and stop breaking the unversioned root - not before, since versioning a single-consumer API preemptively is pure overhead.
