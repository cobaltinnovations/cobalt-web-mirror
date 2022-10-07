const webpack = require('webpack');
const { aliasJest, aliasWebpack } = require('react-app-alias');
const path = require('path');

const aliasOptions = {};

module.exports.webpack = function (config, env) {
	config = aliasWebpack(aliasOptions)(config);

	config.plugins.push(
		new webpack.DefinePlugin({
			// Expose a dev flag for configuration of environment variables
			__DEV__: env !== 'production',
			// Expose public URL in TS for referencing static files correctly
			__PUBLIC_URL__: JSON.stringify(process.env.PUBLIC_URL || ''),
			__SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || ''),
			__SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || ''),
		})
	);

	const targetInstitution = process.env.TARGET_INSTITUTION || 'cobalt';
	const srcPath = path.join(__dirname, 'src');
	const srcOverridesPath = path.join(__dirname, 'institution-overrides', targetInstitution, 'src');

	config = extendModuleScopePlugin(config, srcOverridesPath);

	const fileReplaceLoader = {
		loader: 'file-replace-loader',
		options: {
			condition: 'if-replacement-exists',
			async: true,
			replacement: (resourcePath) => {
				// instruct loader to lookup files matching this replacement strategy
				// if they exist- they're bundled instead of the original
				return resourcePath.replace(srcPath, srcOverridesPath);
			},
		},
	};

	// Walk through react-script configured module-loading rules
	// and mutate them to support file-replace-loader per configuration above
	// these functions are fragile, and can break if/when react-scripts is updated
	// inspect config.module.rules to find rules for loading js|jsx|ts|tsx|svg files
	// and extend accordingly to support file-replacements
	config = extendSourceMapLoader(config, fileReplaceLoader);
	config = extendSvgLoader(config, fileReplaceLoader);
	config = extendInternalBabelLoader(config, fileReplaceLoader);

	return config;
};

module.exports.jest = aliasJest(aliasOptions);

// mutate webpack's ModuleScopePlugin config
// to allow imports from resolved modules external to `src`
function extendModuleScopePlugin(config, srcOverridesPath) {
	config.resolve.plugins[0].appSrcs.push(srcOverridesPath);
	config.resolve.plugins[0].allowedFiles.add(srcOverridesPath);

	return config;
}

function extendSourceMapLoader(config, fileReplaceLoader) {
	// this rule is configured for one loader
	const { enforce, test, exclude, ...sourceMapLoader } = config.module.rules[0];

	// modify it to _use_ multiple so we can include file-replace-loader config
	config.module.rules[0] = {
		enforce,
		test,
		exclude,
		use: [sourceMapLoader, fileReplaceLoader],
	};

	return config;
}

function extendSvgLoader(config, fileReplaceLoader) {
	// this rule is already configured for multiple loaders
	// simply push file-replace-loader config
	config.module.rules[1].oneOf[2].use.push(fileReplaceLoader);

	return config;
}

function extendInternalBabelLoader(config, fileReplaceLoader) {
	// this rule is configured for one loader
	const { test, include, ...babelInternalLoader } = config.module.rules[1].oneOf[3];

	// modify it to _use_ multiple so we can include file-replace-loader config
	config.module.rules[1].oneOf[3] = {
		test,
		// updated included paths
		include: [
			...include,
			...include.map((includePath) => {
				const tokenized = includePath.split('/');
				// adding overrides folder _before_ src
				tokenized.splice(tokenized.length - 1, 0, 'institution-overrides');
				return tokenized.join('/');
			}),
		],
		use: [babelInternalLoader, fileReplaceLoader],
	};

	return config;
}
