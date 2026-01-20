const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const yn = require('yn');
const Sentry = require('@sentry/node');
const proxy = require('express-http-proxy');

let settings = {
	sentry: {
		dsn: '',
		showDebug: false,
	},
	nodeApp: {
		subdomainMapping: '*:cobalt',
		webApiBaseUrl: 'http://localhost:8080/',
	},
};

try {
	settings = require(path.resolve(__dirname, 'config', process.env.COBALT_WEB_ENV, 'settings'));
} catch (e) {
	throw new Error(`Settings not available.`);
}

const port = process.env.COBALT_WEB_PORT || 3000;
const nodeEnv = process.env.NODE_ENV;
const launchDate = new Date();

const BUILD_DIR = path.resolve(__dirname, 'build');

function extractCookieValueFromRequest(_req, cookieName) {
	const {
		headers: { cookie },
	} = _req;

	if (cookie) {
		const values = cookie.split(';').reduce((res, item) => {
			const data = item.trim().split('=');
			return { ...res, [data[0]]: data[1] };
		}, {});

		return values[cookieName];
	}

	return undefined;
}

const app = express();

app.use((_req, res, next) => {
	res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	next();
});

if (settings.sentry.dsn) {
	Sentry.init({
		dsn: settings.sentry.dsn,
		integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
		tracesSampleRate: 0.2,
	});
}

// Reporting CSV downloads can proxy through to backend and tack on access token.
// This way FE does not have access token embedded in URL, preventing
// unintentional "copy-paste" sharing
app.get('/reporting/run-report', (req, res, next) => {
	const baseUrl = settings.nodeApp.webApiBaseUrl;
	const accessToken = extractCookieValueFromRequest(req, 'accessToken');
	const proxyUrl = `${baseUrl}${req.url}&X-Cobalt-Access-Token=${accessToken ? accessToken : ''}`;

	req.url = proxyUrl;

	return proxy(proxyUrl)(req, res, next);
});

// Reporting CSV downloads can proxy through to backend and tack on access token.
// This way FE does not have access token embedded in URL, preventing
// unintentional "copy-paste" sharing
app.get('/page-row-mailing-lists/csv', (req, res, next) => {
	const baseUrl = settings.nodeApp.webApiBaseUrl;
	const accessToken = extractCookieValueFromRequest(req, 'accessToken');
	const proxyUrl = `${baseUrl}${req.url}&X-Cobalt-Access-Token=${accessToken ? accessToken : ''}`;

	req.url = proxyUrl;

	return proxy(proxyUrl)(req, res, next);
});

// Patient order CSV downloads can proxy through to backend and tack on access token.
// This way FE does not have access token embedded in URL, preventing
// unintentional "copy-paste" sharing
app.get('/ic/patient-order-csv-generator', (req, res, next) => {
	const baseUrl = settings.nodeApp.webApiBaseUrl;
	const orderCount = req.query.orderCount;
	const accessToken = extractCookieValueFromRequest(req, 'accessToken');
	const proxyUrl = `${baseUrl}/patient-order-csv-generator?orderCount=${orderCount ?? ''}&X-Cobalt-Access-Token=${
		accessToken ?? ''
	}`;

	req.url = proxyUrl;

	return proxy(proxyUrl)(req, res, next);
});

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
/* Serve SPA */
/* ----------------------------------------- */

const subdomainMappingString = settings.nodeApp.subdomainMapping;
const subdomainBuildMap = subdomainMappingString.split(',').reduce((map, mappingStr) => {
	const [subdomain, buildFolder] = mappingStr.split(':');

	map.set(subdomain.toLowerCase(), buildFolder);

	return map;
}, new Map());

const indexFileContentsInMemoryCache = {};

// Given a path to an index file on disk (either default or institution-specific),
// read it from disk, apply any transformations needed, and keep the result in an in-memory cache.
// Cache entries are never evicted
function indexFileContentsForPath(indexFilePath) {
	var indexFileContents = indexFileContentsInMemoryCache[indexFilePath];

	// On cache miss:
	// 1. Read the file into a string in memory.
	// 2. Inject the API base URL into the string and then cache that off.
	if (!indexFileContents) {
		if (!fs.existsSync(indexFilePath)) throw new Error(`Unable to locate index file at ${indexFilePath}`);

		indexFileContents = fs.readFileSync(indexFilePath, { encoding: 'utf8', flag: 'r' });
		indexFileContents = indexFileContents.replace('%ANALYTICS_API_BASE_URL%', settings.nodeApp.webApiBaseUrl);
		indexFileContents = indexFileContents.replace('%ANALYTICS_APP_VERSION%', launchDate.toISOString());
		indexFileContents = indexFileContents.replace(
			'%ANALYTICS_DEBUGGING_ENABLED%',
			nodeEnv === 'PRODUCTION' ? 'false' : 'true'
		);
		indexFileContentsInMemoryCache[indexFilePath] = indexFileContents;
	}

	return indexFileContents;
}

function serveIndexFile(_req, res) {
	const subdomainBuildFolder = subdomainBuildMap.get(_req.subdomains.join('.'));

	if (subdomainBuildFolder) {
		const indexFilePath = path.join(BUILD_DIR, subdomainBuildFolder, 'index.html');

		// if a subdomain has configured custom build
		if (fs.existsSync(indexFilePath)) {
			// send its index.html
			return res.send(indexFileContentsForPath(indexFilePath));
		}
	}

	const defaultIndexFilePath = path.join(BUILD_DIR, subdomainBuildMap.get('*'), 'index.html');

	// send default cobalt build
	res.send(indexFileContentsForPath(defaultIndexFilePath));
}

app.get('/', serveIndexFile);

app.use(express.static(BUILD_DIR));

app.get('/news/:pdfName', (_req, res) => {
	res.redirect(`https://cobaltplatform.s3.us-east-2.amazonaws.com/prod/newsletters/${_req.params.pdfName}.pdf`);
});

app.get('/*', serveIndexFile);

if (settings.sentry.dsn) {
	Sentry.setupExpressErrorHandler(app);
}

app.listen(port, () => {
	console.log(`> App Ready on http://localhost:${port}.`);
});
