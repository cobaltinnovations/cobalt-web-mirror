import useAccount from '@/hooks/use-account';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Onboarding = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
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
				<title>{institution.name ?? 'Cobalt'} | Onboarding</title>
			</Helmet>

			<div />
		</>
	);
};

export default Onboarding;
