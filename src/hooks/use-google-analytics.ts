import React from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';

import config from '@/lib/config';
import useAccount from './use-account';

const useGoogleAnalytics = () => {
	const location = useLocation();
	const { account, initialized: authCtxDidInit } = useAccount();

	React.useEffect(() => {
		ReactGA.initialize(config.COBALT_WEB_GA_TRACKING_ID);
	}, []);

	React.useEffect(() => {
		if (!authCtxDidInit) {
			return;
		}

		const page = location.pathname;

		ReactGA.set({ page, accountId: account?.accountId });
		ReactGA.pageview(page);
	}, [account, authCtxDidInit, location]);
};

export default useGoogleAnalytics;
