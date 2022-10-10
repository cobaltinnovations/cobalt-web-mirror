This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment Versions

[Node.js](https://nodejs.org/en/) `v16.13.2`<br/>
[NPM](https://www.npmjs.com/) `v8.1.2`

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs dependencies from NPM.<br />
You must do this before running any other scripts.

### `npm run dev`

Runs the app in development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The browser will hot reload on save.<br />
You will see any lint errors in the console.

### `npm run test`

Launches jest in interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

Jest configuration can be found in the package.json.

### `npm run build`

Builds the app for production to the `build` folder.<br />
Correctly bundles React in production mode and optimizes the build for performance.

Build is minified and the filenames are hashed.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Build script and Webpack config are modified from the default `react-scripts` behavior to support overriding modules and therefore generating separate bundles per institution.

Read more [here](institution-overrides/README.md)

The default behavior is to build all institutions. To specify the target institutions to build for pass them as additional arg:

```
npm run build -- --target "custom" --target "another-custom"
```

To enable Sentry reporting/monitoring in the generated react app bundles, pass the following arguments to configure build script:

| Argument           |                                                                                   |
| ------------------ | --------------------------------------------------------------------------------- |
| `--sentry-dsn`     | DSN for Sentry Project/client                                                     |
| `--sentry-token`   | Auth token for uploading build sourcemaps<br/>(requires `project:releases` scope) |
| `--sentry-org`     | Sentry Organization Slug for sourcemaps upload                                    |
| `--sentry-project` | Sentry Organization Project for sourcemaps upload                                 |

```
npm run build -- --sentry-dsn=https://dsn.sentry --sentry-token=authtoken --sentry-org=my-org --sentry-project=my-project
```

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `npm run start`

Starts the node server.<br />
Server runs locally on port `3000`.

The node server is currently only used to populate configuration (`process.env`) variables at run time in production. It does not need to be running during local development, as default configuration variables are provided by `.env.local`.

If you ever need to test your code against the server, create a production build of the react app using `npm run build`. Then start the node server and point your browser to [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Name                                        | Description                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| WEBAPP_ENABLE_BASIC_AUTH                    | flag Basic Auth on NodeJS webapp server                                                                                  |
| WEBAPP_BASIC_AUTH_USERNAME                  | Accepted Basic Auth username                                                                                             |
| WEBAPP_BASIC_AUTH_PASSWORD                  | Accepted Basic Auth password                                                                                             |
| WEBAPP_BASIC_AUTH_SECRET                    | Secret string to sign Basic Auth session cookies                                                                         |
| WEBAPP_SUBDOMAIN_MAPPING                    | a comma-separated list mapping `subdomain:build` for NodeJS webapp.                                                      |
| WEBAPP_SENTRY_DSN                           | Sentry DSN value. if present, enables sentry tracing for the nodejs server at runtime.                                   |
| COBALT_WEB_API_BASE_URL                     | API base url                                                                                                             |
| COBALT_WEB_GA_TRACKING_ID                   | Google Analytics Tracking ID `UA-000000-01`                                                                              |
| COBALT_WEB_GA4_MEASUREMENT_ID               | Google Analytics 4 Measurement ID `G-XYZ123ABC`                                                                          |
| COBALT_WEB_DISABLE_SIGN_IN                  | string to disable sign-in UI ("true" or "false")                                                                         |
| COBALT_WEB_SHOW_DEBUG                       | string to show debug UI ("true" or "false")                                                                              |
| COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE=true | string to turn on/off provider features ("true" or "false")                                                              |
| COBALT_WEB_DOWN_FOR_MAINTENANCE             | string to turn on/off DownForService page ("true" or "false")                                                            |
| TARGET_INSTITUTION                          | Control which `institution-overrides` to bundle when running local dev server. Optional. Defaults to `cobalt` if not set |

Copy `.env.local.example` to `.env.local` at the root of the repo

All local development environment variables must start with `REACT_APP_`. This prefix can be ignored in production as it is only used by create-react-app's bundlers to set environment variables at build-time.

In production, the variables are controlled by the node.js server run-time and this file is irrelevant.
