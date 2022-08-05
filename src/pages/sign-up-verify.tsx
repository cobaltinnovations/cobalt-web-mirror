import React, { FC, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const SignUpVerify: FC = () => {
	const handleError = useHandleError();
	const location = useLocation();
	const navigate = useNavigate();

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
		<Container className="pt-4 pb-4">
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<p className="mb-6 text-center">
						We sent a link to {locationState?.emailAddress}. Please follow this link to verify your account.
					</p>
					<p className="mb-0 text-center fw-bold">didn’t get an email?</p>
					<div className="text-center">
						<Button variant="link" onClick={handleResendButtonClick}>
							re-send
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default SignUpVerify;
