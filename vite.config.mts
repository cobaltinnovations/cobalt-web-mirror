import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, 'src');

const normalizePublicUrl = (publicUrl: string) => {
	if (!publicUrl) {
		return '/';
	}

	const trimmed = publicUrl.replace(/^\/+|\/+$/g, '');
	return `/${trimmed}/`;
};

const splitViteId = (id: string) => {
	const index = id.indexOf('?');
	return index === -1 ? id : id.slice(0, index);
};

const configEnvReplacementPlugin = (envName: string): Plugin => {
	const localConfigPath = path.join(srcRoot, 'config', 'config.local.ts');
	const envConfigPath = path.join(srcRoot, 'config', `config.${envName}.ts`);

	return {
		name: 'cobalt-config-env-replacement',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!importer) {
				return null;
			}

			const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
			if (!resolved) {
				return null;
			}

			const resolvedPath = splitViteId(resolved.id);
			if (resolvedPath !== localConfigPath) {
				return null;
			}

			if (fs.existsSync(envConfigPath)) {
				return envConfigPath;
			}

			return null;
		},
	};
};

const institutionOverridePlugin = (overridesRoot: string): Plugin => {
	return {
		name: 'cobalt-institution-overrides',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!importer) {
				return null;
			}

			const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
			if (!resolved) {
				return null;
			}

			const resolvedPath = splitViteId(resolved.id);
			if (!resolvedPath.startsWith(srcRoot)) {
				return null;
			}

			const relativePath = path.relative(srcRoot, resolvedPath);
			const overridePath = path.join(overridesRoot, relativePath);

			if (fs.existsSync(overridePath)) {
				return overridePath;
			}

			return null;
		},
	};
};

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const targetInstitution = env.TARGET_INSTITUTION || 'cobalt';
	const cobaltWebEnv = env.COBALT_WEB_ENV || mode;
	const publicUrl = env.PUBLIC_URL || '';
	const base = normalizePublicUrl(publicUrl);
	const overridesRoot = path.resolve(__dirname, 'institution-overrides', targetInstitution, 'src');

	const sentryEnabled =
		!!env.SENTRY_AUTH_TOKEN && !!env.SENTRY_ORG && !!env.SENTRY_PROJECT && !!env.SENTRY_RELEASE;

	const plugins: Plugin[] = [
		svgr(),
		react(),
		configEnvReplacementPlugin(cobaltWebEnv),
		institutionOverridePlugin(overridesRoot),
	];

	if (sentryEnabled) {
		plugins.push(
			sentryVitePlugin({
				org: env.SENTRY_ORG,
				project: env.SENTRY_PROJECT,
				authToken: env.SENTRY_AUTH_TOKEN,
				release: {
					name: env.SENTRY_RELEASE,
				},
			})
		);
	}

	return {
		base,
		plugins,
		resolve: {
			alias: {
				'@': srcRoot,
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern',
					quietDeps: true,
					silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
				},
			},
		},
		define: {
			__DEV__: mode !== 'production',
			__PUBLIC_URL__: JSON.stringify(publicUrl),
			__SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN || ''),
			__SENTRY_RELEASE__: JSON.stringify(env.SENTRY_RELEASE || ''),
		},
		server: {
			port: 3000,
		},
		build: {
			outDir: env.BUILD_PATH || 'build',
			sourcemap: sentryEnabled,
			rollupOptions: {
				output: {
					entryFileNames: 'static/js/[name].[hash].js',
					chunkFileNames: 'static/js/[name].[hash].js',
					assetFileNames: (assetInfo) => {
						const ext = path.extname(assetInfo.name ?? '').slice(1);
						if (ext === 'css') {
							return 'static/css/[name].[hash].[ext]';
						}
						return 'static/media/[name].[hash].[ext]';
					},
				},
			},
		},
		test: {
			environment: 'jsdom',
			setupFiles: path.resolve(__dirname, 'src', 'setupTests.ts'),
			globals: true,
		},
	};
});
