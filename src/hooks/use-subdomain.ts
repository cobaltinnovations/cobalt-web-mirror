import config from '@/lib/config';

export function getSubdomain() {
	if (config.COBALT_WEB_LOCALHOST_SUBDOMAIN) {
		return config.COBALT_WEB_LOCALHOST_SUBDOMAIN.toLowerCase();
	}

	const { host } = window.location;
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
