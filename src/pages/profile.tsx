import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import HeroContainer from '@/components/hero-container';
import { createUseThemedStyles } from '@/jss/theme';

const useProfileStyles = createUseThemedStyles((theme) => ({
	lastUpdatedContainer: {
		padding: 0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
}));

const Profile: FC = () => {
	const navigate = useNavigate();
	const classes = useProfileStyles();
	const location = useLocation();
	const { account, institution } = useAccount();

	function handleUpdateMyProfileButtonClick() {
		navigate('/intro-assessment', {
			state: { from: location.pathname },
		});
	}

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Your Profile</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-2 text-center">Your Profile</h2>
				<p className="mb-0 fw-normal text-center">
					Take a moment to review your profile and let us know if anything has changed.
				</p>
			</HeroContainer>
			<Container className={classes.lastUpdatedContainer} fluid>
				<Container className="pt-2 pb-2">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="mb-0">Information last updated {account?.lastUpdatedDescription}</p>
						</Col>
					</Row>
				</Container>
			</Container>
			<Container className="pt-5 pb-5">
				{/* <Row className="mb-4">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{account?.introAssessment.questions.map((question, index) => {
							return (
								<div key={index} className="mb-4">
									<h5 className="mb-0">{question.question}</h5>
									<p className="mb-0">{question.responses}</p>
								</div>
							);
						})}
					</Col>
				</Row> */}
				<Row className="text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Button onClick={handleUpdateMyProfileButtonClick}>Update My Profile</Button>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Profile;
