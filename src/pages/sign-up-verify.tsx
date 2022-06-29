import React, { FC, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const SignUpVerify: FC = () => {
	const handleError = useHandleError();
	useHeaderTitle(null);
	const history = useHistory<{ emailAddress?: string; accountInviteId?: string }>();

	useEffect(() => {
		if (!history.location.state?.emailAddress) {
			history.replace('/sign-up');
		}
	}, [history]);

	async function handleResendButtonClick() {
		try {
			if (!history.location.state?.accountInviteId) {
				throw new Error('Could not find accountInviteId.');
			}

			await accountService.resendInvite(history.location.state.accountInviteId).fetch();
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
						We sent a link to {history.location.state?.emailAddress}. Please follow this link to verify your
						account.
					</p>
					<p className="mb-0 text-center font-body-bold">didn’t get an email?</p>
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
