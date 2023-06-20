import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Onboarding = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const roleId = searchParams.get('roleId');

	useEffect(() => {
		if (roleId) {
			Cookies.set('roleId', roleId);
		}

		navigate('/', { replace: true });
	}, [navigate, roleId]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Onboarding</title>
			</Helmet>

			<div />
		</>
	);
};

export default Onboarding;
