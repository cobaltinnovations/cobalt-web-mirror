import React, { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { accountService } from '@/lib/services';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import HalfLayout from '@/components/half-layout';
import InputHelper from '@/components/input-helper';
import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';

const PasswordReset: FC = () => {
	const { account, signOutAndClearContext } = useAccount();
	const { addFlag } = useFlags();
	const { passwordResetToken } = useParams<{ passwordResetToken?: string }>();
	const handleError = useHandleError();
	const navigate = useNavigate();
	const [formValues, setFormValues] = useState({ password: '', confirmPassword: '' });
	const passwordInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (account) {
			signOutAndClearContext(AnalyticsNativeEventAccountSignedOutSource.ACCESS_TOKEN_EXPIRED, {}, true);
		}
	}, [account, signOutAndClearContext]);

	useEffect(() => {
		passwordInputRef.current?.focus();
	}, []);

	async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		try {
			if (!passwordResetToken) {
				throw new Error('passwordResetToken is undefined.');
			}

			await accountService
				.resetPassword({
					passwordResetToken,
					password: formValues.password,
					confirmPassword: formValues.confirmPassword,
				})
				.fetch();

			addFlag({
				variant: 'success',
				title: 'Success',
				description: 'Your password has been reset.',
				actions: [],
			});

			navigate('/sign-in');
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Reset Password</title>
			</Helmet>

			<HalfLayout
				leftColChildren={(className: string) => (
					<div className={className}>
						<h1 className="mb-6 text-center">Reset your password</h1>
						<p className="mb-8 text-center">Enter a new password below.</p>
						<Form onSubmit={handleFormSubmit}>
							<InputHelper
								ref={passwordInputRef}
								className="mb-4"
								name="password"
								type="password"
								label="New password"
								helperText="Use at least 8 characters and one number"
								value={formValues.password}
								onChange={({ currentTarget }) => {
									setFormValues((pv) => ({
										...pv,
										password: currentTarget.value,
									}));
								}}
								required
							/>
							<InputHelper
								className="mb-6"
								name="confirmPassword"
								type="password"
								label="Confirm new password"
								value={formValues.confirmPassword}
								onChange={({ currentTarget }) => {
									setFormValues((pv) => ({
										...pv,
										confirmPassword: currentTarget.value,
									}));
								}}
								required
							/>
							<Button size="lg" type="submit" className="d-block w-100">
								Reset Password
							</Button>
						</Form>
					</div>
				)}
			/>
		</>
	);
};

export default PasswordReset;
