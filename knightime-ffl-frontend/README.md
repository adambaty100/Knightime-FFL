# Knightime FFL Frontend

Angular frontend for the Knightime FFL application.

## Local development

Start the FastAPI service on port 8000, then run:

```bash
npm ci
npm start
```

The frontend automatically uses the same hostname as the browser with API port 8000,
so both `localhost:4200` and `127.0.0.1:4200` work locally.

## Deploy to Vercel

Create a second Vercel project from this repository with these settings:

- **Root Directory:** `knightime-ffl-frontend`
- **Framework Preset:** Angular
- **Build Command:** `npm run build`
- **Output Directory:** `dist/knightime-ffl-frontend/browser`

The checked-in `vercel.json` supplies the build and output settings. If the Vercel
dashboard has overrides enabled, make them match these values or disable the overrides.

Set this environment variable for both **Preview** and **Production**:

```dotenv
PUBLIC_API_BASE_URL=https://your-deployed-api.vercel.app
```

Use the FastAPI deployment URL without a trailing path such as `/docs`. The build
normalizes a trailing slash. Vercel builds intentionally fail if this variable is
missing or does not use HTTPS, preventing a frontend deployment that silently calls
port 8000.

The build generates `public/runtime-config.js`; this file is ignored by Git and copied
into the Angular bundle. Do not place `ADMIN_API_KEY` or either Turso credential in the
frontend project—those are backend-only secrets.

The included `vercel.json` sends non-file routes to Angular's `index.html`, allowing
direct visits and refreshes on `/teams`, `/games`, and `/transactions`.

After the frontend deploys, add its production URL to the backend Vercel project's
`CORS_ORIGINS`. Vercel Preview URLs already match the backend's restricted Preview
origin policy. Redeploy the backend after changing that variable.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
