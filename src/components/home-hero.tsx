import React from 'react';

import HeroContainer from '@/components/hero-container';

const HomeHero = () => {
	return (
		<HeroContainer>
			<h1 className="mb-3 text-center">Recommended for you</h1>
			<p className="mb-5 text-center">
				Peers, Coping First Aid Coaches, Therapists, Psychiatrists, and more are here to help
			</p>
		</HeroContainer>
	);
};

export default HomeHero;
