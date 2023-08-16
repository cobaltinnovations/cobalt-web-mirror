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
	},
	// Passed-through as "env config" to all target bundles
	// This happens at runtime of nodejs app
	// where it mutates the index.html file to include a `react-app-env-config` script in the head
	reactApp: {
		// The base URL for the react-app to use when making API calls
		apiBaseUrl: process.env.COBALT_WEB_API_BASE_URL,
		// Enable/use Mixpanel
		mixpanelId: null,
		// Enable Debug UIs
		showDebug: false,
		// Used for address lookups during ehr lookups
		googleMapsApiKey: 'not-a-real-key',
		// Enable Provider Profile management UI
		providerManagementFeatureEnabled: false,
		// take a guess what this does :-]
		downForMaintenance: false,
	},
};
