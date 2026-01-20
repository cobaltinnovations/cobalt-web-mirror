#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fse = require('fs-extra');
const { rm, exec } = require('shelljs');
const SentryCli = require('@sentry/cli');

const argv = yargs(hideBin(process.argv))
	.version(false)
	.option('commitHash', {
		alias: ['commit-hash'],
		type: 'string',
		description: 'Commit hash. Used for tagging Sentry releases.',
	})
	.option('cobaltWebEnv', {
		alias: ['cobalt-web-env'],
		type: 'string',
		description: 'Target deployment environment.',
	})
	.option('target', {
		array: true,
		type: 'string',
		default: [],
		description:
			'Target specific institutions when generating assets. Generates assets for all institutions by default.',
	})
	.option('sentryToken', {
		alias: ['sentry-token'],
		type: 'string',
		description: 'Sentry Auth token to use for upload build/release sourcemaps',
	})
	.option('sentryOrg', {
		alias: ['sentry-org'],
		type: 'string',
		description: 'Sentry Organization to use for sourcemap uploads',
	})
	.option('sentryDsnReact', {
		alias: ['sentry-dsn-react'],
		type: 'string',
		description: 'DSN to use for connecting react app to Sentry & tagging releases',
	})
	.option('sentryProjectReact', {
		alias: ['sentry-project-react'],
		type: 'string',
		description: 'Sentry Project to use for react app sourcemap uploads & tagging releases',
	})
	.option('sentryDsnExpress', {
		alias: ['sentry-dsn-express'],
		type: 'string',
		description: 'DSN to use for connecting exress server to Sentry & tagging releases',
	})
	.option('sentryProjectExpress', {
		alias: ['sentry-project-express'],
		type: 'string',
		description: 'Sentry Project to use for tagging express server releases',
	})
	.parse();

console.log('==> Clearing old build artifacts');

rm('-rf', 'build');

const srcOverrides = fse
	.readdirSync(path.resolve(__dirname, 'institution-overrides'), { withFileTypes: true })
	.filter((file) => file.isDirectory())
	.map((dir) => dir.name);

const buildConfigs = ['cobalt', ...srcOverrides];

console.log(`=> Building ${buildConfigs.length} Configurations`);

for (const institution of buildConfigs) {
	if (argv.target.length !== 0 && !argv.target.includes(institution)) {
		console.log(`==> Skipping '${institution}' Configuration ...`);
		continue;
	}

	buildInstitutionTarget(institution);
}

const releaseServerToSentry = argv.sentryToken && argv.sentryOrg && argv.sentryDsnExpress && argv.sentryProjectExpress;

if (releaseServerToSentry) {
	console.log('==> Creating new Sentry release for node app');

	createSentryReleaseForNodeApp();
}

async function buildInstitutionTarget(institution) {
	try {
		console.log(`==> Building '${institution}' Configuration ...`);

		const buildEnvArgs = [
			// this env variable is used in Vite config to locate module replacements
			`TARGET_INSTITUTION=${institution}`,

			// used by Vite config for base path and output location
			`PUBLIC_URL=${institution}`,
			`BUILD_PATH=build/${institution}`,
		];

		buildEnvArgs.push(`COBALT_WEB_ENV=${argv.cobaltWebEnv}`);

		if (argv.sentryDsnReact) {
			// web app variables
			buildEnvArgs.push(`SENTRY_DSN=${argv.sentryDsnReact}`);
			buildEnvArgs.push(`SENTRY_RELEASE=${argv.commitHash}-${institution}`);

			// sourcemap upload variables
			if (argv.sentryToken && argv.sentryOrg && argv.sentryDsnReact) {
				buildEnvArgs.push(`SENTRY_AUTH_TOKEN=${argv.sentryToken}`);
				buildEnvArgs.push(`SENTRY_ORG=${argv.sentryOrg}`);
				buildEnvArgs.push(`SENTRY_PROJECT=${argv.sentryProjectReact}`);
			}
		}

		// generate separate bundles per supported institution
		const buildOutput = exec(`${buildEnvArgs.join(' ')} npx vite build`);

		if (buildOutput.code !== 0) {
			throw new Error('vite build failed for ' + institution);
		}

		const publicOverridesDir = path.join(__dirname, 'institution-overrides', institution, 'public');

		if (fse.existsSync(publicOverridesDir)) {
			console.log(`==> Copying '${institution}' public overrides ...`);
			const buildDir = path.join(__dirname, 'build', institution);

			fse.copySync(publicOverridesDir, buildDir, {
				overwrite: true, // override public / static assets
				filter(src, dest) {
					if (dest === path.join(buildDir, 'index.html')) {
						// except index.html
						console.warn('Cannot override index.html');
						return false;
					} else if (dest.startsWith(path.join(buildDir, 'static', 'js'))) {
						// and static js
						console.warn('Cannot override static js files (produced from webpack bundling)');
						return false;
					} else if (dest.endsWith(`.DS_Store`)) {
						return false;
					}

					return true;
				},
			});
		}

		console.log(`==> '${institution}' Build completed.\r\n\r\n`);
	} catch (e) {
		console.log(`${institution} Build failed`);
		console.error(e);
		process.exit(1);
	}
}

async function createSentryReleaseForNodeApp() {
	const sentryCli = new SentryCli(null, {
		authToken: argv.sentryToken,
		dsn: argv.sentryDsnExpress,
		org: argv.sentryOrg,
		project: argv.sentryProjectExpress,
	});

	await sentryCli.releases.new(argv.commitHash, {
		projects: [argv.sentryProjectExpress],
	});

	console.log('==> Sentry release Created. uploading server artifacts...');

	await sentryCli.releases.uploadSourceMaps(argv.commitHash, {
		include: ['server.js', 'build'],
	});

	console.log('==> Artifacts uploaded. Finalizing release...');

	await sentryCli.releases.finalize(argv.commitHash);

	console.log('==> Node Release finalized');
}
