import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { DefinePlugin } from 'webpack';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/preset-create-react-app',
		'@storybook/addon-interactions',
		'storybook-addon-react-router-v6',
	],
	webpackFinal: async (config) => {
		if (!config.plugins) {
			config.plugins = [];
		}

		config.plugins.push(
			new DefinePlugin({
				__DEV__: true,
				__PUBLIC_URL__: '""',
				__SENTRY_DSN__: '',
				__SENTRY_RELEASE__: '',
			})
		);

		if (!config.resolve) {
			config.resolve = {};
		}

		config.resolve.plugins = [
			...(config.resolve.plugins || []),
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, '..', 'tsconfig.json'),
			}),
		];

		return config;
	},
	framework: {
		name: '@storybook/react-webpack5',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
	staticDirs: ['../public'],
};
export default config;
