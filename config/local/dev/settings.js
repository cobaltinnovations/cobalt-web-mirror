module.exports = {
	sentry: {
		// The Sentry DSN for nodejs server errors
		dsn: '',
		// Passed-through as "react-app config" to all target bundles - controlling wheter Sentry Debug buttons should appear on UI.
		showDebug: false,
	},
	nodeApp: {
		basicAuth: {
			enabled: false,
			username: 'anotheruser',
			password: 'somepassword',
		},
		// mapping of subdomain to target bundle
		// for example: 'xyz-dev:xyz,*:cobalt' will:
		// - serve the `xyz` bundle to requests originating from xyz-dev.domain.com
		// - serve the `cobalt` bundle to all other requests
		subdomainMapping: '*:cobalt',
		webApiBaseUrl: 'http://localhost:8080/',
	},
};
