import Cookies from 'js-cookie';
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

import { HttpClient } from '@/lib/http-client';
import config from '@/lib/config';

export const httpSingleton = new HttpClient({
	baseUrl: config.COBALT_WEB_API_BASE_URL,
	defaultHeaders: {
		'Content-Type': 'application/json',
	},
	tokenHeaderKey: 'X-Cobalt-Access-Token',
	getToken: () => {
		return Cookies.get('accessToken');
	},
	fingerprintHeaderKey: 'X-Cobalt-Fingerprint-Id',
	getFingerprintId: () => {
		return config.COBALT_WEB_FINGERPRINTING_ENABLED?.toLowerCase() === 'true'
			? FingerprintJS.load({ token: config.COBALT_WEB_FINGERPRINTING_TOKEN })
					.then((fp) => fp.get())
					.then((r) => r.visitorId)
			: Promise.resolve(undefined);
	},
});
