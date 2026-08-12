# Knightime FFL

Knightime FFL consists of an Angular frontend and a Python FastAPI backend backed by
Turso.

## Backend

```bash
cd Knightime_FFL_API
uv sync
cp .env.example .env
uv run fastapi dev --port 8000
```

FastAPI serves the API at `http://localhost:8000` and its interactive Swagger UI at
`http://localhost:8000/docs`. Add your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to
the new `.env` before starting it. Also generate an `ADMIN_API_KEY`; all POST, PATCH,
and DELETE requests require it as a Bearer token. See the backend README for the
one-command import of the existing SQLite data into Turso.

## Frontend

In a second terminal:

```bash
cd knightime-ffl-frontend
npm install
npm start
```

Open `http://localhost:4200`. The frontend API base URL is defined in
`src/app/api.config.ts`.

## Tests

```bash
cd Knightime_FFL_API
uv run pytest
```
