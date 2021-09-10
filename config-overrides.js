const path = require('path');
const webpack = require('webpack');

module.exports = {
	webpack(config, env) {
		// create-react-app doesn't support the `paths` config in tsconfig.json
		// and force strips it out if present.
		// https://github.com/facebook/create-react-app/issues/5645
		// https://github.com/facebook/create-react-app/issues/5585#issuecomment-433900655
		// Need to duplicate webapp's internal paths/aliases here for
		// webpack to properly resolve module paths left by the
		// TS compiler from babel's ts-loader
		config.resolve = {
			...config.resolve,
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		};

		// Expose a dev flag for configuration of environment variables
		config.plugins.push(new webpack.DefinePlugin({ __DEV__: env !== 'production' }));

		return config;
	},
};
