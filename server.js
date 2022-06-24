const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const yn = require('yn');

const port = process.env.COBALT_WEB_PORT || 3000;
const launchDate = new Date();

const BUILD_DIR = path.resolve(__dirname, 'build');
const THEME_CONFIG_DIR = path.join(__dirname, 'src', 'jss', 'theme', 'config');
const INDEX_FILE_PATH = path.join(BUILD_DIR, 'index.html');

function configureReactApp() {
	const fe_envVars = [
		'COBALT_WEB_API_BASE_URL',
		'COBALT_WEB_GA_TRACKING_ID',
		'COBALT_WEB_DISABLE_SIGN_IN',
		'COBALT_WEB_SHOW_DEBUG',
		'COBALT_WEB_GOOGLE_MAPS_API_KEY',
		'COBALT_WEB_LOCALHOST_SUBDOMAIN',
		'COBALT_WEB_PROVIDER_MANAGEMENT_FEATURE',
		'COBALT_WEB_DOWN_FOR_MAINTENANCE',
	];

	const reactAppConfig = Object.entries(process.env)
		.filter(([envVar]) => fe_envVars.includes(envVar))
		.reduce((env, [envVar, value]) => {
			env[envVar] = value;
			return env;
		}, {});

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

	const themes = fs.readdirSync(THEME_CONFIG_DIR);
	for (let themeName of themes) {
		themeName = themeName.replace('.js', '');

		const themeConfigScript = $('script#react-app-theme-config');
		// clear theme config, if any
		if (themeConfigScript.length > 0) {
			themeConfigScript.remove();
		}

		const themeConfig = require(path.join(THEME_CONFIG_DIR, themeName));

		$('head').append(
			`<script id="react-app-theme-config" type="application/json">${JSON.stringify(themeConfig)}</script>`
		);

		// write the default/main theme to index.html
		if (themeName === 'cobalt') {
			fs.writeFileSync(INDEX_FILE_PATH, $.html());
		} else {
			// else write configured index.html as hidden dotfiles per theme
			fs.writeFileSync(path.join(BUILD_DIR, `.${themeName}.index.html`), $.html());
		}
	}
}

configureReactApp();

const app = express();

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

app.use(express.static(BUILD_DIR));

app.get('/news/:pdfName', (_req, res) => {
	res.redirect(`https://cobaltplatform.s3.us-east-2.amazonaws.com/prod/newsletters/${_req.params.pdfName}.pdf`);
});

app.get('*', (_req, res) => {
	if (_req.subdomains.length) {
		const indexFilePath = path.join(BUILD_DIR, `.${_req.subdomains.join('.')}.index.html`);

		// if a subdomain has configured custom theme
		if (fs.existsSync(indexFilePath)) {
			// send its index.html
			return res.sendFile(indexFilePath, { dotfiles: 'allow' });
		}
	}

	res.sendFile(INDEX_FILE_PATH);
});

app.listen(port, () => {
	console.log(`> App Ready on http://localhost:${port}.`);
});
