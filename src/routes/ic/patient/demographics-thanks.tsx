import React, { useCallback, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as WomanWithCatIllustration } from '@/assets/illustrations/woman-with-cat.svg';
import AsyncWrapper from '@/components/async-page';

const useStyles = createUseThemedStyles((theme) => ({
	gradient: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
}));

const PatientDemographicsThanks = () => {
	const classes = useStyles();
	const { institution } = useAccount();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const { createScreeningSession, renderedCollectPhoneModal, renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId: patientOrder?.patientOrderId,
		instantiateOnLoad: false,
	});

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getOpenOrderForCurrentPatient().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Integrated Care - Thank You</title>
			</Helmet>

			{renderedCollectPhoneModal}

			<AsyncWrapper fetchData={fetchData}>
				<Container fluid className={classes.gradient}>
					<Container className="py-20">
						<Row className="mb-2">
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								<div className="mb-10 text-center">
									<WomanWithCatIllustration />
								</div>
								<h1 className="mb-6 text-center">
									Thank you, {patientOrder?.patientFirstName ?? 'Patient'}.
								</h1>
								<p className="mb-6 text-center fs-large">That information really helps.</p>
								<p className="mb-6 text-center fs-large">
									Next, we'd like to know about the condition or symptoms you're looking for help
									with.
								</p>
								<div className="text-center">
									<Button
										onClick={() => {
											createScreeningSession();
										}}
									>
										Continue
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default PatientDemographicsThanks;
