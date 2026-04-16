# Cobalt Web Contributor Guide

## Purpose

`cobalt-web-mirror-codex` is the React + Node web frontend for Cobalt's mental-health product experiences:

-   Institutional/internal user experiences
-   Integrated care patient and MHIC workflows

## Stack

-   React 18 + TypeScript
-   React Router v6 data routers
-   JSS + SCSS styling
-   Express server for production bundle hosting/proxy
-   CRA tooling via `react-app-rewired`

## Quick Start

Install dependencies:

```bash
npm install
```

Run local dev bundle (webpack dev server):

```bash
npm run dev
```

Run Node host server against built assets:

```bash
npm run start
```

Build institution bundles:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

Run Storybook:

```bash
npm run storybook
```

## Configuration Model

### Build-time

-   `COBALT_WEB_ENV` selects `src/config/config.<env>.ts` via `config-overrides.js`.
-   `TARGET_INSTITUTION` selects institution override tree in `institution-overrides/<institution>/`.

### Runtime (Node server)

-   `server.js` loads `config/<COBALT_WEB_ENV>/settings.js`.
-   Current local example: `config/local/settings.js`.
-   Node server injects API base URL and serves subdomain-specific build folders.

## Directory Map

-   `src/routes.tsx`: canonical route tree and route guards
-   `src/routes/ic/`: integrated care route modules (MHIC + patient)
-   `src/components/integrated-care/`: IC UI components and modals
-   `src/lib/services/`: typed API client methods
-   `src/lib/models/`: shared frontend model contracts
-   `institution-overrides/`: institution-specific file replacement bundles
-   `config/`: runtime settings for Node host app

## Integrated Care Hotspots

-   Route tree and IC gate: `src/routes.tsx`
-   MHIC routes: `src/routes/ic/mhic/`
-   Patient routes: `src/routes/ic/patient/`
-   IC service client: `src/lib/services/integrated-care-service.ts`
-   IC data models: `src/lib/models/integrated-care-models.ts`
-   Login destination routing: `src/contexts/account-context.tsx`

## Changing IC Features Safely

1. Update route/component behavior in `src/routes/ic/**` and `src/components/integrated-care/**`.
2. Update or add service calls in `src/lib/services/integrated-care-service.ts`.
3. Keep typings aligned in `src/lib/models/`.
4. Verify account-role/login-destination behavior still routes correctly (`/ic/mhic` vs `/ic/patient`).
5. Validate API contract with backend resource paths.

## Institutional Overrides

-   Build can produce multiple institution bundles.
-   Override files must preserve the same module exports as the default source module.
-   Public asset overrides may be copied from `institution-overrides/<institution>/public` (excluding generated JS and `index.html`).

## Related Docs

-   `docs/integrated-care-ui-map.md`
-   `docs/api-crosswalk.md`
