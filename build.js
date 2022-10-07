#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const fse = require('fs-extra');
const { rm, exec } = require('shelljs');

const argv = yargs(process.argv).argv;

const sentryInput = argv.sentry;
const targetInput = argv.target;

const sentryDSN = !!sentryInput && !Array.isArray(sentryInput) ? sentryInput : null;
const buildTargets = targetInput ? (Array.isArray(targetInput) ? targetInput : [targetInput]) : [];

rm('-rf', 'build');

const srcOverrides = fse
	.readdirSync(path.resolve(__dirname, 'institution-overrides'), { withFileTypes: true })
	.filter((file) => file.isDirectory())
	.map((dir) => dir.name);

const buildConfigs = ['cobalt', ...srcOverrides];

console.log(`=> Building ${buildConfigs.length} Configurations`);

for (const institution of buildConfigs) {
	if (buildTargets.length !== 0 && !buildTargets.includes(institution)) {
		console.log(`==> Skipping '${institution}' Configuration ...`);
		continue;
	}

	try {
		console.log(`==> Building '${institution}' Configuration ...`);

		const buildEnvArgs = [
			// this env variable is used in config-overrides.js to locate module replacements
			`TARGET_INSTITUTION=${institution}`,

			// these two are CRA configurations:
			// https://create-react-app.dev/docs/advanced-configuration/
			`PUBLIC_URL=${institution}`, // referenced in public/index.html & config-overrides
			`BUILD_PATH=build/${institution}`, // modifies build ouputs
		];

		if (sentryDSN) {
			buildEnvArgs.push(`SENTRY_DSN=${sentryDSN}`);
			const gitRev = exec('git rev-parse --short HEAD');
			buildEnvArgs.push(`SENTRY_RELEASE=${gitRev}-${institution}`);
		}

		// generate separate bundles per supported institution
		exec(`${buildEnvArgs.join(' ')} npx react-app-rewired build`);

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
