import Cookies from 'js-cookie';
// import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

import { HttpClient } from '@/lib/http-client';
import config from '@/lib/config';

export const httpSingleton = new HttpClient({
	baseUrl: config.COBALT_WEB_API_BASE_URL,
	defaultHeaders: {
		'Content-Type': 'application/json',
		'X-Cobalt-Webapp-Base-Url': window.location.origin,
	},
	tokenHeaderKey: 'X-Cobalt-Access-Token',
	getToken: () => {
		return Cookies.get('accessToken');
	},
	fingerprintHeaderKey: 'X-Cobalt-Fingerprint-Id',
	getFingerprintId: () => {
		return Promise.resolve(undefined);
		// const fpConfig: any = { token: config.COBALT_WEB_FINGERPRINTING_TOKEN };
		// if (!!config.COBALT_WEB_FINGERPRINTING_ENDPOINT) {
		// 	fpConfig.endpoint = config.COBALT_WEB_FINGERPRINTING_ENDPOINT;
		// }

		// return config.COBALT_WEB_FINGERPRINTING_ENABLED?.toLowerCase() === 'true'
		// 	? FingerprintJS.load(fpConfig)
		// 			.then((fp) => fp.get())
		// 			.then((r) => r.visitorId)
		// 	: Promise.resolve(undefined);
	},
});
