# Knightime FFL API

FastAPI service for the Knightime FFL historical data, hosted by Turso.

## Create and configure the Turso database

With the Turso CLI installed and authenticated, create a database containing the
existing historical data:

```bash
turso db create knightime-ffl --from-file ./knightime_ffl.db
```

Copy the environment template and populate it with the database URL and a token:

```bash
cp .env.example .env
turso db show knightime-ffl --url
turso db tokens create knightime-ffl
```

```dotenv
TURSO_DATABASE_URL=libsql://your-database-your-organization.turso.io
TURSO_AUTH_TOKEN=your-database-token
ADMIN_API_KEY=your-long-random-admin-key
```

Generate an admin key with:

```bash
openssl rand -hex 32
```

The `.env` file is ignored by Git. Do not commit either secret.

## Run locally

From this directory:

```bash
uv sync
uv run fastapi dev --port 8000
```

The API is available at `http://localhost:8000`, with interactive documentation at
`http://localhost:8000/docs`.

The service requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` at startup. It creates
any missing application tables without modifying existing rows.

## Mutation authentication

GET routes are public. Every POST, PATCH, and DELETE route requires the admin key as a
Bearer token:

```bash
curl -X POST http://localhost:8000/champions \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"leagueMemberId": 1, "year": 2025}'
```

Missing or incorrect credentials return `401`. If `ADMIN_API_KEY` is not configured,
mutation routes return `503` and no data is changed. Swagger UI at `/docs` also accepts
the Bearer token through its **Authorize** control.

For Vercel, configure `ADMIN_API_KEY` alongside both Turso variables for the Preview
and Production environments.

## Deploy the API to Vercel

Create a Vercel project from this repository with these settings:

- **Root Directory:** `Knightime_FFL_API`
- **Framework Preset:** FastAPI
- **Build and Output settings:** leave at their defaults

The checked-in `vercel.json` explicitly selects the FastAPI framework and an eastern US
function region. The root `index.py` exports the FastAPI application for Vercel's Python runtime.
Dependencies and Python 3.12–3.14 compatibility are defined in `pyproject.toml` and
`uv.lock`.

Configure these variables for both **Preview** and **Production** in the Vercel project:

```dotenv
TURSO_DATABASE_URL=libsql://your-database-your-organization.turso.io
TURSO_AUTH_TOKEN=your-database-token
ADMIN_API_KEY=your-long-random-admin-key
CORS_ORIGINS=https://your-production-frontend.vercel.app
```

`CORS_ORIGINS` accepts a comma-separated list and trailing slashes are normalized.
Local Angular origins remain enabled for development. HTTPS Vercel Preview URLs are
permitted by the default `CORS_ORIGIN_REGEX`; you can override that variable if the
deployment naming policy needs to be stricter.

The local `.env`, test suite, virtual environment, historical SQLite source file, and
Python caches are excluded from the Vercel deployment bundle.

After deploying, verify these public endpoints:

```bash
curl https://your-api.vercel.app/health
curl https://your-api.vercel.app/teamdata
```

Then verify authentication without modifying data by sending an invalid mutation. It
must return `401`:

```bash
curl -i -X DELETE https://your-api.vercel.app/champions/id/0 \
  -H "Authorization: Bearer intentionally-invalid"
```

## Test

```bash
uv run pytest
```
