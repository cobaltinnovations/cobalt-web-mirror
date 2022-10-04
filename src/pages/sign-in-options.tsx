import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';

import { accountService, institutionService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { AccountSource } from '@/lib/models';
import useSubdomain from '@/hooks/use-subdomain';
import useTrackModalView from '@/hooks/use-track-modal-view';
import Cookies from 'js-cookie';

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
	illustration: {
		height: 'auto',
		maxWidth: '100%',
	},
}));

const SignInOptions = () => {
	const subdomain = useSubdomain();
	const handleError = useHandleError();
	const { accountSources, institution, processAccessToken } = useAccount();
	const classes = useSignInStyles();

	const [searchParams] = useSearchParams();
	const accountSourceId = searchParams.get('accountSourceId');

	// SSO
	const [ssoModalIsOpen, setSsoModalIsOpen] = useState(false);
	const [ssoOptions, setSsoOptions] = useState<AccountSource[]>([]);
	const [ssoSelectValue, setSsoSelectValue] = useState<string>('');

	// Sign In
	const [signInForm, setSignInForm] = useState({
		emailAddress: '',
		password: '',
	});

	// Forgot Password
	const [forgotPasswordModalIsOpen, setForgotPasswordModalIsOpen] = useState(false);
	const [forgotPasswordEmailAddress, setForgotPasswordEmailAddress] = useState('');

	async function handleSsoModelEnter() {
		try {
			const { accountSources } = await institutionService
				.getAccountSources({
					...(subdomain && { subdomain }),
					...(accountSourceId && { accountSourceId }),
				})
				.fetch();

			const firstAccountSource = accountSources[0];

			if (accountSources.length === 1) {
				if (firstAccountSource.ssoUrl) {
					window.location.href = firstAccountSource.ssoUrl;
				}

				return;
			}

			setSsoOptions(accountSources);
			setSsoSelectValue(firstAccountSource.accountSourceId);
		} catch (error) {
			handleError(error);
		}
	}

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

	useTrackModalView('AccountSourceModal', ssoModalIsOpen);
	useTrackModalView('ForgotPasswordModal', forgotPasswordModalIsOpen);

	return (
		<>
			<Modal
				show={ssoModalIsOpen}
				onHide={() => {
					setSsoModalIsOpen(false);
				}}
				onEntering={handleSsoModelEnter}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Select Account Type</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<InputHelper
						label="Sign in with..."
						value={ssoSelectValue}
						as="select"
						onChange={({ currentTarget }) => {
							setSsoSelectValue(currentTarget.value);
						}}
						required
					>
						{ssoOptions.map((option) => {
							return (
								<option key={option.accountSourceId} value={option.accountSourceId}>
									{option.description}
								</option>
							);
						})}
					</InputHelper>
				</Modal.Body>
				<Modal.Footer>
					<div className="text-right">
						<Button
							variant="outline-primary"
							onClick={() => {
								setSsoModalIsOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button
							className="ms-2"
							variant="primary"
							onClick={() => {
								const option = ssoOptions.find((o) => o.accountSourceId === ssoSelectValue);

								if (!option) {
									return;
								}

								Cookies.set('ssoRedirectUrl', Cookies.get('authRedirectUrl') || '/');

								if (option.ssoUrl) {
									window.location.href = option.ssoUrl;
								}
							}}
						>
							Continue
						</Button>
					</div>
				</Modal.Footer>
			</Modal>

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
						<p className="mb-4">A password reset link will be sent to your email.</p>
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
							<Button
								variant="outline-primary"
								onClick={() => {
									setForgotPasswordModalIsOpen(false);
								}}
							>
								Cancel
							</Button>
							<Button className="ms-2" variant="primary" type="submit">
								Submit
							</Button>
						</div>
					</Modal.Footer>
				</Form>
			</Modal>

			<Container fluid className={classes.signInOuter}>
				<Container className={classes.signIn}>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h1 className="mb-4 text-center">Sign in to Cobalt</h1>

							{institution?.ssoEnabled && (
								<div className="mb-6 text-center">
									<Button
										className="w-100 d-block"
										variant="primary"
										onClick={() => {
											if (accountSources && accountSources.length === 1) {
												const firstAccountSource = accountSources[0];
												Cookies.set('ssoRedirectUrl', Cookies.get('authRedirectUrl') || '/');

												if (firstAccountSource.ssoUrl) {
													window.location.href = firstAccountSource.ssoUrl;
												}
											} else {
												setSsoModalIsOpen(true);
											}
										}}
									>
										Continue with SSO
									</Button>
								</div>
							)}

							{institution?.ssoEnabled && institution?.emailEnabled && (
								<div className="mb-6 d-flex align-items-center">
									<hr className="flex-grow-1" />
									<p className="m-0 px-4 flex-shrink-0">or</p>
									<hr className="flex-grow-1" />
								</div>
							)}

							{institution?.emailEnabled && (
								<>
									<Form className="mb-6" onSubmit={handleSignInFormSubmit}>
										<InputHelper
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
												className="p-0"
												variant="link"
												onClick={() => {
													setForgotPasswordModalIsOpen(true);
												}}
											>
												Forgot Password?
											</Button>
										</div>
										<Button type="submit" className="w-100 d-block" variant="outline-primary">
											Sign In
										</Button>
									</Form>
								</>
							)}
							{institution?.emailSignupEnabled && (
								<p className="text-center">
									Don't have an account? <Link to="/sign-up">Create account</Link>
								</p>
							)}
						</Col>
					</Row>
				</Container>
			</Container>
		</>
	);
};

export default SignInOptions;
