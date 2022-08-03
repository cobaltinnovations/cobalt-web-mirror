import React, { FC, useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
import AsyncPage from '@/components/async-page';
import { accountService } from '@/lib/services';

const SignUpClaim: FC = () => {
	useHeaderTitle(null);
	const { accountInviteId } = useParams<{ accountInviteId?: string }>();
	const [inviteExpired, setInviteExpired] = useState(false);

	const fetchData = useCallback(async () => {
		if (!accountInviteId) {
			return;
		}

		const response = await accountService.claimInvite(accountInviteId).fetch();
		setInviteExpired(response.inviteExpired);
	}, [accountInviteId]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="pt-4 pb-4">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{inviteExpired ? (
							<p className="mb-6 text-center">Account verification email has expired.</p>
						) : (
							<p className="mb-6 text-center">Account successfully verified.</p>
						)}

						{inviteExpired ? (
							<p className="mb-0 text-center fw-bold">
								You will need to sign up again in order to continue.
							</p>
						) : (
							<p className="mb-0 text-center fw-bold">
								You're all set! please let us know if you need anything.
							</p>
						)}

						{inviteExpired ? (
							<div className="text-center">
								<Link to="/sign-up">Sign Up</Link>
							</div>
						) : (
							<div className="text-center">
								<Link to="/sign-in-email">Sign In</Link>
							</div>
						)}
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default SignUpClaim;
