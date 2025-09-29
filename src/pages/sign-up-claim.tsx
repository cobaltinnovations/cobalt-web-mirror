import React, { FC, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { accountService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import HalfLayout from '@/components/half-layout';
import useAccount from '@/hooks/use-account';

const SignUpClaim: FC = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
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
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Claim Account</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				<HalfLayout
					leftColChildren={(className) => {
						return (
							<div className={className}>
								{inviteExpired ? (
									<h1 className="mb-8 text-center">Account verification email has expired.</h1>
								) : (
									<h1 className="mb-8 text-center">Account successfully verified.</h1>
								)}

								{inviteExpired ? (
									<p className="mb-6 text-center">
										You will need to create an account again in order to continue.
									</p>
								) : (
									<p className="mb-6 text-center">
										You're all set! please let us know if you need anything.
									</p>
								)}

								{inviteExpired ? (
									<Button
										variant="link"
										size="lg"
										className="d-block w-100 text-decoration-none"
										onClick={() => {
											navigate('/sign-up');
										}}
									>
										Create account
									</Button>
								) : (
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
								)}
							</div>
						);
					}}
				/>
			</AsyncPage>
		</>
	);
};

export default SignUpClaim;
