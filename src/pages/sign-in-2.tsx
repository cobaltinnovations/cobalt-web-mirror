import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';

import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

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

const SignIn2 = () => {
	const handleError = useHandleError();
	const { accountSources, subdomainInstitution } = useAccount();
	const classes = useSignInStyles();
	const history = useHistory();

	const [signInForm, setSignInForm] = useState({
		emailAddress: '',
		password: '',
	});

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

			history.replace({
				pathname: '/auth',
				search: '?' + new URLSearchParams({ accessToken }).toString(),
			});
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<Container fluid className={classes.signInOuter}>
			<Container className={classes.signIn}>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3 className="mb-4 text-center">Sign in to Cobalt</h3>

						{subdomainInstitution?.ssoEnabled && (
							<>
								<div className="mb-6 text-center">
									<Button
										className="w-100 d-block"
										variant="primary"
										onClick={() => {
											if (accountSources && accountSources.length === 1) {
												const firstAccountSource = accountSources[0];
												window.location.href = firstAccountSource.ssoUrl;
											} else {
												history.push('/sign-in-sso');
											}
										}}
									>
										Continue with SSO
									</Button>
								</div>
								<div className="mb-6 d-flex align-items-center">
									<hr className="flex-grow-1" />
									<p className="m-0 px-4 flex-shrink-0">or</p>
									<hr className="flex-grow-1" />
								</div>
							</>
						)}

						{subdomainInstitution?.emailEnabled && (
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
										<Link to="/forgot-password">Forgot Password?</Link>
									</div>
									<Button type="submit" className="w-100 d-block" variant="outline-primary">
										Sign in
									</Button>
								</Form>
								<p className="text-center">
									Don't have an account? <Link to="/sign-up">Sign up</Link>
								</p>
							</>
						)}
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default SignIn2;
