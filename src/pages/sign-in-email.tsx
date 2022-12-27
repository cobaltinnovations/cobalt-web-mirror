import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';

import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useSignInStyles = createUseThemedStyles((theme) => ({
	signInOuter: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
	signIn: {
		paddingTop: 96,
		[mediaQueries.lg]: {
			paddingTop: 32,
		},
	},
	signInInner: {
		maxWidth: 408,
		margin: '0 auto',
	},
}));

const SignInEmail = () => {
	const handleError = useHandleError();
	const { institution, processAccessToken } = useAccount();
	const classes = useSignInStyles();

	// Sign In
	const [signInForm, setSignInForm] = useState({
		emailAddress: '',
		password: '',
	});

	// Forgot Password
	const [forgotPasswordModalIsOpen, setForgotPasswordModalIsOpen] = useState(false);
	const [forgotPasswordEmailAddress, setForgotPasswordEmailAddress] = useState('');

	async function handleSignInFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		try {
			const { accessToken, destinationUrl } = await accountService
				.getAccessToken({
					emailAddress: signInForm.emailAddress,
					password: signInForm.password,
				})
				.fetch();

			if (destinationUrl) {
				window.location.href = destinationUrl;
				return;
			}

			processAccessToken(accessToken);
		} catch (error) {
			handleError(error);
		}
	}

	async function handleForgotPasswordFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		try {
			await accountService.sendForgotPasswordEmail(forgotPasswordEmailAddress).fetch();

			setForgotPasswordModalIsOpen(false);
			window.alert('Email sent!');
		} catch (error) {
			handleError(error);
		}
	}

	useTrackModalView('ForgotPasswordModal', forgotPasswordModalIsOpen);

	return (
		<>
			<Modal
				show={forgotPasswordModalIsOpen}
				onHide={() => {
					setForgotPasswordModalIsOpen(false);
				}}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Password Reset</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleForgotPasswordFormSubmit}>
					<Modal.Body>
						<p className="mb-4">We will send you an email to reset your password.</p>
						<InputHelper
							label="Email address"
							type="email"
							value={forgotPasswordEmailAddress}
							onChange={({ currentTarget }) => {
								setForgotPasswordEmailAddress(currentTarget.value);
							}}
							required
						/>
					</Modal.Body>
					<Modal.Footer>
						<div className="text-right">
							<Button variant="primary" type="submit">
								Send Email
							</Button>
						</div>
					</Modal.Footer>
				</Form>
			</Modal>

			<Container fluid className={classes.signInOuter}>
				<Container className={classes.signIn}>
					<Row>
						<Col>
							<div className={classes.signInInner}>
								<h1 className="mb-10 text-center">Sign in with Email</h1>

								<Form className="mb-6" onSubmit={handleSignInFormSubmit}>
									<InputHelper
										data-testid="signInEmailAddressInput"
										className="mb-2"
										label="Email address"
										type="email"
										value={signInForm.emailAddress}
										onChange={({ currentTarget }) => {
											setSignInForm((previousValues) => ({
												...previousValues,
												emailAddress: currentTarget.value,
											}));
										}}
										required
									/>
									<InputHelper
										data-testid="signInPasswordInput"
										className="mb-4"
										label="Password"
										type="password"
										value={signInForm.password}
										onChange={({ currentTarget }) => {
											setSignInForm((previousValues) => ({
												...previousValues,
												password: currentTarget.value,
											}));
										}}
										required
									/>
									<div className="mb-6 text-right">
										<Button
											data-testid="signInForgotPasswordButton"
											className="p-0"
											variant="link"
											onClick={() => {
												setForgotPasswordModalIsOpen(true);
											}}
										>
											Forgot Password?
										</Button>
									</div>
									<Button
										data-testid="signInSubmitButton"
										type="submit"
										className="w-100 d-block"
										variant="primary"
									>
										Sign In
									</Button>
								</Form>

								{institution?.emailSignupEnabled && (
									<p className="text-center">
										Don't have an account? <Link to="/sign-up">Create account</Link>
									</p>
								)}
							</div>
						</Col>
					</Row>
				</Container>
			</Container>
		</>
	);
};

export default SignInEmail;
