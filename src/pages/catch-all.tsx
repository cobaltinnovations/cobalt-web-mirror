import React, { useEffect } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import NoMatch from '../components/no-match';
import { routeRedirects } from '../route-redirects';

const CatchAll = () => {
	const match = useMatch('*');
	const navigate = useNavigate();

	useEffect(() => {
		const redirectConfig = routeRedirects.find((c) => {
			if (c.caseSensitive) {
				return c.fromPath === match?.pathname;
			}

			return c.fromPath.toLowerCase() === match?.pathname.toLowerCase();
		});

		if (redirectConfig) {
			navigate(
				{
					pathname: redirectConfig.toPath,
					search: new URLSearchParams(redirectConfig.searchParams).toString(),
				},
				{
					replace: true,
				}
			);
		}
	}, [match?.pathname, navigate]);

	return <NoMatch />;
};

export default CatchAll;
