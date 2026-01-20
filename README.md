This project uses [Vite](https://vitejs.dev/) for the frontend build pipeline.

## Environment Versions

[Node.js](https://nodejs.org/en/) `v22.9+` (22.x)<br/>
[NPM](https://www.npmjs.com/) `v10.x`

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs dependencies from NPM.<br />
You must do this before running any other scripts.

### `npm run dev`

Runs the app in development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The browser will hot reload on save.

### `npm run test`

Launches Vitest in watch mode.

### `npm run build`

Builds the app for production to the `build` folder.<br />
Vite bundles React in production mode and optimizes the build for performance.

Build is minified and the filenames are hashed.

Build script uses Vite and supports overriding modules to generate separate bundles per institution.

Read more [here](institution-overrides/README.md)

The default behavior is to build all institutions. To specify the target institutions to build for pass them as additional arg:

```
npm run build -- --target "custom" --target "another-custom"
```

To enable Sentry reporting/monitoring in the generated react app bundles, pass the following arguments to configure build script:

| Argument                   |                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------- |
| `--sentry-token`           | Auth token for uploading build sourcemaps<br/>(requires `project:releases` scope) |
| `--sentry-org`             | Sentry Organization Slug for sourcemaps upload                                    |
| `--sentry-dsn-react`       | DSN for react Sentry client                                                       |
| `--sentry-project-react`   | Sentry Project for react app sourcemaps upload                                    |
| `--sentry-dsn-express`     | DSN for node/express Sentry client                                                |
| `--sentry-project-express` | Sentry Project for artifact/release tagging                                       |

```
npm run build -- --sentry-dsn=https://dsn.sentry --sentry-token=authtoken --sentry-org=my-org --sentry-project=my-project
```

### `npm run start`

Starts the node server.<br />
Server runs locally on port `3000`.
Check [here](config/README.md) for app configuration.

The node server is currently used to:

- Passthrough web app configuration from server runtime (`process.env`) variables to the different pre-built app bundles.
- Expose few ops endpoints (like `/health-check`)
- Proxy for some api calls between the web app and backend
- Serve static bundles.

It does not need to be running during local development because the Vite dev server compiles/bundles/reloads TypeScript during development.

If you ever need to test your code "in production mode":

- create a production build of the react app using `npm run build`
- start the node server (assuming you also have a local version of backend also running) and point your browser to [http://localhost:3000](http://localhost:3000) (or any `/etc/host` config you might have for testing the varios bundles that could've been generated based on your other local/gitignored config)

    `COBALT_WEB_NAMESPACE=local COBALT_WEB_ENV=dev COBALT_WEB_API_BASE_URL=http://localhost:8080 npm run start`

## Environment Variables

| Name                                        | Description                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| WEBAPP_ENABLE_BASIC_AUTH                    | flag Basic Auth on NodeJS webapp server                                                                                  |
| WEBAPP_BASIC_AUTH_USERNAME                  | Accepted Basic Auth username                                                                                             |
| WEBAPP_BASIC_AUTH_PASSWORD                  | Accepted Basic Auth password                                                                                             |
| WEBAPP_SUBDOMAIN_MAPPING                    | a comma-separated list mapping `subdomain:build` for NodeJS webapp.                                                      |
| WEBAPP_SENTRY_DSN                           | Sentry DSN value. if present, enables sentry tracing for the nodejs server at runtime.                                   |
| COBALT_WEB_API_BASE_URL                     | API base url                                                                                                             |
| COBALT_WEB_GA_TRACKING_ID                   | Google Analytics Tracking ID `UA-000000-01`                                                                              |
| COBALT_WEB_GA4_MEASUREMENT_ID               | Google Analytics 4 Measurement ID `G-XYZ123ABC`                                                                          |
| COBALT_WEB_MIXPANEL_ID                      | Mix Panel Identifier                                                                                                     |
| COBALT_WEB_SHOW_DEBUG                       | string to show debug UI ("true" or "false")                                                                              |
| COBALT_WEB_SENTRY_SHOW_DEBUG                | string to show buttons on home page (throwing Sentry errors)                                                             |
| COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE=true | string to turn on/off provider features ("true" or "false")                                                              |
| COBALT_WEB_DOWN_FOR_MAINTENANCE             | string to turn on/off DownForService page ("true" or "false")                                                            |
| TARGET_INSTITUTION                          | Control which `institution-overrides` to bundle when running local dev server. Optional. Defaults to `cobalt` if not set |

Copy `.env.local.example` to `.env.local` at the root of the repo

Vite exposes only `VITE_`-prefixed environment variables to the client bundle; server/runtime values can remain unprefixed.

In production, the variables are controlled by the node.js server run-time and this file is irrelevant (other than being a reference to what variables can be passed-through/controlled by nodejs server).
