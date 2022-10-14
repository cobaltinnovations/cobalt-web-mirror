## Server Config

The Express server can be configured at runtime with `COBALT_WEB_NAMESPACE` and `COBALT_WEB_ENV` to read config settings from this `.gitignored` folder.

Config folder structrue is expected to follow:

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

with an example settings.js:

```
module.exports = {
	sentry: {
		dsn: '',
	},
};
```