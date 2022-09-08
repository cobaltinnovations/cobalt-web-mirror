#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { rm, exec } = require('shelljs');

rm('-rf', 'build');

const srcOverrides = fs
	.readdirSync(path.resolve(__dirname, 'src', 'institution-overrides'), { withFileTypes: true })
	.filter((file) => file.isDirectory())
	.map((dir) => dir.name);

const buildConfigs = ['cobalt', ...srcOverrides];

console.log(`=> Building ${buildConfigs.length} Configurations`);

for (const institution of buildConfigs) {
	try {
		console.log(`==> Building '${institution}' Configuration ...`);

		const buildEnvArgs = [
			// this env variable is used in config-overrides.js to locate module replacements
			`TARGET_INSTITUTION=${institution}`,

			// these two are CRA configurations:
			// https://create-react-app.dev/docs/advanced-configuration/
			`PUBLIC_URL=${institution}`, // referenced in public/index.html
			`BUILD_PATH=build/${institution}`, // modifies build ouputs
		];

		// generate separate bundles per supported institution
		exec(`${buildEnvArgs.join(' ')} npx react-app-rewired build`);
	} catch (e) {
		console.log(`${institution} Build failed`);
		console.error(e);
		process.exit(1);
	}
}
