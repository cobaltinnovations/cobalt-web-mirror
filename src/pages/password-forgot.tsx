import React, { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import HalfLayout from '@/components/half-layout';
import InputHelper from '@/components/input-helper';

const PasswordForgot: FC = () => {
	const { addFlag } = useFlags();
	const { institution } = useAccount();
	const handleError = useHandleError();
	const navigate = useNavigate();
	const [formSubmitted, setFormSubmitted] = useState(false);
	const [formValues, setFormValues] = useState({ emailAddress: '' });
	const emailAddressInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		emailAddressInputRef.current?.focus();
	}, []);

	const sendEmail = async () => {
		try {
			await accountService.sendForgotPasswordEmail(formValues.emailAddress).fetch();
			setFormSubmitted(true);

			addFlag({
				variant: 'success',
				title: 'Check your inbox',
				description: `Email sent to ${formValues.emailAddress}.`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
		}
	};

	function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		sendEmail();
	}

	const handleResendButtonClick = () => {
		sendEmail();
	};

	const handleLogInButtonClick = () => {
		navigate('/sign-in');
	};

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Forgot Password</title>
			</Helmet>

			<HalfLayout
				leftColChildren={(className) => (
					<div className={className}>
						{formSubmitted ? (
							<>
								<h1 className="mb-6 text-center">Check your inbox</h1>
								<p className="mb-8 text-center">
									Please check your email for a password reset link. Don't forget to check your spam
									folder.
								</p>
								<Button
									size="lg"
									type="button"
									variant="link"
									className="d-block w-100 text-decoration-none"
									onClick={handleResendButtonClick}
								>
									Resend
								</Button>
								<Button
									size="lg"
									type="button"
									variant="link"
									className="d-block w-100 text-decoration-none"
									onClick={handleLogInButtonClick}
								>
									Log in
								</Button>
							</>
						) : (
							<>
								<h1 className="mb-6 text-center">Forgot Password?</h1>
								<p className="mb-8 text-center">
									Enter the email address you use on {institution.name}. We'll send you a link to
									reset your password.
								</p>
								<Form onSubmit={handleFormSubmit}>
									<InputHelper
										ref={emailAddressInputRef}
										className="mb-6"
										name="emailAddress"
										type="email"
										label="Email address"
										value={formValues.emailAddress}
										onChange={({ currentTarget }) => {
											setFormValues((pv) => ({
												...pv,
												emailAddress: currentTarget.value,
											}));
										}}
										required
									/>
									<Button size="lg" type="submit" className="d-block w-100">
										Send email
									</Button>
								</Form>
							</>
						)}
					</div>
				)}
			/>
		</>
	);
};

export default PasswordForgot;
