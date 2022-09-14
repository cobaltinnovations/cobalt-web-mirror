const webpack = require('webpack');
const { aliasJest, aliasWebpack } = require('react-app-alias');

const aliasOptions = {};

module.exports.webpack = function (config, env) {
	config = aliasWebpack(aliasOptions)(config);

	config.plugins.push(
		new webpack.DefinePlugin({
			// Expose a dev flag for configuration of environment variables
			__DEV__: env !== 'production',
			// Expose public URL in TS for referencing static files correctly
			__PUBLIC_URL__: JSON.stringify(process.env.PUBLIC_URL || ''),
		})
	);

	const targetInstitution = process.env.TARGET_INSTITUTION || 'cobalt';

	const fileReplaceLoader = {
		loader: 'file-replace-loader',
		options: {
			condition: 'if-replacement-exists',
			async: true,
			replacement: (resourcePath) => {
				// instruct loader to lookup files matching this replacement strategy
				// if they exist- they're bundled instead of the original
				return resourcePath.replace('/src/', `/src/institution-overrides/${targetInstitution}/`);
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
		include,
		use: [babelInternalLoader, fileReplaceLoader],
	};

	return config;
}
