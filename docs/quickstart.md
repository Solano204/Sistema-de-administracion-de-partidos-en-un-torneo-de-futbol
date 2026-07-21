# Quickstart

Goal: your first authenticated API call in under 5 minutes. Every request below is copy-pasteable `curl`.

## 0. Prerequisites

- Docker + Docker Compose
- `backend/soccer-system (2)/soccer-system/soccer-system/.env` already has working dev defaults committed (Postgres creds, JWT dev secret) - you don't need to create anything before step 1.

## 1. Start the stack (~1 min)

```bash
cd "backend/soccer-system (2)/soccer-system/soccer-system"
docker compose up -d postgres backend
```

Wait for the backend to come up:

```bash
curl -sf http://localhost:8080/v3/api-docs > /dev/null && echo "API is up"
```

If that doesn't return "API is up" within ~30s, check `docker compose logs backend`.

## 2. Check whether an admin account already exists (~10s)

This endpoint is public - no token needed. It's what the frontend uses to decide whether to show the initial admin-setup flow.

```bash
curl -s "http://localhost:8080/users/exist-admin?role=ADMINISTRADOR"
# -> true | false
```

## 3. Create your first user (~1 min)

`POST /users` is public specifically so the first admin can be created before anyone has a token. Self-registering as `ADMINISTRADOR` only works **once** - after the first admin exists, this endpoint still accepts other roles publicly (see [`authentication.md`](./authentication.md) for the caveat on `ARBITRO`/`CAPITAN`).

```bash
curl -s -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ada",
    "lastName": "Admin",
    "email": "ada@example.com",
    "birthDate": "1995-01-01",
    "age": 31,
    "user": "ada",
    "password": "ChangeMe123!",
    "role": "ADMINISTRADOR",
    "urlPhoto": ""
  }'
```

Response is a `TokenResponse` - you already have a valid token pair from registration, but step 4 shows the normal login flow you'll use afterward.

Valid `role` values: `ADMINISTRADOR`, `ARBITRO`, `CAPITAN`, `JUGADOR`, `USER`.

## 4. Log in (~10s)

```bash
curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "ada", "password": "ChangeMe123!" }'
```

```json
{
  "userId": "b3f1a2c4-1234-4a5b-8c9d-000000000099",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "username": "ada",
  "roles": ["ROLE_ADMINISTRADOR"]
}
```

Save the token:

```bash
export TOKEN="<accessToken from the response above>"
```

## 5. Make your first authenticated call (~10s)

Create a category (every match/team/player in this system hangs off a category):

```bash
curl -s -X POST http://localhost:8080/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Varonil Libre",
    "imageUrl": "",
    "ageRange": { "minAge": 16, "maxAge": 45 }
  }'
```

```json
{
  "id": "b3f1a2c4-1234-4a5b-8c9d-000000000001",
  "name": "Varonil Libre",
  "imageUrl": "",
  "ageRange": { "minAge": 16, "maxAge": 45 }
}
```

That's it - you have a working token and created your first resource. From here:

- [`authentication.md`](./authentication.md) - the full auth flow, refresh, password/username self-service, and the two admin-only endpoints.
- [`errors.md`](./errors.md) - what every error response looks like and what each status code means.
- `/swagger-ui.html` on a running instance - browse and try every endpoint interactively (see [`interactive-docs-verification.md`](./interactive-docs-verification.md)).
- The Postman collection at the repo root (`sistema-partidos.postman_collection.json`) - same flows, pre-built.
