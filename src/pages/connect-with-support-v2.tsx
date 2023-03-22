import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { providerService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import AsyncWrapper from '@/components/async-page';
import ConnectWithSupportItem from '@/components/connect-with-support-item';

const ConnectWithSupportV2 = () => {
	const { pathname } = useLocation();
	const { institution } = useAccount();

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => pathname === feature.urlName),
		[institution?.features, pathname]
	);

	const fetchfindOptions = useCallback(async () => {
		if (!institution || !featureDetails) {
			throw new Error('The Connect with Support feature you are looking for could not be found.');
		}

		const response = await providerService
			.fetchFindOptions({
				institutionId: institution.institutionId,
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
			<Container fluid className="py-3 bg-white border-top border-bottom">
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="mb-0 text-center fw-bold">Today, Feb 19, 2023</p>
						</Col>
					</Row>
				</Container>
			</Container>
			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<ConnectWithSupportItem
							title="University of Pennsylvania Employee Assistance Program"
							subtitle="EAP Intake Counselor from Health Advocate"
							descriptionHtml="<p>During your first session, an intake coordinator will collect your information and ask you about the issue/s you're experiencing, spanning issues with self, family, work or substance use. Next they'll help you schedule your next session with a provider appropriate to your needs and goals, which may not be the intake coordinator. The EAP program does not prescribe or recommend medications.</p>"
							buttons={[
								{
									title: '2:00pm',
									disabled: true,
								},
								{ title: '2:00pm' },
								{ title: '5:00pm' },
								{ title: '6:00pm' },
								{ title: '7:00pm' },
								{ title: '8:00pm' },
								{ title: '9:00pm' },
							]}
						/>
						<hr />
						<ConnectWithSupportItem
							title="Lancaster General Health Employee Assistance Program"
							subtitle="Clinical Care Manager from Quest Behavioral Health"
							descriptionHtml="<p>The Lancaster General Health Employee Assistance Program (EAP) offers eight (8) free confidential counseling sessions, as well as educational tools and referral services to help you manage life’s challenges. The EAP is managed by Quest Behavioral Health, which provides access to a network of behavioral health providers in the community. Employees can contact Quest directly by calling 1-800-364-6352; all contacts are confidential.</p>"
							buttons={[{ title: 'Call 1-800-364-6352' }]}
						/>
					</Col>
				</Row>
			</Container>
			<Container fluid className="py-3 bg-white border-top border-bottom">
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="mb-0 text-center fw-bold">Wednesday, Feb 20, 2023</p>
						</Col>
					</Row>
				</Container>
			</Container>
			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<ConnectWithSupportItem
							title="University of Pennsylvania Employee Assistance Program"
							subtitle="EAP Intake Counselor from Health Advocate"
							descriptionHtml="<p>During your first session, an intake coordinator will collect your information and ask you about the issue/s you're experiencing, spanning issues with self, family, work or substance use. Next they'll help you schedule your next session with a provider appropriate to your needs and goals, which may not be the intake coordinator. The EAP program does not prescribe or recommend medications.</p>"
							buttons={[
								{
									title: '2:00pm',
									disabled: true,
								},
								{ title: '2:00pm' },
								{ title: '5:00pm' },
								{ title: '6:00pm' },
								{ title: '7:00pm' },
								{ title: '8:00pm' },
								{ title: '9:00pm' },
							]}
						/>
						<hr />
						<ConnectWithSupportItem
							title="University of Pennsylvania Employee Assistance Program"
							subtitle="EAP Intake Counselor from Health Advocate"
							descriptionHtml="<p>During your first session, an intake coordinator will collect your information and ask you about the issue/s you're experiencing, spanning issues with self, family, work or substance use. Next they'll help you schedule your next session with a provider appropriate to your needs and goals, which may not be the intake coordinator. The EAP program does not prescribe or recommend medications.</p>"
							buttons={[
								{
									title: '2:00pm',
									disabled: true,
								},
								{ title: '2:00pm' },
								{ title: '5:00pm' },
								{ title: '6:00pm' },
							]}
						/>
					</Col>
				</Row>
			</Container>
			<AsyncWrapper fetchData={fetchfindOptions}>
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
