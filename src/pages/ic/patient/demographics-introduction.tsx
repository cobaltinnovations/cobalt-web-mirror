import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as WomanAtDeskIllustration } from '@/assets/illustrations/woman-at-desk.svg';

const useStyles = createUseThemedStyles((theme) => ({
	gradient: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
}));

const PatientDemographicsIntroduction = () => {
	const classes = useStyles();
	const navigate = useNavigate();

	return (
		<Container fluid className={classes.gradient}>
			<Container className="py-20">
				<Row className="mb-2">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="mb-10 text-center">
							<WomanAtDeskIllustration width={408} height={218} />
						</div>
						<h1 className="mb-6 text-center">Welcome, [firstName].</h1>
						<p className="mb-6 text-center fs-large">
							This assessment takes about 15 minutes to complete, and only you and your care team wll have
							access to your answers.
						</p>
						<p className="mb-6 text-center fs-large">
							We'll start by asking a series of questions to understand your background and how you're
							feeling.
						</p>
						<div className="text-center">
							<Button
								onClick={() => {
									navigate('/ic/patient/demographics-part-1');
								}}
							>
								Begin Assessment
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default PatientDemographicsIntroduction;
