import { queryClient } from '@/app-providers';
import ConsentContent from '@/components/consent-content';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { accountService } from '@/lib/services';
import React, { useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Consent = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const [searchParams] = useSearchParams();
	const { account, institution, signOutAndClearContext } = useAccount();

	const destinationUrl = searchParams.get('destinationUrl') ?? '/';

	useEffect(() => {
		if (!institution?.requireConsentForm) {
			navigate(destinationUrl);
		}
	}, [destinationUrl, institution?.requireConsentForm, navigate]);

	if (!institution?.requireConsentForm) {
		return null;
	}

	return (
		<>
			<ConsentContent />

			<Container className="my-6">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="d-flex flex-column align-items-center">
							{account?.consentFormAccepted ? (
								<p>
									You have already consented to use of the Cobalt platform. If you have consented in
									error or wish to revoke your consent, please contact{' '}
									<a href={`mailto:${institution?.supportEmailAddress}`}>
										{institution?.supportEmailAddress}
									</a>{' '}
									for assistance.
								</p>
							) : (
								<>
									<Button
										className="mb-4"
										onClick={() => {
											if (!account?.accountId) {
												return;
											}
											accountService
												.acceptConsent(account.accountId)
												.fetch()
												.then(() => {
													queryClient.invalidateQueries(['account', account.accountId]);
													navigate(destinationUrl, { replace: true });
												})
												.catch((e) => {
													if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
														handleError(e);
													}
												});
										}}
									>
										I Accept
									</Button>
									<Button
										variant="outline-primary"
										onClick={() => {
											signOutAndClearContext();
										}}
									>
										I Do Not Accept
									</Button>
								</>
							)}
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Consent;
