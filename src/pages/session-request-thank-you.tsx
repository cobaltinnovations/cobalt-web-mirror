import React, { FC } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import HeroContainer from '@/components/hero-container';
import { Helmet } from 'react-helmet';
import useAccount from '@/hooks/use-account';

const useStyles = createUseThemedStyles((theme) => ({
	card: {
		border: 0,
		borderRadius: 0,
		borderTop: `20px solid ${theme.colors.s500}`,
	},
}));

const SessionRequestThankYou: FC = () => {
	const classes = useStyles();
	const location = useLocation();
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Request Group Session - Thank You</title>
			</Helmet>

			<HeroContainer>
				<h2 className="mb-0 text-center">Request Group Session</h2>
			</HeroContainer>
			<Container className="pt-16">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Card className={classNames('mb-5 pt-10 pb-20 ps-6 pe-6', { [classes.card]: true })}>
							<h1 className="mb-5 fs-h2 text-center">thank you for your interest</h1>
							<p className="mb-0 fs-small text-center">
								Your request for {(location.state as { groupSessionName: string })?.groupSessionName}{' '}
								has been submitted, and a session manager will be contacting you soon.
							</p>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default SessionRequestThankYou;
