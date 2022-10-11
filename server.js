const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const yn = require('yn');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const configNamespace = process.env.COBALT_WEB_NAMESPACE;
const configEnv = process.env.COBALT_WEB_ENV;

let settings = {
	sentry: {
		dsn: '',
	},
};

try {
	settings = require(path.resolve(__dirname, 'config', configNamespace, configEnv, 'settings'));
} catch (e) {
	console.warn(`settings not available for Namesapce: ${configNamespace}, Env: ${configEnv}`);
}

const port = process.env.COBALT_WEB_PORT || 3000;
const launchDate = new Date();

const BUILD_DIR = path.resolve(__dirname, 'build');
const INSTITUTION_BUILDS = fs
	.readdirSync(BUILD_DIR, { withFileTypes: true })
	.filter((file) => file.isDirectory())
	.map((dir) => dir.name);

function configureReactApp() {
	const fe_envVars = [
		'COBALT_WEB_API_BASE_URL',
		'COBALT_WEB_GA_TRACKING_ID',
		'COBALT_WEB_GA4_MEASUREMENT_ID',
		'COBALT_WEB_DISABLE_SIGN_IN',
		'COBALT_WEB_SHOW_DEBUG',
		'COBALT_WEB_GOOGLE_MAPS_API_KEY',
		'COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE',
		'COBALT_WEB_DOWN_FOR_MAINTENANCE',
	];

	const reactAppConfig = Object.entries(process.env)
		.filter(([envVar]) => fe_envVars.includes(envVar))
		.reduce((env, [envVar, value]) => {
			env[envVar] = value;
			return env;
		}, {});

	for (const institutionBuild of INSTITUTION_BUILDS) {
		const INDEX_FILE_PATH = path.join(BUILD_DIR, institutionBuild, 'index.html');
		const indexFile = fs.readFileSync(INDEX_FILE_PATH, 'utf8');
		const $ = cheerio.load(indexFile);
		const appConfigScript = $('script#react-app-env-config');

		// clear config from previous start, if any
		if (appConfigScript.length > 0) {
			appConfigScript.remove();
		}

		$('head').append(
			`<script id="react-app-env-config" type="application/json">${JSON.stringify(reactAppConfig)}</script>`
		);

		fs.writeFileSync(INDEX_FILE_PATH, $.html());
	}
}

configureReactApp();

const app = express();

if (settings.sentry.dsn) {
	Sentry.init({
		dsn: settings.sentry.dsn,
		integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
		tracesSampleRate: 0.2,
	});

	app.use(Sentry.Handlers.requestHandler());
	app.use(Sentry.Handlers.tracingHandler());
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ----------------------------------------- */
/* System routes -- public */
/* ----------------------------------------- */

app.get('/health-check', (_req, res) => {
	res.send('OK');
});

app.get('/configuration', (_req, res) => {
	res.json({
		launchDate: launchDate,
	});
});

/* ----------------------------------------- */
/* Basic HTTP Auth */
/* ----------------------------------------- */

const basicAuthEnabled = yn(process.env.WEBAPP_ENABLE_BASIC_AUTH, { default: false });

if (basicAuthEnabled) {
	const USERNAME = process.env.WEBAPP_BASIC_AUTH_USERNAME || 'dev_admin';
	const PASSWORD = process.env.WEBAPP_BASIC_AUTH_PASSWORD || 'dev_password';

	if (USERNAME === 'dev_admin' && PASSWORD === 'dev_password') {
		setInterval(() => {
			console.warn('WARNING: Server using dev/hardcoded basic auth credentials');
		}, 5000);
	}

	app.use((req, res, next) => {
		// quick workaround for passing manifest file through Basic Auth
		// `.json` files are not handled by the `static` middleware
		if (req.path.toLowerCase() === '/manifest.json') {
			next();
			return;
		}

		function challengeAuth() {
			res.setHeader('WWW-Authenticate', 'Basic');
			res.status(401).send('Not Authenticated');
		}

		if (!req.session.user) {
			const { authorization } = req.headers;
			if (!authorization) {
				challengeAuth();
				return;
			}

			const [username, password] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');

			if (username !== USERNAME || password !== PASSWORD) {
				challengeAuth();
				return;
			}

			req.session.user = USERNAME;
			next();
			return;
		} else if (req.session.user !== USERNAME) {
			challengeAuth();
			return;
		}

		next();
	});
}

/* ----------------------------------------- */
/* Serve SPA */
/* ----------------------------------------- */

const subdomainMappingString = process.env.WEBAPP_SUBDOMAIN_MAPPING || '*:cobalt';
const subdomainBuildMap = subdomainMappingString.split(',').reduce((map, mappingStr) => {
	const [subdomain, buildFolder] = mappingStr.split(':');

	map.set(subdomain.toLowerCase(), buildFolder);

	return map;
}, new Map());

function serveIndexFile(_req, res) {
	const subdomainBuildFolder = subdomainBuildMap.get(_req.subdomains.join('.'));

	if (subdomainBuildFolder) {
		const indexFile = path.join(BUILD_DIR, subdomainBuildFolder, 'index.html');

		// if a subdomain has configured custom build
		if (fs.existsSync(indexFile)) {
			// send its index.html
			return res.sendFile(indexFile);
		}
	}

	// send default cobalt build
	res.sendFile(path.join(BUILD_DIR, subdomainBuildMap.get('*'), 'index.html'));
}

app.get('/', serveIndexFile);

app.use(express.static(BUILD_DIR));

app.get('/news/:pdfName', (_req, res) => {
	res.redirect(`https://cobaltplatform.s3.us-east-2.amazonaws.com/prod/newsletters/${_req.params.pdfName}.pdf`);
});

app.get('*', serveIndexFile);

if (settings.sentry.dsn) {
	app.use(Sentry.Handlers.errorHandler());
}

app.listen(port, () => {
	console.log(`> App Ready on http://localhost:${port}.`);
});
