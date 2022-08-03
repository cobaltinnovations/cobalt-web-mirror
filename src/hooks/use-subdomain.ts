import config from '@/lib/config';

export function getSubdomain() {
	const { host } = window.location;

	if (__DEV__ && host.startsWith('localhost') && config.COBALT_WEB_LOCALHOST_SUBDOMAIN) {
		return config.COBALT_WEB_LOCALHOST_SUBDOMAIN.toLowerCase();
	}

	const hostSplit = host.split('.');

	if (hostSplit.length >= 3) {
		return hostSplit[0].toLowerCase();
	}

	return undefined;
}

function useSubdomain() {
	return getSubdomain();
}

export default useSubdomain;
