import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useQuery from '@/hooks/use-query';

const Onboarding = () => {
	const navigate = useNavigate();
	const query = useQuery();
	const roleId = query.get('roleId');

	useEffect(() => {
		if (roleId) {
			Cookies.set('roleId', roleId);
		}

		navigate('/', { replace: true });
	}, [navigate, roleId]);

	return <div />;
};

export default Onboarding;
