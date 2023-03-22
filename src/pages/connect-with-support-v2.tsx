import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { providerService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import AsyncWrapper from '@/components/async-page';

const ConnectWithSupportV2 = () => {
	const { pathname } = useLocation();
	const { institution } = useAccount();

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => pathname === feature.urlName),
		[institution?.features, pathname]
	);

	const fetchProviders = useCallback(async () => {
		if (!institution || !featureDetails) {
			return;
		}

		const response = await providerService
			.fetchFindOptions({
				institutionId: institution?.institutionId,
				featureId: featureDetails.featureId,
			})
			.fetch();

		console.log(response);
	}, [featureDetails, institution]);

	return (
		<>
			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>
					<p className="mb-0 text-center fs-large">{featureDetails.description}</p>
				</HeroContainer>
			)}
			<AsyncWrapper fetchData={fetchProviders}>
				<Container>
					<Row>
						<Col>
							<p>TODO: Provider List</p>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default ConnectWithSupportV2;
