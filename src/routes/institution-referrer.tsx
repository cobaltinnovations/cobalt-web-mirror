import React from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { institutionReferrersService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import HeroContainer from '@/components/hero-container';
import useAccount from '@/hooks/use-account';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { urlName } = params;

	if (!urlName) {
		throw new Error('urlName is undefined.');
	}

	const { institutionReferrer } = await institutionReferrersService.getReferrerByUrlName(urlName).fetch();

	return {
		institutionReferrer,
	};
};

export const Component = () => {
	const { institutionReferrer } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const { institution } = useAccount();
	const featuresScreeningFlow = useScreeningFlow({
		screeningFlowId: institutionReferrer.intakeScreeningFlowId,
		instantiateOnLoad: false,
	});
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader } = featuresScreeningFlow;

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			{renderedCollectPhoneModal}

			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Referral</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<h1 className="mb-6 text-center">{institutionReferrer.title}</h1>
				<p className="mb-6 text-center fs-large">{institutionReferrer.description}</p>
				<div className="text-center">
					<Button
						onClick={() => {
							startScreeningFlow();
						}}
					>
						Get Started
					</Button>
				</div>
			</HeroContainer>
			<Container className="py-16">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div dangerouslySetInnerHTML={{ __html: institutionReferrer.pageContent ?? '' }} />
					</Col>
				</Row>
			</Container>
			<HeroContainer className="bg-n75">
				<h2 className="mb-6 text-center">{institutionReferrer.ctaTitle}</h2>
				<p className="mb-6 text-center fs-large">{institutionReferrer.ctaDescription}</p>
				<div className="text-center">
					<Button
						onClick={() => {
							startScreeningFlow();
						}}
					>
						Get Started
					</Button>
				</div>
			</HeroContainer>
		</>
	);
};
