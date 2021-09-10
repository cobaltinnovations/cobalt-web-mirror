import { FC, useEffect } from 'react';
import config from '@/lib/config';
import Cookies from 'js-cookie';

const RedirectToBackend: FC = () => {
	useEffect(() => {
		const accessToken = Cookies.get('accessToken');
		window.location.href = `${config.COBALT_WEB_API_BASE_URL}${window.location.pathname}?X-Cobalt-Access-Token=${accessToken}`;
	}, []);

	return null;
};

export default RedirectToBackend;
