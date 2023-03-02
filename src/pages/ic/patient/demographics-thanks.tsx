import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as WomanWithCatIllustration } from '@/assets/illustrations/woman-with-cat.svg';

const useStyles = createUseThemedStyles((theme) => ({
	gradient: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
}));

const PatientDemographicsThanks = () => {
	const classes = useStyles();
	const { account, institution } = useAccount();
	const { checkAndStartScreeningFlow } = useScreeningFlow(institution?.integratedCareScreeningFlowId, false);

	return (
		<Container fluid className={classes.gradient}>
			<Container className="py-20">
				<Row className="mb-2">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="mb-10 text-center">
							<WomanWithCatIllustration />
						</div>
						<h1 className="mb-6 text-center">Thank you, {account?.firstName ?? 'Patient'}.</h1>
						<p className="mb-6 text-center fs-large">That information really helps.</p>
						<p className="mb-6 text-center fs-large">
							Next, we'd like to know about the condition or symptoms you're looking for help with
						</p>
						<div className="text-center">
							<Button
								onClick={() => {
									checkAndStartScreeningFlow();
								}}
							>
								Continue
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default PatientDemographicsThanks;
