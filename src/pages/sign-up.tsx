import React, { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import HalfLayout from '@/components/half-layout';
import InputHelper from '@/components/input-helper';
import { useAppRootLoaderData } from '@/routes/root';
import useAccount from '@/hooks/use-account';

const SignUp: FC = () => {
	const { subdomain } = useAppRootLoaderData();
	const handleError = useHandleError();
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [formValues, setFormValues] = useState({ emailAddress: '', password: '' });

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const { accountInviteId } = await accountService
				.inviteAccount({
					subdomain,
					accountSourceId: 'EMAIL_PASSWORD',
					emailAddress: formValues.emailAddress,
					password: formValues.password,
				})
				.fetch();

			navigate('/sign-up-verify', {
				state: {
					emailAddress: formValues.emailAddress,
					accountInviteId,
				},
			});
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Create Account</title>
			</Helmet>

			<HalfLayout
				leftColChildren={(className) => {
					return (
						<div className={className}>
							<h1 className="mb-8 text-center">Create Account</h1>
							<Form className="mb-6" onSubmit={handleFormSubmit}>
								<InputHelper
									className="mb-4"
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
								<InputHelper
									className="mb-6"
									name="password"
									type="password"
									label="Create your password"
									helperText="8+ characters, including a number"
									value={formValues.password}
									onChange={({ currentTarget }) => {
										setFormValues((pv) => ({
											...pv,
											password: currentTarget.value,
										}));
									}}
									required
								/>
								<Button size="lg" type="submit" className="d-block w-100">
									Create Account
								</Button>
							</Form>
							<p className="text-center">
								Already have an account? <Link to="/sign-in/email">Sign In</Link>
							</p>
						</div>
					);
				}}
			/>
		</>
	);
};

export default SignUp;
