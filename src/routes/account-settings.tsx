import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import TabBar from '@/components/tab-bar';
import { createUseStyles } from 'react-jss';
import useAccount from '@/hooks/use-account';
import { HEADER_HEIGHT } from '@/components/header-v2';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { AccountSourceId, AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';
import ConfirmDialog from '@/components/confirm-dialog';
import ConsentModal from '@/components/consent-modal';

const useStyles = createUseStyles(() => ({
	scrollAnchor: {
		position: 'relative',
		top: -64 - HEADER_HEIGHT,
	},
}));

export async function loader() {
	return null;
}

export const Component = () => {
	const { addFlag } = useFlags();
	const { account, institution, signOutAndClearContext } = useAccount();
	const classes = useStyles();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const handleError = useHandleError();
	const [showConsentModal, setShowConsentModal] = useState(false);
	const [revokeIsLoading, setRevokeIsLoading] = useState(false);
	const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);

	const handleResetPasswordButtonClick = async () => {
		try {
			if (!account) {
				throw new Error('account is undefined.');
			}

			if (!account.emailAddress) {
				throw new Error('account.emailAddress is undefined.');
			}

			await accountService.sendForgotPasswordEmail(account.emailAddress).fetch();

			addFlag({
				variant: 'success',
				title: 'Check your inbox',
				description: `Email sent to ${account.emailAddress}.`,
				actions: [],
			});
		} catch (error) {
			handleError(error);
		}
	};

	const handleRevokeConsent = async () => {
		setRevokeIsLoading(true);

		try {
			if (!account) {
				throw new Error('account is undefined.');
			}

			await accountService.rejectConsent(account.accountId).fetch();
			signOutAndClearContext(AnalyticsNativeEventAccountSignedOutSource.CONSENT_FORM, {});
		} catch (error) {
			handleError(error);
		} finally {
			setRevokeIsLoading(false);
		}
	};

	const showEmailPasswordCard = account?.accountSourceId === AccountSourceId.EMAIL_PASSWORD;
	const showUserAgreementCard = institution.requireConsentForm;

	return (
		<>
			<Helmet>
				<title>Cobalt | Account Settings</title>
			</Helmet>

			<ConsentModal
				readOnly
				show={showConsentModal}
				onHide={() => {
					setShowConsentModal(false);
				}}
			/>

			<ConfirmDialog
				show={showRevokeConfirmation}
				onHide={() => {
					setShowRevokeConfirmation(false);
				}}
				titleText="Revoke Acceptance"
				bodyText="Are you sure you want to revoke your acceptance of the User Agreement?"
				detailText="You will be signed out of Cobalt and will not be able to sign in again until you accept the User Agreement."
				dismissText="Cancel"
				confirmText="Continue"
				isConfirming={revokeIsLoading}
				onConfirm={handleRevokeConsent}
			/>

			<Container className="py-16">
				<Row>
					<Col sm={{ span: 6, offset: 2 }}>
						{showEmailPasswordCard && (
							<>
								<div className={classes.scrollAnchor} id="sign-in" />
								<Card bsPrefix="ic-card" className="mb-8">
									<Card.Header>
										<Card.Title>Sign In</Card.Title>
									</Card.Header>
									<Card.Body>
										<h5 className="mb-4">Email Address</h5>
										<p className="mb-4">{account?.emailAddress ?? 'N/A'}</p>
										<p className="mb-6">
											If you need to change your email address, please contact{' '}
											<a href={`mailto:${institution.supportEmailAddress}`}>
												{institution.supportEmailAddress}
											</a>
										</p>
										<hr className="mb-6" />
										<h5 className="mb-4">Password</h5>
										<p className="mb-4">
											We will send a verification link to{' '}
											<a href={`mailto:${account?.emailAddress ?? 'N/A'}`}>
												{account?.emailAddress ?? 'N/A'}
											</a>
											. This update will not take place until you follow the instructions listed
											in that email.
										</p>
										<p className="mb-6">
											If you do not have access to{' '}
											<a href={`mailto:${account?.emailAddress ?? 'N/A'}`}>
												{account?.emailAddress ?? 'N/A'}
											</a>
											, please contact support for assistance.
										</p>
										<Button onClick={handleResetPasswordButtonClick}>Reset Password</Button>
									</Card.Body>
								</Card>
							</>
						)}

						{showUserAgreementCard && (
							<>
								<div className={classes.scrollAnchor} id="user-agreement" />
								<Card bsPrefix="ic-card">
									<Card.Header>
										<Card.Title>User Agreement</Card.Title>
									</Card.Header>
									<Card.Body>
										{account?.consentFormAccepted ? (
											<h5 className="mb-6">Accepted</h5>
										) : (
											<h5 className="mb-6">Not Accepted</h5>
										)}
										<p className="mb-6">
											Accepted:{' '}
											{account?.consentFormAcceptedDateDescription ??
												'Acceptance date unavailable'}
										</p>
										<div className="d-flex align-items-center">
											<Button
												variant="outline-primary"
												className="me-2"
												onClick={() => {
													setShowConsentModal(true);
												}}
											>
												View
											</Button>
											{account?.consentFormAccepted && (
												<Button
													variant="danger"
													onClick={() => {
														setShowRevokeConfirmation(true);
													}}
												>
													Revoke
												</Button>
											)}
										</div>
									</Card.Body>
								</Card>
							</>
						)}
					</Col>
					<Col sm={{ span: 2, offset: 0 }}>
						<TabBar
							key="account-settings-tab-bar"
							className="position-sticky"
							style={{ top: 64 + HEADER_HEIGHT }}
							orientation="vertical"
							value="SIGN_IN"
							tabs={[
								...(showEmailPasswordCard
									? [
											{
												title: 'Sign In',
												value: '#sign-in',
											},
									  ]
									: []),
								...(showUserAgreementCard
									? [
											{
												title: 'User Agreement',
												value: '#user-agreement',
											},
									  ]
									: []),
							]}
							onTabClick={(value) => {
								navigate(`${pathname}${value}`);
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
