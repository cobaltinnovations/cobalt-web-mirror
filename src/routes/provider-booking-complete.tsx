import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

import SvgIcon from '@/components/svg-icon';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';

export const loader = () => {
	return null;
};

const useStyles = createUseThemedStyles((theme) => ({
	card: {
		alignItems: 'center',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
		borderRadius: 8,
		display: 'flex',
		flexDirection: 'column',
		minHeight: 460,
		padding: '64px 48px',
		textAlign: 'center',
	},
	iconOuter: {
		alignItems: 'center',
		backgroundColor: '#3d6b70',
		borderRadius: 500,
		color: theme.colors.n0,
		display: 'flex',
		height: 96,
		justifyContent: 'center',
		marginBottom: 56,
		width: 96,
	},
}));

export const Component = () => {
	const classes = useStyles();
	const navigate = useNavigate();
	const { institution } = useAccount();

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Appointment Confirmed</title>
			</Helmet>

			<Container className="py-37">
				<Row>
					<Col lg={{ span: 8, offset: 2 }}>
						<div className={classes.card}>
							<div className={classes.iconOuter}>
								<SvgIcon kit="far" icon="check" size={48} />
							</div>
							<h1 className="mb-4">Your appointment is confirmed</h1>
							<p className="mb-10 fs-large">
								You will receive an appointment confirmation email with details of your booking.
							</p>
							<Button
								type="button"
								variant="link"
								className="fw-bold text-decoration-none"
								onClick={() => {
									navigate('/');
								}}
							>
								Go to home screen
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};
