const webpack = require('webpack');
const { aliasJest, aliasWebpack } = require('react-app-alias');

const aliasOptions = {};

module.exports = {
	webpack(config, env) {
		config = aliasWebpack(aliasOptions)(config);

		// Expose a dev flag for configuration of environment variables
		config.plugins.push(new webpack.DefinePlugin({ __DEV__: env !== 'production' }));

		return config;
	},
};

module.exports.jest = aliasJest(aliasOptions);
