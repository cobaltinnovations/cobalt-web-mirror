import { createUseThemedStyles } from '@/jss/theme';
import React, { FC } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

const useStyles = createUseThemedStyles((theme) => ({
	thankYouCard: {
		border: 0,
		borderRadius: 0,
		textAlign: 'center',
		padding: '40px 40px 70px',
		borderTop: `20px solid ${theme.colors.s500}`,
	},
}));

const OnYourTimeThanks: FC = () => {
	const classes = useStyles();

	return (
		<>
			<Helmet>
				<title>Cobalt | On Your Time - Thank You</title>
			</Helmet>

			<Container className="py-20">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Card className={classes.thankYouCard}>
							<h2 className="mb-5">thank you</h2>
							<p>
								<small>
									Your content has been submitted and will become available after an admin has
									approved it.
								</small>
							</p>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default OnYourTimeThanks;
