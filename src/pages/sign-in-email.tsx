import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { AnalyticsNativeEventTypeId } from '@/lib/models';
import { accountService, analyticsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import HalfLayout from '@/components/half-layout';
import InputHelper from '@/components/input-helper';
import { ReactComponent as Illustration } from '@/assets/illustrations/sign-in.svg';

const SignInEmail = () => {
	const handleError = useHandleError();
	const { institution } = useAccount();
	const navigate = useNavigate();

	const autofocusCheckComplete = useRef(false);
	const emailAddressInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);

	// Sign In
	const [signInForm, setSignInForm] = useState({
		emailAddress: '',
		password: '',
	});

	useEffect(() => {
		if (autofocusCheckComplete.current) {
			return;
		}

		if (!signInForm.emailAddress) {
			emailAddressInputRef.current?.focus();
		} else if (!signInForm.password) {
			passwordInputRef.current?.focus();
		}

		autofocusCheckComplete.current = true;

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_SIGN_IN_EMAIL);
	}, [signInForm.emailAddress, signInForm.password]);

	async function handleSignInFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		try {
			const { accessToken, destinationUrl } = await accountService
				.getEmailPasswordAccessToken({
					emailAddress: signInForm.emailAddress,
					password: signInForm.password,
				})
				.fetch();

			if (destinationUrl) {
				window.location.href = destinationUrl;
				return;
			}

			navigate({
				pathname: '/auth',
				search: `?accessToken=${accessToken}`,
			});
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Sign In</title>
			</Helmet>

			<HalfLayout
				leftColChildren={(className) => (
					<div className={className}>
						<h1 className="mb-8 text-center">Sign in with email</h1>
						<Form onSubmit={handleSignInFormSubmit}>
							<InputHelper
								ref={emailAddressInputRef}
								className="mb-4"
								name="emailAddress"
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
								ref={passwordInputRef}
								className="mb-4"
								name="password"
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
									className="p-0 text-decoration-none fw-normal"
									variant="link"
									onClick={() => {
										navigate('/forgot-password');
									}}
								>
									Forgot Password?
								</Button>
							</div>
							<Button size="lg" type="submit" className="d-block w-100">
								Sign in
							</Button>
						</Form>
						{institution?.emailSignupEnabled && (
							<p className="text-center">
								Don't have an account? <Link to="/sign-up">Create account</Link>
							</p>
						)}
					</div>
				)}
				rightColChildren={(className: string) => <Illustration className={className} />}
			/>
		</>
	);
};

export default SignInEmail;
