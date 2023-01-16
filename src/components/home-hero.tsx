import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import HeroContainer from '@/components/hero-container';
import { ReactComponent as ConnectWithSupportIcon } from '@/assets/icons/icon-connect-with-support.svg';

const HomeHero = () => {
	const navigate = useNavigate();

	return (
		<HeroContainer>
			<h1 className="mb-3 text-center">Recommended for you</h1>
			<p className="mb-5 text-center">
				Peers, Coping First Aid Coaches, Therapists, Psychiatrists, and more are here to help
			</p>
			<div className="text-center">
				<Button
					className="d-inline-flex align-items-center"
					onClick={() => {
						navigate('/connect-with-support');
					}}
				>
					<ConnectWithSupportIcon className="me-2" />
					Connect with support
				</Button>
			</div>
		</HeroContainer>
	);
};

export default HomeHero;
