## Server Config

The Express server must be configured at runtime with:

-   `COBALT_WEB_NAMESPACE`
-   `COBALT_WEB_ENV`
-   `COBALT_WEB_API_BASE_URL`

The first two are to read config settings from this `.gitignored` folder.
The last one is to point deployed bundles to backend deployments/instances.

Config folder structrue is expected to follow:

```
config/
├─ namespace-a/
│ ├─ dev/
│ │ ├─ settings.js
│ ├─ prod/
│ │ ├─ settings.js
├─ namespace-b/
│ ├─ dev/
│ │ ├─ settings.js
│ ├─ prod/
│ │ ├─ settings.js
```

with an example `config/local/dev/settings.js` file.
