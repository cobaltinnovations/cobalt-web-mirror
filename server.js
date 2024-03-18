const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const yn = require('yn');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
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
		integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
		tracesSampleRate: 0.2,
	});

	app.use(Sentry.Handlers.requestHandler());
	app.use(Sentry.Handlers.tracingHandler());
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
