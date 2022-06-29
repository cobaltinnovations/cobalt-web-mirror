import React, { FC } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
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
	useHeaderTitle('your profile');

	const history = useHistory();
	const classes = useProfileStyles();
	const routeMatch = useRouteMatch();
	const { account } = useAccount();

	function handleUpdateMyProfileButtonClick() {
		history.push({
			pathname: '/intro-assessment',
			state: { from: routeMatch.path },
		});
	}

	return (
		<>
			<HeroContainer>
				<p className="mb-0 text-white font-body-normal text-center">
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
				<Row className="mb-4">
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
				</Row>
				<Row className="text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Button onClick={handleUpdateMyProfileButtonClick}>update my profile</Button>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Profile;
