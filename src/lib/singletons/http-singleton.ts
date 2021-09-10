import Cookies from 'js-cookie';

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
});
