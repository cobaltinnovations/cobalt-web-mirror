import React, { FC, ReactNode, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import ConfirmDialog from '@/components/confirm-dialog';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { accountService } from '@/lib/services';
import ConsentModal from '@/components/consent-modal';

const UserSettings: FC = () => {
	const { institution, account, signOutAndClearContext } = useAccount();
	const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
	const [isViewingAgreement, setIsViewingAgreement] = useState(false);
	const [isRejectingConsent, setIsRejectingConsent] = useState(false);
	const handleError = useHandleError();

	return (
		<>
			<Helmet>
				<title>Cobalt | User Settings</title>
			</Helmet>

			<ConsentModal
				readOnly
				show={isViewingAgreement}
				onHide={() => {
					setIsViewingAgreement(false);
				}}
			/>

			<Container className="py-10 py-lg-14">
				<h2 className="mb-10">Profile</h2>

				{account?.emailAddress && (
					<ProfileSection title="Contact email">
						<p className="my-2 fs-large">{account?.emailAddress}</p>
						<p className="mb-0 text-muted">
							This is the email address that receives all communication from Cobalt including appointment
							and group session reminders.
						</p>
					</ProfileSection>
				)}

				{institution?.requireConsentForm && (
					<ProfileSection
						title="User Agreement"
						actions={
							<div className="d-flex flex-wrap align-items-center justify-content-end">
								<Button
									size="sm"
									variant="danger"
									onClick={() => {
										setShowRevokeConfirmation(true);
									}}
								>
									Revoke
								</Button>

								<Button
									size="sm"
									className="ms-2"
									variant="outline-primary"
									onClick={() => {
										setIsViewingAgreement(true);
									}}
								>
									View
								</Button>
							</div>
						}
					>
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
							isConfirming={isRejectingConsent}
							onConfirm={() => {
								if (!account?.accountId) {
									return;
								}

								setIsRejectingConsent(true);

								accountService
									.rejectConsent(account.accountId)
									.fetch()
									.then((response) => {
										signOutAndClearContext();
									})
									.catch((e) => {
										handleError(e);
									})
									.finally(() => {
										setIsRejectingConsent(false);
									});
							}}
						/>
						{account?.consentFormAcceptedDateDescription && (
							<p>Accepted: {account.consentFormAcceptedDateDescription}</p>
						)}
					</ProfileSection>
				)}
			</Container>
		</>
	);
};

interface ProfileSectionProps {
	title: string;
	actions?: ReactNode;
	children: ReactNode;
}

const ProfileSection = ({ title, actions, children }: ProfileSectionProps) => {
	return (
		<>
			<div className="d-flex">
				<div className="flex-grow-1">
					<h4>{title}</h4>
					{children}
				</div>

				{actions}
			</div>

			<hr className="my-6" />
		</>
	);
};

export default UserSettings;
