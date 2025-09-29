import React, { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import HalfLayout from '@/components/half-layout';
import useAccount from '@/hooks/use-account';

const SignUpVerify: FC = () => {
	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();
	const { institution } = useAccount();

	const locationState = (location.state as { emailAddress?: string; accountInviteId?: string }) || {};

	useEffect(() => {
		if (!locationState?.emailAddress) {
			navigate('/sign-up', { replace: true });
		}
	}, [locationState?.emailAddress, navigate]);

	async function handleResendButtonClick() {
		try {
			if (!locationState?.accountInviteId) {
				throw new Error('Could not find accountInviteId.');
			}

			await accountService.resendInvite(locationState.accountInviteId).fetch();
			window.alert('Email was sent.');
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Verify Account</title>
			</Helmet>

			<HalfLayout
				leftColChildren={(className) => {
					return (
						<div className={className}>
							<h1 className="mb-8 text-center">Check your inbox</h1>
							<p className="mb-6 text-center">
								We've sent a confirmation email to <strong>{locationState?.emailAddress}</strong>.
								Please click the link in the email to verify your account.
							</p>
							<div className="text-center">
								<Button
									variant="link"
									size="lg"
									className="d-block w-100 text-decoration-none"
									onClick={handleResendButtonClick}
								>
									Resend
								</Button>
								<Button
									variant="link"
									size="lg"
									className="d-block w-100 text-decoration-none"
									onClick={() => {
										navigate('/sign-in-email');
									}}
								>
									Log In
								</Button>
							</div>
						</div>
					);
				}}
			/>
		</>
	);
};

export default SignUpVerify;
