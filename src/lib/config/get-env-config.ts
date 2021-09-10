import { ENV_VARS } from './constants';

export type Environment = {
	[varName in ENV_VARS]: string;
};

function processEnvToConfig(env: NodeJS.ProcessEnv): Readonly<Environment> {
	return Object.entries(env)
		.filter(([envVar, value]) => {
			const isAppConfig = envVar.startsWith('REACT_APP_');
			const hasValue = typeof value !== 'undefined';

			return isAppConfig && hasValue;
		})
		.map<[keyof Environment, string]>(([envVar, value]) => [
			envVar.replace('REACT_APP_', '') as keyof Environment,
			value!,
		])
		.reduce((local, [envVar, value]) => {
			local[envVar] = value;
			return local;
		}, {} as Environment);
}

export function getEnvConfig(): Readonly<Environment> {
	if (__DEV__) {
		return processEnvToConfig(process.env);
	}

	const serverConfigElement = document.getElementById('react-app-env-config');
	const serverConfig = serverConfigElement ? JSON.parse(serverConfigElement.innerHTML) : undefined;

	if (!serverConfig || (Object.keys(serverConfig).length === 0 && serverConfig.constructor === Object)) {
		console.warn('App is running in production without configuration!');
		return {} as Readonly<Environment>;
	}

	return serverConfig;
}
