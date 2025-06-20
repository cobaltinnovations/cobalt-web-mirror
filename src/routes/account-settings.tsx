import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import TabBar from '@/components/tab-bar';
import { createUseStyles } from 'react-jss';
import useAccount from '@/hooks/use-account';
import { HEADER_HEIGHT } from '@/components/header-v2';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseStyles(() => ({
	scrollAnchor: {
		position: 'relative',
		top: -64 - HEADER_HEIGHT,
	},
}));

export async function loader() {
	return null;
}

export const Component = () => {
	const { addFlag } = useFlags();
	const { account, institution } = useAccount();
	const classes = useStyles();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const handleError = useHandleError();

	const handleResetPasswordButtonClick = async () => {
		try {
			if (!account) {
				throw new Error('account is undefined.');
			}

			if (!account.emailAddress) {
				throw new Error('account.emailAddress is undefined.');
			}

			await accountService.sendForgotPasswordEmail(account.emailAddress).fetch();

			addFlag({
				variant: 'success',
				title: 'Check your inbox',
				description: `Email sent to ${account.emailAddress}.`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<>
			<Helmet>
				<title>Cobalt | Account Settings</title>
			</Helmet>

			<Container className="py-16">
				<Row>
					<Col sm={{ span: 6, offset: 2 }}>
						<div className={classes.scrollAnchor} id="sign-in" />
						<Card bsPrefix="ic-card" className="mb-8">
							<Card.Header>
								<Card.Title>Sign In</Card.Title>
							</Card.Header>
							<Card.Body>
								<h5 className="mb-4">Email Address</h5>
								<p className="mb-4">{account?.emailAddress ?? 'N/A'}</p>
								<p className="mb-6">
									If you need to change your email address, please contact{' '}
									<a href={`mailto:${institution.supportEmailAddress}`}>
										{institution.supportEmailAddress}
									</a>
								</p>
								<hr className="mb-6" />
								<h5 className="mb-4">Password</h5>
								<p className="mb-4">
									We will send a verification link to{' '}
									<a href={`mailto:${account?.emailAddress ?? 'N/A'}`}>
										{account?.emailAddress ?? 'N/A'}
									</a>
									. This update will not take place until you follow the instructions listed in that
									email.
								</p>
								<p className="mb-6">
									If you do not have access to{' '}
									<a href={`mailto:${account?.emailAddress ?? 'N/A'}`}>
										{account?.emailAddress ?? 'N/A'}
									</a>
									, please contact support for assistance.
								</p>
								<Button onClick={handleResetPasswordButtonClick}>Reset Password</Button>
							</Card.Body>
						</Card>

						<div className={classes.scrollAnchor} id="user-agreement" />
						<Card bsPrefix="ic-card">
							<Card.Header>
								<Card.Title>User Agreement</Card.Title>
							</Card.Header>
							<Card.Body>
								<h5 className="mb-6">Accepted</h5>
								<p className="mb-6">Accepted: December 20, 2022, 2:24 PM</p>
								<div className="d-flex align-items-center">
									<Button variant="outline-primary" className="me-2">
										View
									</Button>
									<Button variant="danger">Revoke</Button>
								</div>
							</Card.Body>
						</Card>
					</Col>
					<Col sm={{ span: 2, offset: 0 }}>
						<TabBar
							key="account-settings-tab-bar"
							className="position-sticky"
							style={{ top: 64 + HEADER_HEIGHT }}
							orientation="vertical"
							value="SIGN_IN"
							tabs={[
								{
									title: 'Sign In',
									value: '#sign-in',
								},
								{
									title: 'User Agreement',
									value: '#user-agreement',
								},
							]}
							onTabClick={(value) => {
								navigate(`${pathname}${value}`);
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
