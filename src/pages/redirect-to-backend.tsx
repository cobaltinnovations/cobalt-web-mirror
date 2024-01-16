import { FC, useEffect } from 'react';
import config from '@/config/config';
import Cookies from 'js-cookie';

const RedirectToBackend: FC = () => {
	useEffect(() => {
		const accessToken = Cookies.get('accessToken');
		window.location.href = `${config.apiBaseUrl}${window.location.pathname}?X-Cobalt-Access-Token=${accessToken}`;
	}, []);

	return null;
};

export default RedirectToBackend;
