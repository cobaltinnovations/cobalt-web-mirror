const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const serialize = require('serialize-javascript');
const cookieSession = require('cookie-session');
const yn = require('yn');
const cookieParser = require('cookie-parser');

const port = process.env.COBALT_WEB_PORT || 3000;
const launchDate = new Date();

function configureReactApp(indexFilePath) {
	const fe_envVars = ['COBALT_WEB_API_BASE_URL', 'COBALT_WEB_SSO_URL', 'COBALT_WEB_PIC_API_BASE_URL', 'COBALT_WEB_GA_TRACKING_ID', 'COBALT_WEB_DISABLE_SIGN_IN', 'COBALT_WEB_SHOW_DEBUG', 'COBALT_WEB_GOOGLE_MAPS_API_KEY', 'COBALT_WEB_LOCALHOST_SUBDOMAIN', 'COBALT_WEB_PIC_CLIENT_ID', 'COBALT_WEB_PIC_PATIENT_SCOPES', 'COBALT_WEB_PIC_OP_SERVER', 'COBALT_WEB_PIC_REDIRECT_URL', 'COBALT_WEB_PIC_RESPONSE_TYPE', 'COBALT_WEB_DOWN_FOR_MAINTENANCE'];

	const reactAppConfig = Object.entries(process.env)
		.filter(([envVar]) => fe_envVars.includes(envVar))
		.reduce((env, [envVar, value]) => {
			env[envVar] = value;
			return env;
		}, {});

	const serializedConfig = serialize(reactAppConfig);

	const indexFile = fs.readFileSync(indexFilePath, 'utf8');
	const $ = cheerio.load(indexFile);
	const configScript = $('script#react-app-env-config');

	if (configScript.length > 0) {
		configScript.text(serializedConfig);
	} else {
		$('head').append(`<script id="react-app-env-config" type="application/json">${serializedConfig}</script>`);
	}

	fs.writeFileSync(indexFilePath, $.html());
}

configureReactApp(path.resolve(__dirname, 'build', 'index.html'));

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
		launchDate: launchDate
	});
});

/* ----------------------------------------- */
/* Basic HTTP Auth */
/* ----------------------------------------- */

const basicAuthEnabled = yn(process.env.WEBAPP_ENABLE_BASIC_AUTH, { default: false });

if (basicAuthEnabled) {
	const USERNAME = process.env.WEBAPP_BASIC_AUTH_USERNAME || 'dev_admin';
	const PASSWORD = process.env.WEBAPP_BASIC_AUTH_PASSWORD || 'dev_password';
	const AUTH_SECRET = process.env.WEBAPP_BASIC_AUTH_SECRET || 'dev_secret';

	if (USERNAME === 'dev_admin' && PASSWORD === 'dev_password') {
		setInterval(() => {
			console.warn('WARNING: Server using dev/hardcoded basic auth credentials');
		}, 5000);
	}

	app.use(
		cookieSession({
			name: 'cobalt',
			secret: AUTH_SECRET,
			httpOnly: true,
			overwrite: true,
		})
	);

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

			const [username, password] = Buffer.from(authorization.split(' ')[1], 'base64')
				.toString()
				.split(':');

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

app.use(express.static(path.join(__dirname, 'build')));
app.use(cookieParser());

app.get('/news/:pdfName', (_req, res) => {
	res.redirect(`https://cobaltplatform.s3.us-east-2.amazonaws.com/prod/newsletters/${_req.params.pdfName}.pdf`);
});

app.get('/pic/finish-sso', (_req, res) => {
    const accessToken = _req.query.accessToken;
	const patientContext = _req.query.patientContext;

    const options = {
		sameSite: 'lax'
	};

	if(accessToken) {
		res.cookie('accessToken', accessToken, options);
	} else {
		res.clearCookie('accessToken');
	}

	if(patientContext) {
    	res.cookie('piccobalt_patientcontext', patientContext, options);
	} else {
		res.clearCookie('piccobalt_patientcontext');
	}

    res.redirect(patientContext ? '/pic/home' : '/pic/mhic');
});

app.get('*', (_req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
	console.log(`> App Ready on http://localhost:${port}.`);
});
