import React from 'react';

import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import PageHeader from './page-header';

const HomeHero = () => {
	const { institution } = useAccount();
	return (
		<>
			{institution.heroImageUrl ? (
				<PageHeader
					className="bg-p50"
					title={<h1 className="mb-0">{institution.heroTitle ?? 'Recommended for you'}</h1>}
					descriptionHtml={`<p className="mb-0">
							${
								institution.heroDescription ??
								'Peers, Coping First Aid Coaches, Therapists, Psychiatrists, and more are here to help'
							}
						</p>`}
					imageUrl={institution.heroImageUrl}
					imageAlt={institution.heroTitle ?? 'Recommended for you'}
				/>
			) : (
				<HeroContainer>
					<h1 className="mb-3 text-center">{institution.heroTitle ?? 'Recommended for you'}</h1>
					<p className="mb-5 text-center">
						{institution.heroDescription ??
							'Peers, Coping First Aid Coaches, Therapists, Psychiatrists, and more are here to help'}
					</p>
				</HeroContainer>
			)}
		</>
	);
};

export default HomeHero;
