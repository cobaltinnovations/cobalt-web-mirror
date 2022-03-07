import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import useQuery from '@/hooks/use-query';

const Onboarding = () => {
	const history = useHistory();
	const query = useQuery();
	const roleId = query.get('roleId');

	useEffect(() => {
		if (roleId) {
			Cookies.set('roleId', roleId);
		}

		history.replace('/');
	}, [history, roleId]);

	return <div />;
};

export default Onboarding;
